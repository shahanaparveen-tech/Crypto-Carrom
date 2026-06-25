import type { GameState } from '../types';

/**
 * Turn-management contract. A pocketed coin grants another turn; a foul or empty
 * shot passes the turn. Drives the per-match turn state machine.
 */
export interface ITurnManager {
  nextTurn(state: GameState, pocketedAny: boolean, foul: boolean): GameState;
  currentPlayer(state: GameState): string;
  hasTimedOut(turnStartedAt: number, now: number, limitMs: number): boolean;
}

// TODO(game/turns): implement turn rotation, extra-turn-on-pocket, timeouts.
