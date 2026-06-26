import { BOARD, PHYSICS, POCKETS } from './constants';
import type { BoardState, Piece } from './board';

export interface StepResult {
  pocketed: Piece[]; // pieces that fell into a pocket this frame
  settled: boolean; // all pieces at rest or pocketed
  maxSpeed: number; // fastest moving piece this frame (0 when fully settled)
}

const speed = (p: Piece): number => Math.hypot(p.vx, p.vy);

/** Advance positions, apply friction, snap near-stationary discs to rest. */
const integrate = (pieces: Piece[]): void => {
  for (const p of pieces) {
    if (p.pocketed) continue;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= PHYSICS.FRICTION;
    p.vy *= PHYSICS.FRICTION;
    if (speed(p) < PHYSICS.STOP_SPEED) {
      p.vx = 0;
      p.vy = 0;
    }
  }
};

/** Reflect discs off the inner frame edges. */
const walls = (pieces: Piece[]): void => {
  for (const p of pieces) {
    if (p.pocketed) continue;
    const min = BOARD.EDGE_MIN + p.r;
    const max = BOARD.EDGE_MAX - p.r;
    if (p.x < min) {
      p.x = min;
      p.vx = Math.abs(p.vx) * PHYSICS.WALL_RESTITUTION;
    } else if (p.x > max) {
      p.x = max;
      p.vx = -Math.abs(p.vx) * PHYSICS.WALL_RESTITUTION;
    }
    if (p.y < min) {
      p.y = min;
      p.vy = Math.abs(p.vy) * PHYSICS.WALL_RESTITUTION;
    } else if (p.y > max) {
      p.y = max;
      p.vy = -Math.abs(p.vy) * PHYSICS.WALL_RESTITUTION;
    }
  }
};

/** Elastic circle–circle collision resolution with positional correction. */
const collide = (pieces: Piece[]): void => {
  for (let i = 0; i < pieces.length; i += 1) {
    const a = pieces[i]!;
    if (a.pocketed) continue;
    for (let j = i + 1; j < pieces.length; j += 1) {
      const b = pieces[j]!;
      if (b.pocketed) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      const minDist = a.r + b.r;
      if (dist === 0 || dist >= minDist) continue;

      const nx = dx / dist;
      const ny = dy / dist;

      // Separate the overlap proportional to inverse mass.
      const overlap = minDist - dist;
      const invA = 1 / a.mass;
      const invB = 1 / b.mass;
      const totalInv = invA + invB;
      a.x -= nx * overlap * (invA / totalInv);
      a.y -= ny * overlap * (invA / totalInv);
      b.x += nx * overlap * (invB / totalInv);
      b.y += ny * overlap * (invB / totalInv);

      // Impulse along the collision normal.
      const relVel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (relVel > 0) continue; // already separating
      const jImpulse = (-(1 + PHYSICS.DISC_RESTITUTION) * relVel) / totalInv;
      a.vx -= jImpulse * invA * nx;
      a.vy -= jImpulse * invA * ny;
      b.vx += jImpulse * invB * nx;
      b.vy += jImpulse * invB * ny;
    }
  }
};

/** Mark discs whose centre entered a pocket. */
const sinkPockets = (pieces: Piece[], pocketed: Piece[]): void => {
  for (const p of pieces) {
    if (p.pocketed) continue;
    for (const pk of POCKETS) {
      if (Math.hypot(p.x - pk.x, p.y - pk.y) < BOARD.POCKET_R) {
        p.pocketed = true;
        p.vx = 0;
        p.vy = 0;
        pocketed.push(p);
        break;
      }
    }
  }
};

/** Advances the world one animation frame (several physics sub-steps). */
export const stepWorld = (state: BoardState): StepResult => {
  const pocketed: Piece[] = [];
  for (let s = 0; s < PHYSICS.SUBSTEPS; s += 1) {
    integrate(state.pieces);
    walls(state.pieces);
    collide(state.pieces);
    sinkPockets(state.pieces, pocketed);
  }
  let maxSpeed = 0;
  for (const p of state.pieces) if (!p.pocketed) maxSpeed = Math.max(maxSpeed, speed(p));
  return { pocketed, settled: maxSpeed === 0, maxSpeed };
};

/** Launches the striker. `dirX/dirY` is a unit vector; `power` is 0..1. */
export const shootStriker = (striker: Piece, dirX: number, dirY: number, power: number): void => {
  const s = Math.max(0, Math.min(1, power)) * PHYSICS.MAX_SPEED;
  striker.vx = dirX * s;
  striker.vy = dirY * s;
};
