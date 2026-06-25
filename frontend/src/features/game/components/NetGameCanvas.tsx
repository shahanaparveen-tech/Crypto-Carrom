import { useEffect, useRef, useState } from 'react';
import { Application, Graphics } from 'pixi.js';

import {
  BOARD,
  COLORS,
  PHYSICS,
  baselineY,
  createBoardState,
  getStriker,
  stepWorld,
  shootStriker,
  type BoardState,
  type Piece,
} from '../engine';
import { drawBoard, drawPiece } from './boardDraw';
import type {
  IncomingShot,
  NetEvent,
  NetGameState,
  ShotInputs,
  ShotOutcome,
} from '../net/useNetMatch';

interface AimState {
  active: boolean;
  dirX: number;
  dirY: number;
  power: number;
}
const emptyAim: AimState = { active: false, dirX: 0, dirY: 0, power: 0 };
const clampX = (x: number): number =>
  Math.max(BOARD.STRIKER_MIN_X, Math.min(BOARD.STRIKER_MAX_X, x));

interface NetGameCanvasProps {
  state: NetGameState | null;
  myId: string;
  lastShot: IncomingShot | null;
  onLocalShot: (outcome: ShotOutcome, inputs: ShotInputs) => void;
}

/**
 * Networked board: the server is the turn/score authority. The local player
 * shoots on their turn and reports the settled outcome; opponents' shots are
 * deterministically replayed from broadcast inputs. Coin pocket/return state is
 * reconciled from the authoritative events after every shot.
 */
