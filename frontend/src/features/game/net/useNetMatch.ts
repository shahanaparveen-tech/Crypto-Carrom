import { useEffect, useRef, useState } from 'react';

import { connectSocket } from '@shared/services/socket';
import { useAuthState } from '@features/auth/hooks';

export interface ShotInputs {
  strikerX: number;
  strikerY?: number; // exact striker Y at release (4-side replay)
  dirX: number;
  dirY: number;
  power: number;
}

export interface ShotOutcome {
  pocketedCoinIds: string[];
  strikerPocketed: boolean;
}

/** Live, ephemeral aim broadcast while a player lines up a shot. */
export interface AimPayload {
  strikerX: number;
  strikerY: number;
  dirX: number;
  dirY: number;
  power: number;
  active: boolean; // true while dragging an aim line; false = striker moved only
}
export interface LiveAim extends AimPayload {
  shooter: string;
}

export type NetCoin = {
  id: string;
  color: 'WHITE' | 'BLACK' | 'QUEEN';
  owner: 'A' | 'B' | null;
  state: 'ON_BOARD' | 'POCKETED' | 'RETURNED';
  x: number;
  y: number;
};

export interface NetGameState {
  matchId: string;
  matchType: '1v1' | '2v2';
  status: 'ACTIVE' | 'FINISHED';
  order: string[];
  players: Record<string, { userId: string; username: string; seat: number; teamId: 'A' | 'B' }>;
  teams: {
    A: { id: 'A'; color: 'WHITE' | 'BLACK'; members: string[]; score: number };
    B: { id: 'B'; color: 'WHITE' | 'BLACK'; members: string[]; score: number };
  };
  coins: NetCoin[];
  turn: { currentPlayer: string; turnNumber: number; extraTurn: boolean; deadline: number };
  queen: {
    status: 'ON_BOARD' | 'PENDING_COVER' | 'SECURED';
    owner: 'A' | 'B' | null;
    claimedBy: 'A' | 'B' | null;
  };
  winnerTeam: 'A' | 'B' | null;
}

export interface MatchReward {
  result: 'WIN' | 'LOSS';
  coins: string;
  xp: number;
  ratingDelta: number;
}
export interface GameOver {
  winnerTeam: 'A' | 'B';
  durationSec: number;
  rewards: Record<string, MatchReward>;
}

export type NetEvent =
  | { type: 'coin:pocketed'; coinIds: string[]; owner: 'A' | 'B' | null }
  | { type: 'coin:returned'; coinId: string; slot: { x: number; y: number } }
  | { type: 'queen-returned'; position: { x: number; y: number } }
  | { type: string };

export interface IncomingShot {
  shooter: string;
  inputs?: ShotInputs;
  events: NetEvent[];
  nonce: number;
}

/** Subscribes to a room's authoritative match channel and sends local shots. */
export const useNetMatch = (roomId: string | null) => {
  const { user } = useAuthState();
  const myId = user?.id ?? '';
  const [state, setState] = useState<NetGameState | null>(null);
  const [lastShot, setLastShot] = useState<IncomingShot | null>(null);
  const [pausedUser, setPausedUser] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState<GameOver | null>(null);
  const nonceRef = useRef(0);
  const liveAimRef = useRef<LiveAim | null>(null);

  useEffect(() => {
    if (!roomId) return;
    const s = connectSocket();

    const join = (): void => {
      s.emit('game:join', { roomId });
    };
    const onState = (p: { roomId: string; state: NetGameState }): void => {
      if (p.roomId !== roomId) return;
      setState(p.state);
      if (p.state.status === 'FINISHED') setPausedUser(null);
    };
    const onStart = (p: { roomId: string; state: NetGameState }): void => {
      if (p.roomId === roomId) setState(p.state);
    };
    const onPaused = (p: { roomId: string; userId: string }): void => {
      if (p.roomId === roomId) setPausedUser(p.userId);
    };
    const onResumed = (p: { roomId: string; userId: string }): void => {
      if (p.roomId === roomId) setPausedUser((u) => (u === p.userId ? null : u));
    };
    const onShot = (p: {
      roomId: string;
      shooter: string;
      inputs?: ShotInputs;
      events: NetEvent[];
      state: NetGameState;
    }): void => {
      if (p.roomId !== roomId) return;
      liveAimRef.current = null; // a real shot supersedes any live aim
      setState(p.state);
      nonceRef.current += 1;
      setLastShot({
        shooter: p.shooter,
        inputs: p.inputs,
        events: p.events,
        nonce: nonceRef.current,
      });
    };
    const onAim = (p: { roomId: string; shooter: string; aim: AimPayload }): void => {
      if (p.roomId !== roomId) return;
      liveAimRef.current = { shooter: p.shooter, ...p.aim };
    };
    const onOver = (p: { roomId: string } & GameOver): void => {
      if (p.roomId !== roomId) return;
      setGameOver({ winnerTeam: p.winnerTeam, durationSec: p.durationSec, rewards: p.rewards });
    };

    s.on('connect', join);
    s.on('game:state', onState);
    s.on('game:start', onStart);
    s.on('game:shot', onShot);
    s.on('game:aim', onAim);
    s.on('game:over', onOver);
    s.on('game:paused', onPaused);
    s.on('game:resumed', onResumed);
    if (s.connected) join();

    return () => {
      s.off('connect', join);
      s.off('game:state', onState);
      s.off('game:start', onStart);
      s.off('game:shot', onShot);
      s.off('game:aim', onAim);
      s.off('game:over', onOver);
      s.off('game:paused', onPaused);
      s.off('game:resumed', onResumed);
    };
  }, [roomId]);

  const sendShot = (outcome: ShotOutcome, inputs: ShotInputs): void => {
    connectSocket().emit('game:shot', { roomId, outcome, inputs });
  };
  const sendAim = (aim: AimPayload): void => {
    connectSocket().emit('game:aim', { roomId, aim });
  };

  return { myId, state, lastShot, pausedUser, gameOver, sendShot, sendAim, liveAim: liveAimRef };
};
