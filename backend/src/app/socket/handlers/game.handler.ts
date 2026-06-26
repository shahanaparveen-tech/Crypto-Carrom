import { SOCKET_EVENTS, SOCKET_ROOMS } from '../events';
import { logger } from '../../logger';
import type { TypedServer, TypedSocket } from '../types';
import { gameSession } from '../../../modules/game/service/gameSession';
import type { GameState } from '../../../modules/game/engine';
import type { SettlementSummary } from '../../../modules/game/service/matchSettlement';

const errMsg = (e: unknown): string => (e instanceof Error ? e.message : 'Game error');

/** Reconnection grace window before a disconnected player forfeits. */
const GRACE_MS = 45_000;

/** socketId → rooms it joined (for disconnect cleanup). */
const joinedRooms = new Map<string, Set<string>>();
/** `${roomId}:${userId}` → pending forfeit timer. */
const graceTimers = new Map<string, ReturnType<typeof setTimeout>>();
/** roomId → pending turn-timeout timer (auto-pass when a player stalls). */
const turnTimers = new Map<string, ReturnType<typeof setTimeout>>();

const clearTurnTimer = (roomId: string): void => {
  const t = turnTimers.get(roomId);
  if (t) {
    clearTimeout(t);
    turnTimers.delete(roomId);
  }
};

/** Emits the end-of-match summary (winner + rewards) to the room. */
const emitGameOver = (
  io: TypedServer,
  roomId: string,
  state: GameState,
  settlement: SettlementSummary | null | undefined,
): void => {
  if (!state.winnerTeam) return;
  io.to(SOCKET_ROOMS.game(roomId)).emit(SOCKET_EVENTS.GAME_OVER, {
    roomId,
    winnerTeam: state.winnerTeam,
    durationSec: settlement?.durationSec ?? 0,
    rewards: settlement?.rewards ?? {},
  });
};

/** (Re)arms the 20s turn-timeout for the room's current player. */
const armTurnTimer = (io: TypedServer, roomId: string, state: GameState): void => {
  clearTurnTimer(roomId);
  if (state.status !== 'ACTIVE' || !state.turn.deadline) return;
  const player = state.turn.currentPlayer;
  const ms = Math.max(0, state.turn.deadline - Date.now()) + 100;
  const timer = setTimeout(() => {
    void (async () => {
      turnTimers.delete(roomId);
      try {
        const res = await gameSession.timeoutTurn(roomId, player);
        if (!res) return;
        io.to(SOCKET_ROOMS.game(roomId)).emit(SOCKET_EVENTS.GAME_SHOT, {
          roomId,
          shooter: res.player,
          inputs: undefined, // no replay — a timed-out turn just passes
          events: res.result.events,
          state: res.result.state,
        });
        if (res.result.state.status === 'FINISHED') {
          emitGameOver(io, roomId, res.result.state, res.result.settlement);
        } else {
          armTurnTimer(io, roomId, res.result.state);
        }
      } catch (e) {
        logger.debug('turn timeout failed', { roomId, error: errMsg(e) });
      }
    })();
  }, ms);
  turnTimers.set(roomId, timer);
};

/**
 * Authoritative game-session transport. Validates membership/turn server-side
 * and drives the rule engine; clients only render the broadcast results.
 * Handles reconnection (pause → resume / grace-timer forfeit) and spectators
 * (anyone may join the channel; only seated players may ready/shoot).
 */
