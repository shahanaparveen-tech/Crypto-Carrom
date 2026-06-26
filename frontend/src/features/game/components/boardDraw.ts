import { Graphics } from 'pixi.js';

import { BOARD, COLORS, POCKETS, type Piece } from '../engine';

const drawPuck = (g: Graphics, p: Piece, fill: number, edge: number): void => {
  g.circle(p.x, p.y, p.r).fill(fill).stroke({ width: 2, color: edge });
  g.circle(p.x, p.y, p.r * 0.62).fill({ color: 0x000000, alpha: 0.22 });
  g.circle(p.x - p.r * 0.3, p.y - p.r * 0.32, p.r * 0.24).fill({ color: 0xffffff, alpha: 0.4 });
};

/** Draws a single piece (puck/queen/striker) into the dynamic graphics layer. */
export const drawPiece = (g: Graphics, p: Piece): void => {
  switch (p.kind) {
    case 'white':
      drawPuck(g, p, COLORS.white, COLORS.whiteEdge);
      break;
    case 'black':
      drawPuck(g, p, COLORS.black, COLORS.blackEdge);
      break;
    case 'queen':
      drawPuck(g, p, COLORS.queen, COLORS.queenEdge);
      break;
    case 'striker':
      g.circle(p.x, p.y, p.r * 1.5).fill({ color: COLORS.glow, alpha: 0.28 });
      g.circle(p.x, p.y, p.r * 1.2).fill({ color: COLORS.glow, alpha: 0.22 });
      g.circle(p.x, p.y, p.r).fill(COLORS.striker).stroke({ width: 3, color: COLORS.glow });
      g.circle(p.x, p.y, p.r * 0.58).stroke({ width: 2, color: COLORS.strikerCore });
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        g.circle(p.x + Math.cos(a) * p.r * 0.42, p.y + Math.sin(a) * p.r * 0.42, p.r * 0.13).fill({
          color: COLORS.strikerCore,
          alpha: 0.85,
        });
      }
      g.circle(p.x, p.y, p.r * 0.16).fill(COLORS.strikerCore);
      break;
  }
};

/** Draws the static board (frame, pockets, mandala, baselines). */
export const drawBoard = (g: Graphics): void => {
  const { SIZE, CENTER } = BOARD;

  g.roundRect(0, 0, SIZE, SIZE, 30).fill(COLORS.frameDark);
  g.roundRect(8, 8, SIZE - 16, SIZE - 16, 24).fill(COLORS.frame);

  for (const pk of POCKETS) {
    g.circle(pk.x, pk.y, BOARD.POCKET_R + 22).fill({ color: COLORS.pocketRim, alpha: 0.95 });
  }

  g.roundRect(40, 40, SIZE - 80, SIZE - 80, 10).fill(COLORS.surface);
  for (let i = 1; i < 6; i++) {
    g.rect(40, 40 + i * 90, SIZE - 80, 2).fill({ color: COLORS.surfaceAlt, alpha: 0.3 });
  }

  g.roundRect(64, 64, SIZE - 128, SIZE - 128, 18).stroke({ width: 3, color: COLORS.line });

  const corners = [
    { x: 118, y: 118, dx: 1, dy: 1 },
    { x: SIZE - 118, y: 118, dx: -1, dy: 1 },
    { x: 118, y: SIZE - 118, dx: 1, dy: -1 },
    { x: SIZE - 118, y: SIZE - 118, dx: -1, dy: -1 },
  ];
  for (const c of corners) {
    g.circle(c.x, c.y, 12).fill(COLORS.cornerMark).stroke({ width: 2, color: 0x9c6b18 });
    g.moveTo(c.x + c.dx * 16, c.y + c.dy * 16)
      .lineTo(c.x + c.dx * 26, c.y + c.dy * 26)
      .stroke({ width: 3, color: COLORS.cornerMark });
  }

  g.circle(CENTER, CENTER, 80).stroke({ width: 3, color: COLORS.line });
  g.circle(CENTER, CENTER, 62).stroke({ width: 2, color: COLORS.line });
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8;
    g.moveTo(CENTER + Math.cos(a) * 62, CENTER + Math.sin(a) * 62)
      .lineTo(CENTER + Math.cos(a) * 80, CENTER + Math.sin(a) * 80)
      .stroke({ width: 1.5, color: COLORS.line });
  }
  g.circle(CENTER, CENTER, 20).stroke({ width: 2, color: COLORS.queenEdge });

  // Striker guide rails on all four sides (identical design).
  const a = BOARD.STRIKER_MIN_X;
  const b = BOARD.STRIKER_MAX_X;
  for (const y of [108, SIZE - 108]) {
    g.moveTo(a, y).lineTo(b, y).stroke({ width: 3, color: COLORS.queen });
    g.circle(a, y, 7).fill(COLORS.cornerMark);
    g.circle(b, y, 7).fill(COLORS.cornerMark);
  }
  for (const x of [108, SIZE - 108]) {
    g.moveTo(x, a).lineTo(x, b).stroke({ width: 3, color: COLORS.queen });
    g.circle(x, a, 7).fill(COLORS.cornerMark);
    g.circle(x, b, 7).fill(COLORS.cornerMark);
  }

  for (const pk of POCKETS) {
    g.circle(pk.x, pk.y, BOARD.POCKET_R).fill(COLORS.pocket).stroke({ width: 3, color: 0x7a5410 });
  }
};
