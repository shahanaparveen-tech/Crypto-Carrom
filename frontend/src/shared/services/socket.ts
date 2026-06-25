import { io, type Socket } from 'socket.io-client';

import { appEnv } from '@app/config/env';
import { tokenStorage } from './tokenStorage';

/**
 * Single Socket.IO client connection for the whole app. Created lazily and
 * authenticated with the access token. Feature hooks subscribe to events on
 * this instance; they must clean up their own listeners on unmount.
 */
let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (socket) return socket;

  socket = io(appEnv.socketUrl, {
    path: appEnv.socketPath,
    autoConnect: false,
    withCredentials: true,
    transports: ['websocket'],
    auth: (cb) => cb({ token: tokenStorage.get() }),
  });

  return socket;
};

export const connectSocket = (): Socket => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = (): void => {
  socket?.disconnect();
};
