import type { GameState } from '../types';

/**
 * Carrom rules contract — cover/due rules, queen coverage, and legality checks.
 * Authoritative evaluation runs server-side; the client mirror is advisory.
 */
export interface FoulResult {
  isFoul: boolean;
  reason?: string;
  penalty?: number;
}

export interface IRulesEngine {
  validateShot(state: GameState, playerId: string): FoulResult;
  evaluateQueenCover(state: GameState, playerId: string): boolean;
  evaluateFouls(prev: GameState, next: GameState, playerId: string): FoulResult;
}

// TODO(game/rules): implement queen "cover/due", wrong-coin, and no-pocket fouls.
