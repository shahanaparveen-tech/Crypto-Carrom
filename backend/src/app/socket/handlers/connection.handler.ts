import { SOCKET_EVENTS, SOCKET_ROOMS } from '../events';
import { logger } from '../../logger';
import type { TypedServer, TypedSocket } from '../types';
import { registerRoomHandlers } from './room.handler';
import { registerMatchHandlers } from './match.handler';
import { registerChatHandlers } from './chat.handler';
import { registerSpectatorHandlers } from './spectator.handler';

/**
 * Per-connection setup. Runs once after a socket authenticates: joins the user's
 * personal room and registers every domain handler group.
 */
export const handleConnection = (io: TypedServer): void => {
  io.on(SOCKET_EVENTS.CONNECTION, (socket: TypedSocket) => {
    const { userId } = socket.data;
    logger.info('Socket connected', { socketId: socket.id, userId });

    void socket.join(SOCKET_ROOMS.user(userId));
    // TODO(presence): persist online presence in Postgres if needed.

    registerRoomHandlers(io, socket);
    registerMatchHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerSpectatorHandlers(io, socket);

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      logger.info('Socket disconnected', { socketId: socket.id, userId, reason });
      // TODO(game): handle in-match disconnect → reconnection grace window.
    });
  });
};
