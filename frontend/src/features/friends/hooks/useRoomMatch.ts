import { useEffect, useState } from 'react';

import { connectSocket } from '@shared/services/socket';

/** Minimal shape of the authoritative game state we read for the lobby. */
export interface NetMatchState {
  matchType: '1v1' | '2v2';
  turn: { currentPlayer: string };
  teams: {
    A: { color: 'WHITE' | 'BLACK'; members: string[] };
    B: { color: 'WHITE' | 'BLACK'; members: string[] };
  };
}

type ReadyMap = Record<string, boolean>;

/**
 * Subscribes to a room's match channel: tracks per-player ready state and the
 * authoritative `game:start` snapshot. Drives the lobby ready → start handshake.
 */
export const useRoomMatch = (roomId: string | null) => {
  const [ready, setReady] = useState<ReadyMap>({});
  const [started, setStarted] = useState<NetMatchState | null>(null);

  useEffect(() => {
    if (!roomId) return;
    const s = connectSocket();

    const join = (): void => {
      s.emit('game:join', { roomId });
    };
    const onRoomUpdated = (p: {
      roomId: string;
      state: { ready?: { userId: string; ready: boolean } };
    }): void => {
      const r = p?.state?.ready;
      if (r && typeof r.userId === 'string') setReady((m) => ({ ...m, [r.userId]: !!r.ready }));
    };
    const onStart = (p: { roomId: string; state: NetMatchState }): void => {
      if (p.roomId === roomId) setStarted(p.state);
    };

    s.on('connect', join);
    s.on('room-updated', onRoomUpdated);
    s.on('game:start', onStart);
    if (s.connected) join();

    return () => {
      s.off('connect', join);
      s.off('room-updated', onRoomUpdated);
      s.off('game:start', onStart);
    };
  }, [roomId]);

  const sendReady = (value: boolean): void => {
    connectSocket().emit('game:ready', { roomId, ready: value });
  };

  return { ready, started, sendReady };
};
