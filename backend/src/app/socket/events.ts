/**
 * Canonical Socket.IO event-name registry. Both client and server reference
 * these constants so event names never drift. Grouped by domain.
 */
export const SOCKET_EVENTS = {
  // ---- Connection lifecycle (reserved Socket.IO names) ----
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  // ---- Room lifecycle ----
  CREATE_ROOM: 'create-room',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  ROOM_UPDATED: 'room-updated',

  // ---- Match lifecycle ----
  START_MATCH: 'start-match',
  PLAYER_READY: 'player-ready',
  PLAYER_TURN: 'player-turn',
  STRIKER_SHOT: 'striker-shot',
  COIN_POCKETED: 'coin-pocketed',
  FOUL: 'foul',
  MATCH_FINISHED: 'match-finished',

  // ---- Authoritative game session (rule-engine driven) ----
  GAME_JOIN: 'game:join',
  GAME_READY: 'game:ready',
  GAME_START: 'game:start',
  GAME_SHOT: 'game:shot',
  GAME_AIM: 'game:aim',
  GAME_OVER: 'game:over',
  GAME_STATE: 'game:state',
  GAME_PAUSED: 'game:paused',
  GAME_RESUMED: 'game:resumed',

  // ---- Chat ----
  CHAT_MESSAGE: 'chat-message',

  // ---- Spectator ----
  SPECTATOR_JOIN: 'spectator-join',

  // ---- Server → client error channel ----
  ERROR: 'server-error',
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

/** Socket.IO room-name builders (Socket.IO "rooms", not game rooms). */
export const SOCKET_ROOMS = {
  game: (roomId: string) => `game:${roomId}`,
  spectators: (roomId: string) => `spectators:${roomId}`,
  user: (userId: string) => `user:${userId}`,
  globalChat: () => 'chat:global',
} as const;
