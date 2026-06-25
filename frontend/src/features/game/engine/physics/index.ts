import type { BoardConfig, GameState, Vector2 } from '../types';

/**
 * Physics integration contract. Advances the simulation one fixed timestep:
 * applies velocity, friction, and wall bounces. Collision resolution is
 * delegated to the collisions module.
 */
export interface IPhysicsEngine {
  step(state: GameState, board: BoardConfig, dt: number): GameState;
  applyImpulse(state: GameState, direction: Vector2, power: number): GameState;
  isSettled(state: GameState): boolean;
}

// TODO(game/physics): implement fixed-timestep integrator with friction damping.
