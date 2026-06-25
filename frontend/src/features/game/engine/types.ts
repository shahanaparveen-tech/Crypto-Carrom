/**
 * Core value types shared across the game engine. These define the engine's
 * data contract; the actual physics/rules implementations land in later phases.
 */
export interface Vector2 {
  x: number;
  y: number;
}

export type CoinColor = 'white' | 'black' | 'queen';

export interface Disc {
  id: string;
  color: CoinColor;
  position: Vector2;
  velocity: Vector2;
  radius: number;
  mass: number;
  pocketed: boolean;
}

export interface Striker extends Disc {
  color: 'white'; // striker is rendered distinctly but treated as a disc
  maxPower: number;
}

export interface BoardConfig {
  size: number; // square board side length (logical units)
  pocketRadius: number;
  friction: number; // velocity damping per tick
  restitution: number; // collision elasticity [0..1]
}

export interface GameState {
  discs: Disc[];
  striker: Striker;
  currentPlayerId: string;
  turnNumber: number;
  scores: Record<string, number>;
  isSettled: boolean; // true when all discs are at rest
}
