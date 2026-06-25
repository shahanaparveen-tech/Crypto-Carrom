import type { Disc, GameState } from '../types';

/**
 * Scoring contract. Awards points for pocketed coins (queen weighted higher) and
 * determines win conditions.
 */
export interface IScoringSystem {
  scoreForDisc(disc: Disc): number;
  applyPocketed(state: GameState, playerId: string, pocketed: Disc[]): GameState;
  getWinner(state: GameState): string | null;
}

// TODO(game/scoring): implement coin values, queen bonus, and win conditions.