export const NetGameCanvas = ({
  state,
  myId,
  lastShot,
  onLocalShot,
}: NetGameCanvasProps): JSX.Element => {
  const hostRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<BoardState>(createBoardState());
  const aimRef = useRef<AimState>({ ...emptyAim });
  const phaseRef = useRef<'aim' | 'sim'>('aim');
  const waitingRef = useRef(false); // awaiting server ack of my shot
  const turnPocketsRef = useRef<Piece[]>([]);
  const inputsRef = useRef<ShotInputs>({ strikerX: BOARD.CENTER, dirX: 0, dirY: 0, power: 0 });
  const pendingEventsRef = useRef<NetEvent[] | null>(null);
  const stateRef = useRef<NetGameState | null>(state);
  stateRef.current = state;
  const lastShotRef = useRef<IncomingShot | null>(lastShot);
  lastShotRef.current = lastShot;
  const processedNonceRef = useRef(0);
  const lastTurnRef = useRef<string>('');
  const [strikerX, setStrikerX] = useState<number>(BOARD.CENTER);

  const sideOf = (userId: string): 0 | 1 =>
    stateRef.current?.players[userId]?.teamId === 'A' ? 0 : 1;
  const byId = (id: string): Piece | undefined => boardRef.current.pieces.find((p) => p.id === id);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let ready = false;
    let canvasEl: HTMLCanvasElement | null = null;
    const app = new Application();
    const boardG = new Graphics();
    const dynG = new Graphics();

    const toBoard = (e: PointerEvent): { x: number; y: number } => {
      const rect = app.canvas.getBoundingClientRect();
      const scale = BOARD.SIZE / rect.width;
      return { x: (e.clientX - rect.left) * scale, y: (e.clientY - rect.top) * scale };
    };

    const isMyTurn = (): boolean =>
      !!stateRef.current &&
      stateRef.current.status === 'ACTIVE' &&
      stateRef.current.turn.currentPlayer === myId;

    const placeStriker = (side: 0 | 1, x: number): void => {
      const s = getStriker(boardRef.current);
      s.x = clampX(x);
      s.y = baselineY(side);
      s.vx = 0;
      s.vy = 0;
      s.pocketed = false;
    };

    const applyEvents = (events: NetEvent[]): void => {
      for (const e of events) {
        if (e.type === 'coin:pocketed') {
          for (const id of (e as { coinIds: string[] }).coinIds) {
            const p = byId(id);
            if (p) {
              p.pocketed = true;
              p.vx = 0;
              p.vy = 0;
            }
          }
        } else if (e.type === 'coin:returned') {
          const r = e as { coinId: string; slot: { x: number; y: number } };
          const p = byId(r.coinId);
          if (p) {
            p.pocketed = false;
            p.x = r.slot.x;
            p.y = r.slot.y;
            p.vx = 0;
            p.vy = 0;
          }
        } else if (e.type === 'queen-returned') {
          const q = byId('Q');
          const pos = (e as { position: { x: number; y: number } }).position;
          if (q) {
            q.pocketed = false;
            q.x = pos.x;
            q.y = pos.y;
            q.vx = 0;
            q.vy = 0;
          }
        }
      }
    };

    const syncTurnStriker = (): void => {
      const st = stateRef.current;
      if (!st || st.status !== 'ACTIVE') return;
      if (st.turn.currentPlayer !== lastTurnRef.current) {
        lastTurnRef.current = st.turn.currentPlayer;
        placeStriker(sideOf(st.turn.currentPlayer), BOARD.CENTER);
        setStrikerX(BOARD.CENTER);
      }
    };

    const processShot = (shot: IncomingShot): void => {
      processedNonceRef.current = shot.nonce;
      if (shot.shooter === myId) {
        applyEvents(shot.events); // reconcile my own shot with authority
        waitingRef.current = false;
        syncTurnStriker();
        return;
      }
      // Replay the opponent's shot from broadcast inputs.
      if (!shot.inputs) {
        applyEvents(shot.events);
        syncTurnStriker();
        return;
      }
      placeStriker(sideOf(shot.shooter), shot.inputs.strikerX);
      pendingEventsRef.current = shot.events;
      turnPocketsRef.current = [];
      shootStriker(
        getStriker(boardRef.current),
        shot.inputs.dirX,
        shot.inputs.dirY,
        shot.inputs.power,
      );
      phaseRef.current = 'sim';
    };

    const onSettle = (): void => {
      phaseRef.current = 'aim';
      if (pendingEventsRef.current) {
        applyEvents(pendingEventsRef.current); // opponent shot resolved
        pendingEventsRef.current = null;
      } else {
        // My shot settled — report the outcome; authority will echo it back.
        const pocketedCoinIds = turnPocketsRef.current
          .filter((p) => p.kind !== 'striker')
          .map((p) => p.id);
        const strikerPocketed = getStriker(boardRef.current).pocketed;
        waitingRef.current = true;
        onLocalShot({ pocketedCoinIds, strikerPocketed }, inputsRef.current);
      }
      syncTurnStriker();
    };

    const redraw = (): void => {
      dynG.clear();
      const aim = aimRef.current;
      if (aim.active && phaseRef.current === 'aim') {
        const s = getStriker(boardRef.current);
        const len = aim.power * 140;
        dynG
          .moveTo(s.x, s.y)
          .lineTo(s.x + aim.dirX * len, s.y + aim.dirY * len)
          .stroke({ width: 4, color: COLORS.aim, alpha: 0.55 });
        dynG
          .circle(s.x + aim.dirX * len, s.y + aim.dirY * len, 6)
          .fill({ color: COLORS.aim, alpha: 0.85 });
      }
      for (const p of boardRef.current.pieces) if (!p.pocketed) drawPiece(dynG, p);
    };

    const loop = (): void => {
      if (phaseRef.current === 'sim') {
        const res = stepWorld(boardRef.current);
        if (res.pocketed.length) turnPocketsRef.current.push(...res.pocketed);
        if (res.settled) onSettle();
      } else {
        // Process a freshly broadcast shot (only while idle).
        const shot = lastShotRef.current;
        if (shot && shot.nonce !== processedNonceRef.current && !waitingRef.current) {
          processShot(shot);
        } else {
          syncTurnStriker();
        }
      }
      redraw();
    };

    const canAim = (): boolean => isMyTurn() && phaseRef.current === 'aim' && !waitingRef.current;

    const onPointerDown = (e: PointerEvent): void => {
      if (!canAim()) return;
      e.preventDefault();
      aimRef.current = { active: true, dirX: 0, dirY: 0, power: 0 };
    };
    const onPointerMove = (e: PointerEvent): void => {
      if (!aimRef.current.active) return;
      const pt = toBoard(e);
      const s = getStriker(boardRef.current);
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
      if (!canAim() || aim.power <= 0.05) return;
      const s = getStriker(boardRef.current);
      inputsRef.current = { strikerX: s.x, dirX: aim.dirX, dirY: aim.dirY, power: aim.power };
      turnPocketsRef.current = [];
      shootStriker(s, aim.dirX, aim.dirY, aim.power);
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
        redraw();
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (ready) {
        canvasEl?.removeEventListener('pointerdown', onPointerDown);
        app.destroy(true, { children: true });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId]);

  const onSlider = (value: number): void => {
    const st = stateRef.current;
    if (!st || st.turn.currentPlayer !== myId || phaseRef.current !== 'aim' || waitingRef.current)
      return;
    setStrikerX(value);
    const s = getStriker(boardRef.current);
    if (!s.pocketed) {
      s.x = clampX(value);
      s.y = baselineY(sideOf(myId));
    }
  };

  return (
    <div className="w-full">
      <div
        ref={hostRef}
        className="mx-auto w-full max-w-[540px] overflow-hidden rounded-3xl shadow-panel"
      />
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
    </div>
  );
};
