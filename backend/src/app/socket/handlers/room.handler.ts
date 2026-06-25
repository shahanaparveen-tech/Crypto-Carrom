import { SOCKET_EVENTS, SOCKET_ROOMS } from '../events';
import { logger } from '../../logger';
import type { TypedServer, TypedSocket } from '../types';

/**
 * Room lifecycle events (create / join / leave). Bodies are stubs — the real
 * implementation will delegate to the lobby & game modules in later phases.
 */
export const registerRoomHandlers = (io: TypedServer, socket: TypedSocket): void => {
  socket.on(SOCKET_EVENTS.CREATE_ROOM, (payload, ack) => {
    logger.debug('create-room', { userId: socket.data.userId, payload });
    // TODO(lobby): persist room, then join the socket room.
    ack?.({ success: true, data: { pending: true } });
  });

  socket.on(SOCKET_EVENTS.JOIN_ROOM, async (payload, ack) => {
    try {
      await socket.join(SOCKET_ROOMS.game(payload.roomId));
      io.to(SOCKET_ROOMS.game(payload.roomId)).emit(SOCKET_EVENTS.ROOM_UPDATED, {
        roomId: payload.roomId,
        state: { joined: socket.data.userId },
      });
      ack?.({ success: true });
    } catch (error) {
      ack?.({ success: false, error: (error as Error).message });
    }
  });

  socket.on(SOCKET_EVENTS.LEAVE_ROOM, async (payload, ack) => {
    await socket.leave(SOCKET_ROOMS.game(payload.roomId));
    ack?.({ success: true });
  });
};
