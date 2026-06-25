import { BOARD, PHYSICS } from './constants';

export type PieceKind = 'white' | 'black' | 'queen' | 'striker';

export interface Piece {
  id: string;
  kind: PieceKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  mass: number;
  pocketed: boolean;
}

export interface BoardState {
  pieces: Piece[]; // coins + queen + striker (striker is kind 'striker')
}

const makePiece = (id: string, kind: PieceKind, x: number, y: number): Piece => ({
  id,
  kind,
  x,
  y,
  vx: 0,
  vy: 0,
  r: kind === 'striker' ? BOARD.STRIKER_R : kind === 'queen' ? BOARD.QUEEN_R : BOARD.COIN_R,
  mass: kind === 'striker' ? PHYSICS.STRIKER_MASS : PHYSICS.COIN_MASS,
  pocketed: false,
});

/**
 * Builds the standard opening layout: a red queen at the centre, an inner ring
 * of 6 and an outer ring of 12 coins, alternating colours → exactly 9 white +
 * 9 black + 1 queen. Coin ids match the server scheme (`Q`, `w1..w9`, `b1..b9`)
 * so networked shot outcomes & coin returns line up by id.
 */
export const createBoardState = (): BoardState => {
  const pieces: Piece[] = [];
  pieces.push(makePiece('Q', 'queen', BOARD.CENTER, BOARD.CENTER));

  let w = 0;
  let b = 0;
  const place = (count: number, radius: number): void => {
    for (let i = 0; i < count; i += 1) {
      const angle = (-90 + i * (360 / count)) * (Math.PI / 180);
      const x = BOARD.CENTER + radius * Math.cos(angle);
      const y = BOARD.CENTER + radius * Math.sin(angle);
      const white = i % 2 === 0;
      const id = white ? `w${(w += 1)}` : `b${(b += 1)}`;
      pieces.push(makePiece(id, white ? 'white' : 'black', x, y));
    }
  };
  place(6, BOARD.INNER_RING_R); // w1,b1,w2,b2,w3,b3
  place(12, BOARD.OUTER_RING_R); // w4,b4,…,w9,b9

  pieces.push(makePiece('striker', 'striker', BOARD.CENTER, BOARD.STRIKER_Y));
  return { pieces };
};

export const getStriker = (state: BoardState): Piece =>
  state.pieces.find((p) => p.kind === 'striker') as Piece;

export const countByKind = (state: BoardState, kind: PieceKind): number =>
  state.pieces.filter((p) => p.kind === kind && !p.pocketed).length;
