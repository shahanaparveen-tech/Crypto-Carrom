import type { Server, Socket } from 'socket.io';

import type { GameState, GameEvent, ShotOutcome } from '../../modules/game/engine';

/**
 * Typed Socket.IO contracts. Payload shapes are intentionally light at the
 * foundation stage and tighten as game modules are implemented.
 */

export interface ServerToClientEvents {
  'room-updated': (payload: { roomId: string; state: unknown }) => void;
  'start-match': (payload: { roomId: string; matchId: string }) => void;
  'player-turn': (payload: { roomId: string; userId: string }) => void;
  'coin-pocketed': (payload: { roomId: string; coin: unknown }) => void;
  foul: (payload: { roomId: string; userId: string; reason: string }) => void;
  'match-finished': (payload: { roomId: string; winnerId: string | null }) => void;
  'chat-message': (payload: ChatMessagePayload) => void;
  'server-error': (payload: { code: string; message: string }) => void;

  // ---- Authoritative game session ----
  'game:start': (payload: { roomId: string; state: GameState }) => void;
  'game:state': (payload: { roomId: string; state: GameState }) => void;
  'game:shot': (payload: {
    roomId: string;
    shooter: string;
    inputs?: unknown;
    events: GameEvent[];
    state: GameState;
  }) => void;
}

export interface ClientToServerEvents {
  'create-room': (payload: CreateRoomPayload, ack?: AckFn) => void;
  'join-room': (payload: JoinRoomPayload, ack?: AckFn) => void;
  'leave-room': (payload: { roomId: string }, ack?: AckFn) => void;
  'start-match': (payload: { roomId: string }, ack?: AckFn) => void;
  'player-ready': (payload: { roomId: string; ready: boolean }, ack?: AckFn) => void;
  'striker-shot': (payload: StrikerShotPayload, ack?: AckFn) => void;
  'chat-message': (payload: ChatMessagePayload, ack?: AckFn) => void;
  'spectator-join': (payload: { roomId: string }, ack?: AckFn) => void;

  // ---- Authoritative game session ----
  'game:join': (payload: { roomId: string }, ack?: AckFn) => void;
  'game:ready': (payload: { roomId: string; ready: boolean }, ack?: AckFn) => void;
  'game:shot': (
    payload: { roomId: string; outcome: ShotOutcome; inputs?: unknown },
    ack?: AckFn,
  ) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  role: string;
}

export type AckFn = (response: { success: boolean; error?: string; data?: unknown }) => void;

export interface CreateRoomPayload {
  mode: 'classic' | 'freestyle';
  isPrivate: boolean;
  entryFee: number;
}

export interface JoinRoomPayload {
  roomId: string;
}

export interface StrikerShotPayload {
  roomId: string;
  angle: number;
  power: number;
  position: { x: number; y: number };
}

export interface ChatMessagePayload {
  roomId?: string;
  scope: 'global' | 'room';
  message: string;
}

export type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
