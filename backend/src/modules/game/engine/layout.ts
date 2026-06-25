import type { Coin } from './types';

/**
 * Board geometry — kept in sync with the client engine's 600×600 logical space
 * (frontend/src/features/game/engine/constants.ts) so returned coin positions
 * render identically on both clients.
 */
export const BOARD = {
  CENTER: 300,
  INNER_RING_R: 32, // 6 coins hugging the queen
  OUTER_RING_R: 62, // 12 coins around the inner ring
} as const;

interface Slot {
  x: number;
  y: number;
}

/** Center → inner ring → outer ring, in order; used for coin-return recovery. */
const buildSlots = (): Slot[] => {
  const slots: Slot[] = [{ x: BOARD.CENTER, y: BOARD.CENTER }];
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    slots.push({
      x: BOARD.CENTER + Math.cos(a) * BOARD.INNER_RING_R,
      y: BOARD.CENTER + Math.sin(a) * BOARD.INNER_RING_R,
    });
  }
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    slots.push({
      x: BOARD.CENTER + Math.cos(a) * BOARD.OUTER_RING_R,
      y: BOARD.CENTER + Math.sin(a) * BOARD.OUTER_RING_R,
    });
  }
  return slots;
};

export const RECOVERY_SLOTS: Slot[] = buildSlots();

/**
 * Builds the opening coin layout: queen at center, then 18 ring coins
 * alternating WHITE/BLACK (9 each). WHITE → team A, BLACK → team B.
 */
export const createCoinLayout = (): Coin[] => {
  const coins: Coin[] = [
    { id: 'Q', color: 'QUEEN', owner: null, state: 'ON_BOARD', x: BOARD.CENTER, y: BOARD.CENTER },
  ];

  let whiteN = 0;
  let blackN = 0;
  for (let i = 1; i < RECOVERY_SLOTS.length; i++) {
    const slot = RECOVERY_SLOTS[i]!;
    const isWhite = (i - 1) % 2 === 0;
    if (isWhite) {
      whiteN += 1;
      coins.push({
        id: `w${whiteN}`,
        color: 'WHITE',
        owner: 'A',
        state: 'ON_BOARD',
        x: slot.x,
        y: slot.y,
      });
    } else {
      blackN += 1;
      coins.push({
        id: `b${blackN}`,
        color: 'BLACK',
        owner: 'B',
        state: 'ON_BOARD',
        x: slot.x,
        y: slot.y,
      });
    }
  }
  return coins;
};
