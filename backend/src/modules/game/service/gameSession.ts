import type { Prisma } from '@prisma/client';

import { prisma } from '../../../app/config/prisma';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../shared/errors';
import { logger } from '../../../app/logger';
import { matchSettlement, type SettlementSummary } from './matchSettlement';
import {
  applyShot,
  createInitialState,
  type ApplyShotResult,
  type GameState,
  type MatchType,
  type ShotOutcome,
} from '../engine';

/**
 * In-memory authoritative game states keyed by roomId. Persisted to
 * Match.state after every change so a server restart / reconnection can resume.
 */
const sessions = new Map<string, GameState>();

/** Seconds a player has to take their shot before the turn auto-passes. */
export const TURN_MS = 20_000;

export type ShotResult = ApplyShotResult & { settlement?: SettlementSummary | null };

const matchTypeFor = (maxPlayers: number): MatchType => (maxPlayers >= 4 ? '2v2' : '1v1');

/** Loads the room with its active (pending/ongoing) match + seated players. */
const loadRoom = (roomId: string) =>
  prisma.gameRoom.findUnique({
    where: { id: roomId },
    include: {
      matches: {
        where: { status: { in: ['PENDING', 'ONGOING'] } },
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          players: {
            orderBy: { seat: 'asc' },
            include: { user: { select: { username: true } } },
          },
        },
      },
    },
  });

