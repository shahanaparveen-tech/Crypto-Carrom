import type { BoardConfig, Disc, GameState } from '../types';

/**
 * Collision detection & response contract. Handles disc–disc (elastic) and
 * disc–wall collisions, plus pocket detection.
 */
export interface ICollisionSystem {
  detectDiscCollisions(discs: Disc[]): Array<[Disc, Disc]>;
  resolveCollisions(state: GameState, board: BoardConfig): GameState;
  detectPocketed(state: GameState, board: BoardConfig): Disc[];
}

// TODO(game/collisions): broad-phase + circle-circle resolution with restitution.
