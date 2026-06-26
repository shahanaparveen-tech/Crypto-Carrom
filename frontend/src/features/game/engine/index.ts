/**
 * Game engine facade. Composes physics, collisions, rules, turns, and scoring
 * into a single deterministic step function so the same engine can run on the
 * server (authoritative) and client (prediction/rendering).
 */
export * from './types';
export type { IPhysicsEngine } from './physics';
export type { ICollisionSystem } from './collisions';
export type { IRulesEngine, FoulResult } from './rules';
export type { ITurnManager } from './turns';
export type { IScoringSystem } from './scoring';

// ---- Concrete implementation ----
export {
  BOARD,
  PHYSICS,
  COLORS,
  POCKETS,
  baselineY,
  ownColor,
  SIDE,
  sideForSeat,
  sideIsVertical,
  strikerSpot,
  type Side,
} from './constants';
export { createBoardState, getStriker, countByKind } from './board';
export type { BoardState, Piece, PieceKind } from './board';
export { stepWorld, shootStriker } from './simulation';
export type { StepResult } from './simulation';