export const gameSession = {
  /** Marks a player ready; returns readiness summary. */
  async setReady(roomId: string, userId: string, ready: boolean) {
    const room = await loadRoom(roomId);
    const match = room?.matches[0];
    if (!room || !match) throw new NotFoundError('Room/match not found');
    const me = match.players.find((p) => p.userId === userId);
    if (!me) throw new ForbiddenError('Not a player in this room');

    await prisma.matchPlayer.update({ where: { id: me.id }, data: { isReady: ready } });
    const players = match.players.map((p) => ({
      ...p,
      isReady: p.userId === userId ? ready : p.isReady,
    }));
    const allReady = players.length === room.maxPlayers && players.every((p) => p.isReady);
    return { players, allReady, matchType: matchTypeFor(room.maxPlayers) };
  },

  /** Initializes the authoritative game state and flips the match to ONGOING. */
  async startMatch(roomId: string): Promise<GameState> {
    const room = await loadRoom(roomId);
    const match = room?.matches[0];
    if (!room || !match) throw new NotFoundError('Room/match not found');
    if (match.players.length < 2) throw new BadRequestError('Need at least 2 players');

    const seats = match.players.map((p) => p.userId);
    const names: Record<string, string> = {};
    for (const p of match.players) names[p.userId] = p.user?.username ?? p.userId;
    const state = createInitialState(
      match.id,
      room.mode,
      matchTypeFor(room.maxPlayers),
      seats,
      names,
    );
    state.turn.deadline = Date.now() + TURN_MS;

    await prisma.$transaction([
      prisma.match.update({
        where: { id: match.id },
        data: {
          status: 'ONGOING',
          startedAt: new Date(),
          state: state as unknown as Prisma.InputJsonValue,
        },
      }),
      prisma.gameRoom.update({ where: { id: room.id }, data: { status: 'IN_PROGRESS' } }),
    ]);

    sessions.set(roomId, state);
    return state;
  },

  /** Returns the live state (memory first, else rehydrate from Match.state). */
  async getState(roomId: string): Promise<GameState | null> {
    const cached = sessions.get(roomId);
    if (cached) return cached;
    const room = await loadRoom(roomId);
    const match = room?.matches[0];
    if (!match?.state) return null;
    const state = match.state as unknown as GameState;
    sessions.set(roomId, state);
    return state;
  },

  /** Validates and applies a player's settled shot to the authoritative state. */
  async applyPlayerShot(roomId: string, userId: string, outcome: ShotOutcome): Promise<ShotResult> {
    const state = await this.getState(roomId);
    if (!state) throw new NotFoundError('No active match');
    if (state.status !== 'ACTIVE') throw new BadRequestError('Match is not active');
    if (!state.players[userId]) throw new ForbiddenError('Not a player in this match');
    if (state.turn.currentPlayer !== userId) throw new ForbiddenError('Not your turn');

    return this.commitResult(roomId, applyShot(state, userId, outcome));
  },

  /**
   * Auto-passes the turn when the current player runs out of time. No-op if the
   * turn already moved on (stale timer). Returns the timed-out player + result.
   */
  async timeoutTurn(
    roomId: string,
    expectedPlayer: string,
  ): Promise<{ player: string; result: ShotResult } | null> {
    const state = await this.getState(roomId);
    if (!state || state.status !== 'ACTIVE') return null;
    if (state.turn.currentPlayer !== expectedPlayer) return null; // already moved on
    // An empty outcome scores nothing and never grants an extra turn → turn passes.
    const result = applyShot(state, expectedPlayer, {
      pocketedCoinIds: [],
      strikerPocketed: false,
    });
    return { player: expectedPlayer, result: await this.commitResult(roomId, result) };
  },

  /** Persists a freshly applied result, stamps the turn deadline, settles on finish. */
  async commitResult(roomId: string, result: ApplyShotResult): Promise<ShotResult> {
    if (result.state.status === 'ACTIVE') result.state.turn.deadline = Date.now() + TURN_MS;
    sessions.set(roomId, result.state);

    const data: Record<string, unknown> = { state: result.state as unknown };
    if (result.state.status === 'FINISHED') {
      data.status = 'FINISHED';
      data.finishedAt = new Date();
      const winnerTeam = result.state.winnerTeam;
      if (winnerTeam) data.winnerId = result.state.teams[winnerTeam].members[0] ?? null;
    }
    await prisma.match.update({
      where: { id: result.state.matchId },
      data: data as Prisma.MatchUpdateInput,
    });

    let settlement: SettlementSummary | null = null;
    if (result.state.status === 'FINISHED') {
      await prisma.gameRoom.update({ where: { id: roomId }, data: { status: 'FINISHED' } });
      // Settle rewards/stats/leaderboard; never let it break the broadcast.
      try {
        settlement = await matchSettlement.settle(result.state);
      } catch (e) {
        logger.error('match settlement failed', {
          matchId: result.state.matchId,
          error: (e as Error).message,
        });
      }
      sessions.delete(roomId);
    }
    return { ...result, settlement };
  },

  /** True if the user is a seated player in this room's active match. */
  async isPlayer(roomId: string, userId: string): Promise<boolean> {
    const state = await this.getState(roomId);
    return !!state && state.status === 'ACTIVE' && !!state.players[userId];
  },

  /** Flags a player's socket connection on the active match. */
  async setConnected(roomId: string, userId: string, connected: boolean): Promise<void> {
    const room = await loadRoom(roomId);
    const match = room?.matches[0];
    if (!match) return;
    await prisma.matchPlayer.updateMany({
      where: { matchId: match.id, userId },
      data: { isConnected: connected },
    });
  },

  /** Ends the match in favour of the opponent team when a player abandons. */
  async forfeit(
    roomId: string,
    leaverUserId: string,
  ): Promise<{ state: GameState; settlement: SettlementSummary | null } | null> {
    const state = await this.getState(roomId);
    if (!state || state.status !== 'ACTIVE') return null;
    const leaverTeam = state.players[leaverUserId]?.teamId;
    if (!leaverTeam) return null;
    const winnerTeam = leaverTeam === 'A' ? 'B' : 'A';

    const finished: GameState = structuredClone(state);
    finished.status = 'FINISHED';
    finished.winnerTeam = winnerTeam;
    finished.turn.phase = 'FINISHED';
    finished.turn.deadline = 0;
    sessions.set(roomId, finished);

    await prisma.match.update({
      where: { id: finished.matchId },
      data: {
        status: 'ABANDONED',
        finishedAt: new Date(),
        winnerId: finished.teams[winnerTeam].members[0] ?? null,
        state: finished as unknown as Prisma.InputJsonValue,
      },
    });
    await prisma.gameRoom.update({ where: { id: roomId }, data: { status: 'FINISHED' } });
    let settlement: SettlementSummary | null = null;
    try {
      settlement = await matchSettlement.settle(finished);
    } catch (e) {
      logger.error('forfeit settlement failed', {
        matchId: finished.matchId,
        error: (e as Error).message,
      });
    }
    sessions.delete(roomId);
    return { state: finished, settlement };
  },
};