export const registerGameHandlers = (io: TypedServer, socket: TypedSocket): void => {
  const { userId } = socket.data;

  socket.on(SOCKET_EVENTS.GAME_JOIN, async ({ roomId }, ack) => {
    try {
      await socket.join(SOCKET_ROOMS.game(roomId));
      const set = joinedRooms.get(socket.id) ?? new Set<string>();
      set.add(roomId);
      joinedRooms.set(socket.id, set);

      void gameSession.setConnected(roomId, userId, true);

      // Cancel a pending forfeit + tell the room the player is back.
      const key = `${roomId}:${userId}`;
      const timer = graceTimers.get(key);
      if (timer) {
        clearTimeout(timer);
        graceTimers.delete(key);
        io.to(SOCKET_ROOMS.game(roomId)).emit(SOCKET_EVENTS.GAME_RESUMED, { roomId, userId });
      }

      const state = await gameSession.getState(roomId);
      if (state) socket.emit(SOCKET_EVENTS.GAME_STATE, { roomId, state });
      ack?.({ success: true });
    } catch (e) {
      ack?.({ success: false, error: errMsg(e) });
    }
  });

  socket.on(SOCKET_EVENTS.GAME_READY, async ({ roomId, ready }, ack) => {
    try {
      const { allReady } = await gameSession.setReady(roomId, userId, ready);
      io.to(SOCKET_ROOMS.game(roomId)).emit(SOCKET_EVENTS.ROOM_UPDATED, {
        roomId,
        state: { ready: { userId, ready } },
      });
      if (allReady) {
        const state = await gameSession.startMatch(roomId);
        io.to(SOCKET_ROOMS.game(roomId)).emit(SOCKET_EVENTS.GAME_START, { roomId, state });
        armTurnTimer(io, roomId, state);
      }
      ack?.({ success: true });
    } catch (e) {
      ack?.({ success: false, error: errMsg(e) });
    }
  });

  socket.on(SOCKET_EVENTS.GAME_SHOT, async ({ roomId, outcome, inputs }, ack) => {
    try {
      const result = await gameSession.applyPlayerShot(roomId, userId, outcome);
      io.to(SOCKET_ROOMS.game(roomId)).emit(SOCKET_EVENTS.GAME_SHOT, {
        roomId,
        shooter: userId,
        inputs,
        events: result.events,
        state: result.state,
      });
      if (result.state.status === 'FINISHED') {
        clearTurnTimer(roomId);
        emitGameOver(io, roomId, result.state, result.settlement);
      } else {
        armTurnTimer(io, roomId, result.state);
      }
      ack?.({ success: true });
    } catch (e) {
      logger.debug('game:shot rejected', { userId, roomId, error: errMsg(e) });
      ack?.({ success: false, error: errMsg(e) });
    }
  });

  // Live aim relay — purely cosmetic, high-frequency, no persistence/validation.
  // Sent to everyone else in the room; clients only render the current shooter's.
  socket.on(SOCKET_EVENTS.GAME_AIM, ({ roomId, aim }) => {
    socket.to(SOCKET_ROOMS.game(roomId)).emit(SOCKET_EVENTS.GAME_AIM, {
      roomId,
      shooter: userId,
      aim,
    });
  });

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    const rooms = joinedRooms.get(socket.id);
    joinedRooms.delete(socket.id);
    if (!rooms) return;

    for (const roomId of rooms) {
      void (async () => {
        if (!(await gameSession.isPlayer(roomId, userId))) return; // spectators just leave
        // Broadcast immediately, then persist (don't make peers wait on the DB).
        io.to(SOCKET_ROOMS.game(roomId)).emit(SOCKET_EVENTS.GAME_PAUSED, {
          roomId,
          userId,
          graceMs: GRACE_MS,
        });
        void gameSession.setConnected(roomId, userId, false);

        const key = `${roomId}:${userId}`;
        const timer = setTimeout(async () => {
          graceTimers.delete(key);
          const finished = await gameSession.forfeit(roomId, userId);
          if (finished) {
            clearTurnTimer(roomId);
            io.to(SOCKET_ROOMS.game(roomId)).emit(SOCKET_EVENTS.GAME_STATE, {
              roomId,
              state: finished.state,
            });
            emitGameOver(io, roomId, finished.state, finished.settlement);
          }
        }, GRACE_MS);
        graceTimers.set(key, timer);
      })();
    }
  });
};
