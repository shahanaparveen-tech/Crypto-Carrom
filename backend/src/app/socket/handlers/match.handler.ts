import { SOCKET_EVENTS, SOCKET_ROOMS } from '../events';
import { logger } from '../../logger';
import type { TypedServer, TypedSocket } from '../types';

/**
 * Match/gameplay events. The authoritative physics & rules engine (server-side
 * validation of striker shots, pocketing, fouls, turn order) is implemented in
 * the game module. These handlers are the transport surface for it.
 */
export const registerMatchHandlers = (io: TypedServer, socket: TypedSocket): void => {
  socket.on(SOCKET_EVENTS.START_MATCH, (payload, ack) => {
    logger.debug('start-match', { roomId: payload.roomId });
    // TODO(game): create match, set initial turn, broadcast start.
    ack?.({ success: true });
  });

  socket.on(SOCKET_EVENTS.PLAYER_READY, (payload, ack) => {
    io.to(SOCKET_ROOMS.game(payload.roomId)).emit(SOCKET_EVENTS.ROOM_UPDATED, {
      roomId: payload.roomId,
      state: { ready: { userId: socket.data.userId, ready: payload.ready } },
    });
    ack?.({ success: true });
  });

  socket.on(SOCKET_EVENTS.STRIKER_SHOT, (payload, ack) => {
    logger.debug('striker-shot', { userId: socket.data.userId, roomId: payload.roomId });
    // TODO(game): validate turn, run authoritative physics, emit results
    // (coin-pocketed / foul / player-turn / match-finished).
    ack?.({ success: true });
  });
};
