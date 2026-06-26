import { useEffect, useRef, useState } from 'react';
import { Application, Graphics } from 'pixi.js';

import {
  BOARD,
  COLORS,
  POCKETS,
  PHYSICS,
  baselineY,
  ownColor,
  createBoardState,
  getStriker,
  countByKind,
  stepWorld,
  shootStriker,
  type BoardState,
  type Piece,
} from '../engine';
import { computeAiShot, thinkDelay, type Difficulty } from '../ai/aiPlayer';

export type QueenStatus = 'ON_BOARD' | 'PENDING_COVER' | 'SECURED';

export interface GameScore {
  white: number; // white coins pocketed (player 2 / top)
  black: number; // black coins pocketed (player 1 / bottom)
  queen: number; // queen off the board (0/1)
  remaining: number; // coins still on the board
  fouls: number; // striker pocketed count
  cleared: boolean;
  currentPlayer: 0 | 1; // whose turn it is
  winner: 0 | 1 | null;
  queenStatus: QueenStatus;
  queenOwner: 0 | 1 | null;
  thinking: boolean; // AI is deciding its move
}

interface AimState {
  active: boolean;
  dirX: number;
  dirY: number;
  power: number;
}

const emptyAim: AimState = { active: false, dirX: 0, dirY: 0, power: 0 };

const WHITE_TOTAL = 9;
const BLACK_TOTAL = 9;
const clampX = (x: number): number =>
  Math.max(BOARD.STRIKER_MIN_X, Math.min(BOARD.STRIKER_MAX_X, x));

/** Recovery slots for returned (penalised) coins: centre → inner ring → outer ring. */
const RECOVERY_SLOTS: { x: number; y: number }[] = (() => {
  const slots: { x: number; y: number }[] = [{ x: BOARD.CENTER, y: BOARD.CENTER }];
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
})();

const drawPuck = (g: Graphics, p: Piece, fill: number, edge: number): void => {
  g.circle(p.x, p.y, p.r).fill(fill).stroke({ width: 2, color: edge });
  g.circle(p.x, p.y, p.r * 0.62).fill({ color: 0x000000, alpha: 0.22 });
  g.circle(p.x - p.r * 0.3, p.y - p.r * 0.32, p.r * 0.24).fill({ color: 0xffffff, alpha: 0.4 });
};

