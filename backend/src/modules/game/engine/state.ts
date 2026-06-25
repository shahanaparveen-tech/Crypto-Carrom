import type { GameState, PlayerState } from './types';
import { createCoinLayout, colorForSeat } from './layout';

/** Builds the initial authoritative state for a 1v1 match. */
export const createInitialState = (
  matchId: string,
  mode: string,
  seat0Id: string,
  seat1Id: string,
): GameState => {
  const mkPlayer = (userId: string, seat: 0 | 1): PlayerState => ({
    userId,
    seat,
    coinColor: colorForSeat(seat),
    pocketedOwn: 0,
    pocketedCoinIds: [],
    score: 0,
    pendingPenalty: 0,
    fouls: 0,
  });

  return {
    matchId,
    mode,
    status: 'ACTIVE',
    order: [seat0Id, seat1Id],
    players: {
      [seat0Id]: mkPlayer(seat0Id, 0),
      [seat1Id]: mkPlayer(seat1Id, 1),
    },
    coins: createCoinLayout(seat0Id, seat1Id),
    turn: { currentPlayer: seat0Id, turnNumber: 1, extraTurn: false, phase: 'AIMING' },
    queen: { status: 'ON_BOARD', owner: null, claimedBy: null, onBoard: true },
    winnerId: null,
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

export const opponentOf = (state: GameState, userId: string): string =>
  state.order[0] === userId ? state.order[1] : state.order[0];
