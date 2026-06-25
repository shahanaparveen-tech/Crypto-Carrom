import { SOCKET_EVENTS, SOCKET_ROOMS } from '../events';
import type { TypedServer, TypedSocket } from '../types';

/** Global and room-scoped chat relay. Persistence is handled by the chat module. */
export const registerChatHandlers = (io: TypedServer, socket: TypedSocket): void => {
  socket.on(SOCKET_EVENTS.CHAT_MESSAGE, (payload, ack) => {
    const target =
      payload.scope === 'room' && payload.roomId
        ? SOCKET_ROOMS.game(payload.roomId)
        : SOCKET_ROOMS.globalChat();

    io.to(target).emit(SOCKET_EVENTS.CHAT_MESSAGE, {
      ...payload,
    });
    // TODO(chat): persist message to chat_messages.
    ack?.({ success: true });
  });
};
