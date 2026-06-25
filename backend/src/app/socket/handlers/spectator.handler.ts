import { SOCKET_EVENTS, SOCKET_ROOMS } from '../events';
import type { TypedServer, TypedSocket } from '../types';

/** Spectator mode — read-only join to a match's spectator room. */
export const registerSpectatorHandlers = (_io: TypedServer, socket: TypedSocket): void => {
  socket.on(SOCKET_EVENTS.SPECTATOR_JOIN, async (payload, ack) => {
    try {
      await socket.join(SOCKET_ROOMS.spectators(payload.roomId));
      ack?.({ success: true });
    } catch (error) {
      ack?.({ success: false, error: (error as Error).message });
    }
  });
};