const drawPiece = (g: Graphics, p: Piece): void => {
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

const drawBoard = (g: Graphics): void => {
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

interface GameCanvasProps {
  onScore?: (score: GameScore) => void;
  /** When set, Player 2 (top) is controlled by the AI at this difficulty. */
  ai?: { difficulty: Difficulty } | null;
}

/** Interactive PixiJS carrom board with turn management (auto striker side). */
export const GameCanvas = ({ onScore, ai = null }: GameCanvasProps): JSX.Element => {
  const hostRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<BoardState>(createBoardState());
  const aimRef = useRef<AimState>({ ...emptyAim });
  const phaseRef = useRef<'aim' | 'sim'>('aim');
  const playerRef = useRef<0 | 1>(0);
  const turnPocketsRef = useRef<Piece[]>([]);
  const queenStatusRef = useRef<QueenStatus>('ON_BOARD');
  const queenOwnerRef = useRef<0 | 1 | null>(null);
  const queenClaimedByRef = useRef<0 | 1 | null>(null);
  const aiRef = useRef(ai);
  aiRef.current = ai;
  const aiTimerRef = useRef<number | undefined>(undefined);
  const scoreRef = useRef<GameScore>({
    white: 0,
    black: 0,
    queen: 0,
    remaining: 18,
    fouls: 0,
    cleared: false,
    currentPlayer: 0,
    winner: null,
    queenStatus: 'ON_BOARD',
    queenOwner: null,
    thinking: false,
  });
  const [strikerX, setStrikerX] = useState<number>(BOARD.CENTER);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let ready = false;
    let canvasEl: HTMLCanvasElement | null = null;
    let simFrames = 0; // frames the current shot has been simulating
    const app = new Application();
    const boardG = new Graphics();
    const dynG = new Graphics();

    const toBoard = (e: PointerEvent): { x: number; y: number } => {
      const rect = app.canvas.getBoundingClientRect();
      const scale = BOARD.SIZE / rect.width;
      return { x: (e.clientX - rect.left) * scale, y: (e.clientY - rect.top) * scale };
    };

    const emitScore = (): void => onScore?.({ ...scoreRef.current });

    /** Place the striker on a player's baseline (auto-positioning by turn). */
    const placeStriker = (player: 0 | 1, x: number): void => {
      const s = getStriker(stateRef.current);
      s.x = clampX(x);
      s.y = baselineY(player);
      s.vx = 0;
      s.vy = 0;
      s.pocketed = false;
    };

    const firstFreeSlot = (): { x: number; y: number } => {
      for (const slot of RECOVERY_SLOTS) {
        const taken = stateRef.current.pieces.some(
          (p) =>
            !p.pocketed &&
            p.kind !== 'striker' &&
            Math.hypot(p.x - slot.x, p.y - slot.y) < BOARD.COIN_R * 1.6,
        );
        if (!taken) return slot;
      }
      return RECOVERY_SLOTS[0]!;
    };

    /** Penalty: return one of the offender's own coins to the board. */
    const returnOwnCoin = (player: 0 | 1): void => {
      const color = ownColor(player);
      const coin = stateRef.current.pieces.find((p) => p.kind === color && p.pocketed);
      if (!coin) return; // nothing to return (deferred penalties are out of scope here)
      const slot = firstFreeSlot();
      coin.pocketed = false;
      coin.x = slot.x;
      coin.y = slot.y;
      coin.vx = 0;
      coin.vy = 0;
    };

    /** Return the queen to the centre (or nearest free slot) on a failed cover. */
    const returnQueen = (): void => {
      const queen = stateRef.current.pieces.find((p) => p.kind === 'queen');
      if (!queen) return;
      const center = { x: BOARD.CENTER, y: BOARD.CENTER };
      const centerTaken = stateRef.current.pieces.some(
        (p) =>
          p !== queen &&
          !p.pocketed &&
          p.kind !== 'striker' &&
          Math.hypot(p.x - center.x, p.y - center.y) < BOARD.COIN_R * 1.6,
      );
      const pos = centerTaken ? firstFreeSlot() : center;
      queen.pocketed = false;
      queen.x = pos.x;
      queen.y = pos.y;
      queen.vx = 0;
      queen.vy = 0;
      queenStatusRef.current = 'ON_BOARD';
      queenOwnerRef.current = null;
      queenClaimedByRef.current = null;
    };

    const recomputeScore = (): void => {
      const state = stateRef.current;
      const onWhite = countByKind(state, 'white');
      const onBlack = countByKind(state, 'black');
      const onQueen = countByKind(state, 'queen');
      const sc = scoreRef.current;
      sc.white = WHITE_TOTAL - onWhite;
      sc.black = BLACK_TOTAL - onBlack;
      sc.queen = 1 - onQueen;
      sc.remaining = onWhite + onBlack;
      sc.currentPlayer = playerRef.current;
      sc.queenStatus = queenStatusRef.current;
      sc.queenOwner = queenOwnerRef.current;
      // Win requires all own coins pocketed AND the queen secured by that player.
      const queenSecured = queenStatusRef.current === 'SECURED';
      sc.winner =
        onBlack === 0 && queenSecured && queenOwnerRef.current === 0
          ? 0
          : onWhite === 0 && queenSecured && queenOwnerRef.current === 1
            ? 1
            : null;
      sc.cleared = sc.winner !== null;
    };

    const redraw = (): void => {
      dynG.clear();
      const state = stateRef.current;
      const aim = aimRef.current;
      if (aim.active && phaseRef.current === 'aim') {
        const s = getStriker(state);
        const len = aim.power * 140;
        dynG
          .moveTo(s.x, s.y)
          .lineTo(s.x + aim.dirX * len, s.y + aim.dirY * len)
          .stroke({ width: 4, color: COLORS.aim, alpha: 0.55 });
        dynG
          .circle(s.x + aim.dirX * len, s.y + aim.dirY * len, 6)
          .fill({ color: COLORS.aim, alpha: 0.85 });
      }
      for (const p of state.pieces) {
        if (!p.pocketed) drawPiece(dynG, p);
      }
    };

    /** Schedule the AI's shot after a human-like thinking delay. */
    const scheduleAiMove = (): void => {
      const cfg = aiRef.current;
      if (!cfg) return;
      scoreRef.current.thinking = true;
      emitScore();
      aiTimerRef.current = window.setTimeout(() => {
        if (cancelled || phaseRef.current !== 'aim' || scoreRef.current.cleared) return;
        const shot = computeAiShot(stateRef.current, 1, cfg.difficulty);
        placeStriker(1, shot.strikerX);
        setStrikerX(shot.strikerX);
        scoreRef.current.thinking = false;
        turnPocketsRef.current = [];
        simFrames = 0;
        shootStriker(getStriker(stateRef.current), shot.dirX, shot.dirY, shot.power);
        phaseRef.current = 'sim';
        emitScore();
      }, thinkDelay(cfg.difficulty));
    };

    /** Resolve the turn once the board settles (scoring, foul, extra turn, switch). */
    const onSettle = (): void => {
      phaseRef.current = 'aim';
      const player = playerRef.current;
      const striker = getStriker(stateRef.current);
      const color = ownColor(player);

      const strikerFoul = striker.pocketed;
      const ownPocketed = turnPocketsRef.current.some((p) => p.kind === color);
      const queenPocketedNow = turnPocketsRef.current.some((p) => p.kind === 'queen');
      const isCoverShot =
        queenStatusRef.current === 'PENDING_COVER' && queenClaimedByRef.current === player;

      if (strikerFoul) {
        scoreRef.current.fouls += 1;
        striker.pocketed = false;
        returnOwnCoin(player); // penalty: return own coin
      }

      // Queen — resolve a pending cover owed by this player.
      if (isCoverShot) {
        if (strikerFoul) {
          returnQueen();
        } else if (ownPocketed) {
          queenStatusRef.current = 'SECURED';
          queenOwnerRef.current = player;
          queenClaimedByRef.current = null;
        } else {
          returnQueen();
        }
      }

      // Queen — pocketed this shot → claim + pending cover (foul voids the claim).
      let forceExtra = false;
      if (queenPocketedNow) {
        if (strikerFoul) {
          returnQueen();
        } else {
          queenStatusRef.current = 'PENDING_COVER';
          queenClaimedByRef.current = player;
          queenOwnerRef.current = null;
          forceExtra = true;
        }
      }

      recomputeScore();

      // Extra turn on a clean own pocket or a fresh queen claim; else pass.
      const extraTurn =
        (ownPocketed || forceExtra) && !strikerFoul && scoreRef.current.winner === null;
      if (!extraTurn && scoreRef.current.winner === null) {
        playerRef.current = player === 0 ? 1 : 0;
      }

      // Auto-move the striker to the current player's shooting side.
      placeStriker(playerRef.current, BOARD.CENTER);
      setStrikerX(BOARD.CENTER);
      recomputeScore();
      emitScore();

      // If it's now the AI's turn, let the computer take it.
      if (aiRef.current && playerRef.current === 1 && !scoreRef.current.cleared) {
        scheduleAiMove();
      }
    };

    const loop = (): void => {
      const state = stateRef.current;
      if (phaseRef.current === 'sim') {
        simFrames += 1;
        const res = stepWorld(state);
        if (res.pocketed.length) {
          turnPocketsRef.current.push(...res.pocketed);
          recomputeScore();
          emitScore();
        }
        // End the turn only once everything is at rest — or force-rest if a shot
        // jitters forever (guarantees the turn never gets stuck).
        if (res.settled || simFrames > PHYSICS.MAX_SIM_FRAMES) {
          if (!res.settled)
            for (const p of state.pieces) {
              p.vx = 0;
              p.vy = 0;
            }
          onSettle();
        }
      }
      redraw();
    };

    const aiControlling = (): boolean => aiRef.current !== null && playerRef.current === 1;

    const onPointerDown = (e: PointerEvent): void => {
      if (phaseRef.current !== 'aim' || scoreRef.current.cleared || aiControlling()) return;
      e.preventDefault();
      aimRef.current = { active: true, dirX: 0, dirY: 0, power: 0 };
    };
    const onPointerMove = (e: PointerEvent): void => {
      if (!aimRef.current.active) return;
      const pt = toBoard(e);
      const s = getStriker(stateRef.current);
      const dx = pt.x - s.x;
      const dy = pt.y - s.y;
      const len = Math.hypot(dx, dy);
      const power = Math.min(1, len / PHYSICS.MAX_PULL);
      aimRef.current = {
        active: true,
        dirX: len > 0 ? -dx / len : 0,
        dirY: len > 0 ? -dy / len : 0,
        power,
      };
    };
    const onPointerUp = (): void => {
      const aim = aimRef.current;
      aimRef.current = { ...emptyAim };
      if (phaseRef.current !== 'aim' || aim.power <= 0.05) return;
      turnPocketsRef.current = []; // fresh shot
      simFrames = 0;
      shootStriker(getStriker(stateRef.current), aim.dirX, aim.dirY, aim.power);
      phaseRef.current = 'sim';
    };

    void app
      .init({
        width: BOARD.SIZE,
        height: BOARD.SIZE,
        backgroundColor: COLORS.frameDark,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
      })
      .then(() => {
        if (cancelled) {
          app.destroy(true);
          return;
        }
        ready = true;
        canvasEl = app.canvas;
        drawBoard(boardG);
        app.stage.addChild(boardG);
        app.stage.addChild(dynG);
        host.appendChild(canvasEl);
        canvasEl.style.width = '100%';
        canvasEl.style.height = 'auto';
        canvasEl.style.touchAction = 'none';

        canvasEl.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);

        app.ticker.add(loop);
        emitScore();
        redraw();
      })
      .catch(() => {
        /* init aborted (e.g. unmounted mid-init) */
      });

    return () => {
      cancelled = true;
      window.clearTimeout(aiTimerRef.current);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (ready) {
        canvasEl?.removeEventListener('pointerdown', onPointerDown);
        app.destroy(true, { children: true });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Slide the striker along the CURRENT player's baseline only (never crosses sides).
  const onSlider = (value: number): void => {
    if (aiRef.current && playerRef.current === 1) return; // AI controls its own striker
    setStrikerX(value);
    if (phaseRef.current === 'aim') {
      const s = getStriker(stateRef.current);
      if (!s.pocketed) {
        s.x = clampX(value);
        s.y = baselineY(playerRef.current);
      }
    }
  };

  return (
    <div className="w-full">
      <div
        ref={hostRef}
        className="mx-auto w-full max-w-[540px] overflow-hidden rounded-3xl shadow-panel"
      />
      {/* Striker position track (current player's baseline) */}
      <div className="mx-auto mt-4 w-full max-w-[420px] rounded-full border border-gold/30 bg-gradient-to-b from-wood-light/80 to-wood-dark/80 px-4 py-3 shadow-inner">
        <input
          type="range"
          min={BOARD.STRIKER_MIN_X}
          max={BOARD.STRIKER_MAX_X}
          value={strikerX}
          onChange={(e) => onSlider(Number(e.target.value))}
          aria-label="Position striker"
          className="w-full accent-gold"
        />
      </div>
      <p className="mt-2 text-center text-xs text-white/45">
        Drag on the board to aim, release to flick.
      </p>
    </div>
  );
};
