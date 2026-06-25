/**
 * Client mirror of the backend Socket.IO event registry. Keep in sync with
 * `backend/src/app/socket/events.ts`.
 */
export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  CREATE_ROOM: 'create-room',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  ROOM_UPDATED: 'room-updated',

  START_MATCH: 'start-match',
  PLAYER_READY: 'player-ready',
  PLAYER_TURN: 'player-turn',
  STRIKER_SHOT: 'striker-shot',
  COIN_POCKETED: 'coin-pocketed',
  FOUL: 'foul',
  MATCH_FINISHED: 'match-finished',

  CHAT_MESSAGE: 'chat-message',
  SPECTATOR_JOIN: 'spectator-join',

  ERROR: 'server-error',
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
