import type { GameState, MatchType, PlayerState, TeamId, TeamState } from './types';
import { createCoinLayout } from './layout';

/** Seat 0,2 → team A; seat 1,3 → team B (alternating teams in the rotation). */
export const teamOfSeat = (seat: number): TeamId => (seat % 2 === 0 ? 'A' : 'B');

/**
 * Builds the initial authoritative state.
 * @param seats Seat-ordered player ids — length 2 (1v1) or 4 (2v2).
 */
export const createInitialState = (
  matchId: string,
  mode: string,
  matchType: MatchType,
  seats: string[],
  names: Record<string, string> = {},
): GameState => {
  const players: Record<string, PlayerState> = {};
  seats.forEach((userId, seat) => {
    players[userId] = {
      userId,
      username: names[userId] ?? userId,
      seat,
      teamId: teamOfSeat(seat),
      fouls: 0,
    };
  });

  const mkTeam = (id: TeamId, color: 'WHITE' | 'BLACK'): TeamState => ({
    id,
    color,
    members: seats.filter((_, i) => teamOfSeat(i) === id),
    pocketedOwn: 0,
    pocketedCoinIds: [],
    score: 0,
    pendingPenalty: 0,
  });

  return {
    matchId,
    mode,
    matchType,
    status: 'ACTIVE',
    order: [...seats],
    players,
    teams: { A: mkTeam('A', 'WHITE'), B: mkTeam('B', 'BLACK') },
    coins: createCoinLayout(),
    turn: {
      currentPlayer: seats[0]!,
      turnNumber: 1,
      extraTurn: false,
      phase: 'AIMING',
      deadline: 0,
    },
    queen: { status: 'ON_BOARD', owner: null, claimedBy: null, onBoard: true },
    winnerTeam: null,
  };
};

/** Coins of a colour still on the board. */
export const remainingByColor = (
  state: GameState,
): { WHITE: number; BLACK: number; QUEEN: number } => {
  const out = { WHITE: 0, BLACK: 0, QUEEN: 0 };
  for (const c of state.coins) if (c.state === 'ON_BOARD') out[c.color] += 1;
  return out;
};

export const otherTeam = (teamId: TeamId): TeamId => (teamId === 'A' ? 'B' : 'A');
