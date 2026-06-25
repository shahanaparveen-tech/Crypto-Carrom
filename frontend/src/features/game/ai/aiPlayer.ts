import { BOARD, POCKETS, getStriker, ownColor, type BoardState, type Piece } from '../engine';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

interface DifficultyCfg {
  label: string;
  /** Aim angle jitter (radians) — higher = sloppier. */
  angleNoise: number;
  /** Power jitter (0..1). */
  powerNoise: number;
  /** How the AI chooses among ranked candidate shots. */
  pick: 'best' | 'good' | 'random';
  /** Thinking delay range [min, max] ms. */
  thinkMs: [number, number];
  /** Whether the AI considers the queen as a target. */
  queen: boolean;
}

export const DIFFICULTY: Record<Difficulty, DifficultyCfg> = {
  easy: {
    label: 'Easy',
    angleNoise: 0.2,
    powerNoise: 0.28,
    pick: 'random',
    thinkMs: [1000, 2000],
    queen: false,
  },
  medium: {
    label: 'Medium',
    angleNoise: 0.1,
    powerNoise: 0.16,
    pick: 'good',
    thinkMs: [2000, 3000],
    queen: false,
  },
  hard: {
    label: 'Hard',
    angleNoise: 0.045,
    powerNoise: 0.08,
    pick: 'best',
    thinkMs: [2000, 4000],
    queen: true,
  },
  expert: {
    label: 'Expert',
    angleNoise: 0.018,
    powerNoise: 0.04,
    pick: 'best',
    thinkMs: [3000, 5000],
    queen: true,
  },
};

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

export interface AiShot {
  strikerX: number;
  dirX: number;
  dirY: number;
  power: number;
}

const clampX = (x: number): number =>
  Math.max(BOARD.STRIKER_MIN_X, Math.min(BOARD.STRIKER_MAX_X, x));
const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));
const baseY = (player: 0 | 1): number => (player === 0 ? BOARD.STRIKER_Y : BOARD.STRIKER_Y_TOP);

/** Distance from a point to a line segment. */
const segDist = (
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number => {
  const dx = bx - ax;
  const dy = by - ay;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};

const pathClear = (
  ax: number,
  ay: number,
  bx: number,
  by: number,
  pieces: Piece[],
  ignore: Set<string>,
  clearance: number,
): boolean => {
  for (const p of pieces) {
    if (p.pocketed || ignore.has(p.id)) continue;
    if (segDist(p.x, p.y, ax, ay, bx, by) < clearance) return false;
  }
  return true;
};

interface Candidate extends AiShot {
  score: number;
}

/**
 * Decision layer: picks a real shot (target coin → best pocket → ghost-ball
 * striker position → angle → power). The physics engine determines the result,
 * so the AI never forces a pocket. Returns the chosen shot for the AI player.
 */
export const computeAiShot = (
  state: BoardState,
  aiPlayer: 0 | 1,
  difficulty: Difficulty,
): AiShot => {
  const cfg = DIFFICULTY[difficulty];
  const color = ownColor(aiPlayer); // AI's assigned coin colour
  const pieces = state.pieces;
  const striker = getStriker(state);
  const y = baseY(aiPlayer);

  const Rsum = BOARD.STRIKER_R + BOARD.COIN_R;

  // Targets: own coins, plus the queen for stronger difficulties.
  const targets = pieces.filter((p) => !p.pocketed && p.kind === color);
  if (cfg.queen) {
    const queen = pieces.find((p) => p.kind === 'queen' && !p.pocketed);
    if (queen) targets.push(queen);
  }

  const candidates: Candidate[] = [];

  for (const coin of targets) {
    for (const pk of POCKETS) {
      const cpx = pk.x - coin.x;
      const cpy = pk.y - coin.y;
      const cpLen = Math.hypot(cpx, cpy);
      if (cpLen < 1) continue;
      const ux = cpx / cpLen;
      const uy = cpy / cpLen;

      // Ghost-ball: where the striker centre must be at contact to send the coin into the pocket.
      const ghostX = coin.x - ux * Rsum;
      const ghostY = coin.y - uy * Rsum;

      for (const sx of [ghostX, BOARD.CENTER, ghostX - 70, ghostX + 70]) {
        const px = clampX(sx);
        const ax = ghostX - px;
        const ay = ghostY - y;
        const aLen = Math.hypot(ax, ay);
        if (aLen < 5) continue;
        const dx = ax / aLen;
        const dy = ay / aLen;

        // The striker must move generally toward the pocket side for a forward push.
        const forward = dx * ux + dy * uy;
        if (forward < 0.15) continue;

        // Striker approach path and the coin's path to the pocket must both be clear.
        if (!pathClear(px, y, ghostX, ghostY, pieces, new Set([striker.id, coin.id]), Rsum - 6))
          continue;
        if (
          !pathClear(coin.x, coin.y, pk.x, pk.y, pieces, new Set([coin.id]), BOARD.COIN_R * 2 - 4)
        )
          continue;

        const total = aLen + cpLen;
        let score = forward * 100 - total * 0.05;
        if (coin.kind === color) score += 20; // prefer own coins
        if (coin.kind === 'queen') score += 8;

        candidates.push({
          strikerX: px,
          dirX: dx,
          dirY: dy,
          power: clamp01(0.55 + total / 900),
          score,
        });
      }
    }
  }

  let shot: AiShot;
  if (candidates.length === 0) {
    // Defensive / break shot: nudge toward the nearest own coin (or board centre).
    const aim = targets[0] ?? { x: BOARD.CENTER, y: BOARD.CENTER };
    const px = clampX(aim.x);
    const ax = aim.x - px;
    const ay = aim.y - y;
    const aLen = Math.hypot(ax, ay) || 1;
    shot = { strikerX: px, dirX: ax / aLen, dirY: ay / aLen, power: 0.5 };
  } else {
    candidates.sort((a, b) => b.score - a.score);
    let chosen: Candidate;
    if (cfg.pick === 'best') chosen = candidates[0]!;
    else if (cfg.pick === 'good')
      chosen = candidates[Math.floor(Math.random() * Math.min(3, candidates.length))]!;
    else chosen = candidates[Math.floor(Math.random() * candidates.length)]!; // 'random' — easy
    shot = { strikerX: chosen.strikerX, dirX: chosen.dirX, dirY: chosen.dirY, power: chosen.power };
  }

  // Imperfection: jitter the angle and power so the AI is beatable.
  const ang = Math.atan2(shot.dirY, shot.dirX) + (Math.random() * 2 - 1) * cfg.angleNoise;
  const power = clamp01(shot.power + (Math.random() * 2 - 1) * cfg.powerNoise);
  return {
    strikerX: shot.strikerX,
    dirX: Math.cos(ang),
    dirY: Math.sin(ang),
    power: Math.max(0.25, power),
  };
};

/** Randomised "thinking" delay for the given difficulty (ms). */
export const thinkDelay = (difficulty: Difficulty): number => {
  const [a, b] = DIFFICULTY[difficulty].thinkMs;
  return a + Math.random() * (b - a);
};
