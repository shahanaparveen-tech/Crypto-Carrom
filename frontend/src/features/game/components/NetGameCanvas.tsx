import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { Application, Graphics } from 'pixi.js';

import {
  BOARD,
  COLORS,
  PHYSICS,
  SIDE,
  sideForSeat,
  strikerSpot,
  createBoardState,
  getStriker,
  stepWorld,
  shootStriker,
  type Side,
  type BoardState,
  type Piece,
} from '../engine';
import { cn } from '@shared/utils/cn';
import { drawBoard, drawPiece } from './boardDraw';
import type {
  AimPayload,
  IncomingShot,
  LiveAim,
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
const clampT = (t: number): number => Math.max(BOARD.STRIKER_MIN, Math.min(BOARD.STRIKER_MAX, t));

interface NetGameCanvasProps {
  state: NetGameState | null;
  myId: string;
  lastShot: IncomingShot | null;
  onLocalShot: (outcome: ShotOutcome, inputs: ShotInputs) => void;
  liveAim: MutableRefObject<LiveAim | null>;
  sendAim: (aim: AimPayload) => void;
}

/**
 * Networked board: the server is the turn/score authority. The local player
 * shoots on their turn and reports the settled outcome; opponents' shots are
 * deterministically replayed from broadcast inputs. Coin pocket/return state is
 * reconciled from the authoritative events after every shot. Players shoot from
 * one of four sides (bottom/top/left/right) based on their seat.
 */
export const NetGameCanvas = ({
  state,
  myId,
  lastShot,
  onLocalShot,
  liveAim,
  sendAim,
}: NetGameCanvasProps): JSX.Element => {
  const hostRef = useRef<HTMLDivElement>(null);
  const sendAimRef = useRef(sendAim);
  sendAimRef.current = sendAim;
  const boardRef = useRef<BoardState>(createBoardState());
  const aimRef = useRef<AimState>({ ...emptyAim });
  const phaseRef = useRef<'aim' | 'sim'>('aim');
  const waitingRef = useRef(false); // awaiting server ack of my shot
  const turnPocketsRef = useRef<Piece[]>([]);
  const inputsRef = useRef<ShotInputs>({
    strikerX: BOARD.CENTER,
    strikerY: BOARD.STRIKER_Y,
    dirX: 0,
    dirY: 0,
    power: 0,
  });
  const pendingEventsRef = useRef<NetEvent[] | null>(null);
  const stateRef = useRef<NetGameState | null>(state);
  stateRef.current = state;
  const lastShotRef = useRef<IncomingShot | null>(lastShot);
  lastShotRef.current = lastShot;
  const processedNonceRef = useRef(0);
  const lastTurnRef = useRef<string>('');
  const [sliderT, setSliderT] = useState<number>(BOARD.CENTER);

  const sideOf = (userId: string): Side =>
    sideForSeat(stateRef.current?.players[userId]?.seat ?? 0);
  const byId = (id: string): Piece | undefined => boardRef.current.pieces.find((p) => p.id === id);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let ready = false;
    let canvasEl: HTMLCanvasElement | null = null;
    let simFrames = 0;
    let restFrames = 0; // consecutive frames the board has been near-rest
    let lastAimSent = 0; // throttle timestamp for live-aim broadcasts
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

    /** Place the striker on a side, parameterised along its baseline. */
    const placeStriker = (side: Side, t: number): void => {
      const s = getStriker(boardRef.current);
      const pos = strikerSpot(side, t);
      s.x = pos.x;
      s.y = pos.y;
      s.vx = 0;
      s.vy = 0;
      s.pocketed = false;
    };
    const placeStrikerAt = (x: number, y: number): void => {
      const s = getStriker(boardRef.current);
      s.x = x;
      s.y = y;
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

    /**
     * Snap the striker to the *current* player's baseline centre and reset the
     * slider. Called after every shot settles — so the striker is always reset
     * for the next shooter, including extra turns (same player shoots again).
     */
    const placeForCurrentTurn = (): void => {
      const st = stateRef.current;
      if (!st || st.status !== 'ACTIVE') return;
      lastTurnRef.current = st.turn.currentPlayer;
      placeStriker(sideOf(st.turn.currentPlayer), BOARD.CENTER);
      setSliderT(BOARD.CENTER);
    };

    // Per-frame safety net: reposition when the authoritative turn changes
    // (e.g. a state push on reconnect) without fighting the slider mid-aim.
    const syncTurnStriker = (): void => {
      const st = stateRef.current;
      if (!st || st.status !== 'ACTIVE') return;
      if (st.turn.currentPlayer !== lastTurnRef.current) placeForCurrentTurn();
    };

    const processShot = (shot: IncomingShot): void => {
      processedNonceRef.current = shot.nonce;
      if (shot.shooter === myId) {
        applyEvents(shot.events); // reconcile my own shot with authority
        waitingRef.current = false;
        placeForCurrentTurn(); // reset striker for whoever shoots next (incl. my extra turn)
        return;
      }
      if (!shot.inputs) {
        applyEvents(shot.events);
        placeForCurrentTurn();
        return;
      }
      // Deterministically replay the opponent's shot from the exact inputs.
      const { strikerX, strikerY, dirX, dirY, power } = shot.inputs;
      placeStrikerAt(strikerX, strikerY ?? strikerSpot(sideOf(shot.shooter), strikerX).y);
      pendingEventsRef.current = shot.events;
      turnPocketsRef.current = [];
      simFrames = 0;
      restFrames = 0;
      shootStriker(getStriker(boardRef.current), dirX, dirY, power);
      phaseRef.current = 'sim';
    };

    const onSettle = (): void => {
      phaseRef.current = 'aim';
      if (pendingEventsRef.current) {
        applyEvents(pendingEventsRef.current); // opponent shot resolved
        pendingEventsRef.current = null;
        placeForCurrentTurn(); // striker → next shooter's baseline
      } else {
        // My shot — report the outcome. The striker is repositioned once the
        // server acknowledges it (processShot), so the authoritative turn (incl.
        // any extra turn) decides which baseline it returns to.
        const pocketedCoinIds = turnPocketsRef.current
          .filter((p) => p.kind !== 'striker')
          .map((p) => p.id);
        const strikerPocketed = getStriker(boardRef.current).pocketed;
        waitingRef.current = true;
        onLocalShot({ pocketedCoinIds, strikerPocketed }, inputsRef.current);
      }
    };

    const drawAimLine = (sx: number, sy: number, dx: number, dy: number, power: number): void => {
      const len = power * 140;
      dynG
        .moveTo(sx, sy)
        .lineTo(sx + dx * len, sy + dy * len)
        .stroke({ width: 4, color: COLORS.aim, alpha: 0.55 });
      dynG.circle(sx + dx * len, sy + dy * len, 6).fill({ color: COLORS.aim, alpha: 0.85 });
    };

    const redraw = (): void => {
      dynG.clear();
      const aim = aimRef.current;
      const st = stateRef.current;
      const oppTurn = !!st && st.status === 'ACTIVE' && st.turn.currentPlayer !== myId;
      const la = liveAim.current;

      if (aim.active && phaseRef.current === 'aim') {
        // My own live aim.
        const s = getStriker(boardRef.current);
        if (aim.power > 0.02) drawAimLine(s.x, s.y, aim.dirX, aim.dirY, aim.power);
      } else if (
        oppTurn &&
        la &&
        la.shooter === st!.turn.currentPlayer &&
        phaseRef.current === 'aim'
      ) {
        // Mirror the opponent's striker + aiming line in real time.
        const s = getStriker(boardRef.current);
        s.x = la.strikerX;
        s.y = la.strikerY;
        if (la.active && la.power > 0.02) drawAimLine(s.x, s.y, la.dirX, la.dirY, la.power);
      }
      for (const p of boardRef.current.pieces) if (!p.pocketed) drawPiece(dynG, p);
    };

    const loop = (): void => {
      if (phaseRef.current === 'sim') {
        simFrames += 1;
        const res = stepWorld(boardRef.current);
        if (res.pocketed.length) turnPocketsRef.current.push(...res.pocketed);
        // Coins jittering in a tight cluster may never all reach exact zero, so
        // settle once motion stays negligible for a short while (or at the cap).
        if (res.maxSpeed < PHYSICS.NEAR_REST_SPEED) restFrames += 1;
        else restFrames = 0;
        if (
          res.settled ||
          restFrames >= PHYSICS.NEAR_REST_FRAMES ||
          simFrames > PHYSICS.MAX_SIM_FRAMES
        ) {
          for (const p of boardRef.current.pieces) {
            p.vx = 0;
            p.vy = 0;
          }
          onSettle();
        }
      } else {
        // Always apply a freshly broadcast shot (mine or the opponent's).
        // `waiting` only gates re-aiming (canAim), never broadcast processing —
        // otherwise my own shot's ack could never clear it (deadlock).
        const shot = lastShotRef.current;
        if (shot && shot.nonce !== processedNonceRef.current) {
          processShot(shot);
        } else {
          syncTurnStriker();
        }
      }
      redraw();
    };

    const canAim = (): boolean => isMyTurn() && phaseRef.current === 'aim' && !waitingRef.current;

    /** Broadcast my striker + aim so the opponent sees it live (throttled). */
    const broadcastAim = (active: boolean, force = false): void => {
      const now = performance.now();
      if (!force && now - lastAimSent < 40) return;
      lastAimSent = now;
      const s = getStriker(boardRef.current);
      const a = aimRef.current;
      sendAimRef.current({
        strikerX: s.x,
        strikerY: s.y,
        dirX: a.dirX,
        dirY: a.dirY,
        power: a.power,
        active,
      });
    };

    const onPointerDown = (e: PointerEvent): void => {
      if (!canAim()) return;
      e.preventDefault();
      aimRef.current = { active: true, dirX: 0, dirY: 0, power: 0 };
      broadcastAim(true, true);
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
      broadcastAim(true);
    };
    const onPointerUp = (): void => {
      const aim = aimRef.current;
      aimRef.current = { ...emptyAim };
      if (!canAim() || aim.power <= 0.05) {
        if (isMyTurn()) broadcastAim(false, true); // cancelled aim → clear the line
        return;
      }
      const s = getStriker(boardRef.current);
      inputsRef.current = {
        strikerX: s.x,
        strikerY: s.y,
        dirX: aim.dirX,
        dirY: aim.dirY,
        power: aim.power,
      };
      turnPocketsRef.current = [];
      simFrames = 0;
      restFrames = 0;
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

  // Slide the striker along the current player's baseline (axis depends on side).
  const onSlider = (value: number): void => {
    const st = stateRef.current;
    if (!st || st.turn.currentPlayer !== myId || phaseRef.current !== 'aim') return;
    const t = clampT(value);
    setSliderT(t);
    const s = getStriker(boardRef.current);
    if (!s.pocketed) {
      const pos = strikerSpot(sideForSeat(st.players[myId]?.seat ?? 0), t);
      s.x = pos.x;
      s.y = pos.y;
      // Let the opponent see the striker slide along the baseline (no aim line).
      sendAim({ strikerX: s.x, strikerY: s.y, dirX: 0, dirY: 0, power: 0, active: false });
    }
  };

  const mySide = state ? sideForSeat(state.players[myId]?.seat ?? 0) : SIDE.BOTTOM;
  const vertical = mySide === SIDE.LEFT || mySide === SIDE.RIGHT;

  // The striker rail sits on the current player's side and is oriented to it.
  const layout =
    mySide === SIDE.TOP
      ? 'flex-col-reverse'
      : mySide === SIDE.LEFT
        ? 'flex-row'
        : mySide === SIDE.RIGHT
          ? 'flex-row-reverse'
          : 'flex-col';

  const railTrack = (
    <div
      className={cn(
        'rounded-full border border-gold/30 bg-gradient-to-b from-wood-light/80 to-wood-dark/80 shadow-inner',
        vertical ? 'flex items-center justify-center px-2 py-3' : 'w-full max-w-[420px] px-4 py-3',
      )}
    >
      <input
        type="range"
        min={BOARD.STRIKER_MIN}
        max={BOARD.STRIKER_MAX}
        value={sliderT}
        onChange={(e) => onSlider(Number(e.target.value))}
        aria-label="Position striker"
        className="accent-gold"
        style={vertical ? { writingMode: 'vertical-lr', height: 240 } : { width: '100%' }}
      />
    </div>
  );

  return (
    <div
      className={cn('mx-auto flex w-full max-w-[600px] items-center justify-center gap-3', layout)}
    >
      <div
        ref={hostRef}
        className="w-full max-w-[540px] overflow-hidden rounded-3xl shadow-panel"
      />
      {railTrack}
    </div>
  );
};
