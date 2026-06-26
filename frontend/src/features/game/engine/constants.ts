/**
 * Carrom engine constants. All positions are in a fixed 600×600 logical board
 * space; the renderer scales this to the displayed canvas size.
 */
export const BOARD = {
  SIZE: 600,
  CENTER: 300,

  // Inner frame edge where discs bounce (center is clamped to edge ± radius).
  EDGE_MIN: 52,
  EDGE_MAX: 548,

  COIN_R: 15,
  QUEEN_R: 15,
  STRIKER_R: 19,
  POCKET_R: 28,

  INNER_RING_R: 32, // 6 coins hugging the queen
  OUTER_RING_R: 62, // 12 coins around the inner ring

  STRIKER_Y: 490, // bottom shooting baseline
  STRIKER_Y_TOP: 110, // top shooting baseline
  STRIKER_X_LEFT: 110, // left shooting baseline (2v2)
  STRIKER_X_RIGHT: 490, // right shooting baseline (2v2)
  STRIKER_MIN: 150, // min position along any baseline
  STRIKER_MAX: 450, // max position along any baseline
  STRIKER_MIN_X: 150, // (back-compat alias)
  STRIKER_MAX_X: 450,
} as const;

/** Shooting side: which edge the player shoots from. */
export const SIDE = { BOTTOM: 0, TOP: 1, LEFT: 2, RIGHT: 3 } as const;
export type Side = (typeof SIDE)[keyof typeof SIDE];

/** Left/right sides slide the striker vertically; top/bottom horizontally. */
export const sideIsVertical = (side: Side): boolean => side === SIDE.LEFT || side === SIDE.RIGHT;

/** Seat → shooting side. 1v1 uses bottom/top; 2v2 adds left/right. */
export const sideForSeat = (seat: number): Side =>
  [SIDE.BOTTOM, SIDE.TOP, SIDE.LEFT, SIDE.RIGHT][seat % 4] as Side;

/** Striker position on a given side, parameterised by `t` along the baseline. */
export const strikerSpot = (side: Side, t: number): { x: number; y: number } => {
  const c = Math.max(BOARD.STRIKER_MIN, Math.min(BOARD.STRIKER_MAX, t));
  switch (side) {
    case SIDE.TOP:
      return { x: c, y: BOARD.STRIKER_Y_TOP };
    case SIDE.LEFT:
      return { x: BOARD.STRIKER_X_LEFT, y: c };
    case SIDE.RIGHT:
      return { x: BOARD.STRIKER_X_RIGHT, y: c };
    case SIDE.BOTTOM:
    default:
      return { x: c, y: BOARD.STRIKER_Y };
  }
};

/** Shooting baseline Y for a 2-side player (back-compat for 1v1 boards). */
export const baselineY = (player: 0 | 1): number =>
  player === 0 ? BOARD.STRIKER_Y : BOARD.STRIKER_Y_TOP;

/** Coin colour each player owns (only these score / win for them). */
export const ownColor = (player: 0 | 1): 'black' | 'white' => (player === 0 ? 'black' : 'white');

export const PHYSICS = {
  FRICTION: 0.975, // velocity retained per sub-step
  WALL_RESTITUTION: 0.7,
  DISC_RESTITUTION: 0.9,
  STOP_SPEED: 0.05, // below this a disc is snapped to rest
  MAX_PULL: 160, // px of drag = full power
  MAX_SPEED: 13, // units per sub-step at full power
  COIN_MASS: 1,
  STRIKER_MASS: 1.4,
  SUBSTEPS: 3, // physics sub-steps per animation frame (anti-tunnelling)
  MAX_SIM_FRAMES: 900, // hard cap (~15s) — force-rest if a shot never settles
} as const;

export const COLORS = {
  frame: 0x3a2014, // dark wood frame
  frameDark: 0x241009,
  surface: 0xd9a86a, // light wood playing surface
  surfaceAlt: 0xe3b87f,
  line: 0xb07b34, // decorative inlay
  pocket: 0x0a0a0a,
  pocketRim: 0xf5b942, // gold rim around pockets
  cornerMark: 0xf5b942, // gold base/shooting circles
  // "white" kind is rendered as the blue puck (player 2 colour)
  white: 0x29a3e6,
  whiteEdge: 0x0d6fb0,
  black: 0x2b2f38,
  blackEdge: 0x0a0a0a,
  queen: 0xe0392b,
  queenEdge: 0x8e1a14,
  striker: 0xf4f1e8, // cream striker
  strikerCore: 0xc8881f, // floral gold motif
  glow: 0xffd470, // gold glow around the active striker
  aim: 0xffffff,
} as const;

/** Four corner pockets in board space. */
export const POCKETS = [
  { x: 78, y: 78 },
  { x: 522, y: 78 },
  { x: 78, y: 522 },
  { x: 522, y: 522 },
] as const;
