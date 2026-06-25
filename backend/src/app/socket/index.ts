import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

import { env } from '../config/env';
import { logger } from '../logger';
import { socketAuthMiddleware } from './middlewares/socketAuth.middleware';
import { handleConnection } from './handlers/connection.handler';
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
  TypedServer,
} from './types';

let io: TypedServer | null = null;

/**
 * Creates the Socket.IO server, installs handshake auth, and registers
 * connection handlers. Uses the default in-memory adapter (single instance).
 */
export const initSocket = (httpServer: HttpServer): TypedServer => {
  io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
    httpServer,
    {
      path: env.SOCKET_PATH,
      pingInterval: env.SOCKET_PING_INTERVAL,
      pingTimeout: env.SOCKET_PING_TIMEOUT,
      cors: { origin: env.CORS_ORIGINS, credentials: true },
    },
  );

  io.use(socketAuthMiddleware);
  handleConnection(io);

  logger.info('⚡ Socket.IO initialized');
  return io;
};

/** Accessor for emitting from outside the socket layer (e.g. services/jobs). */
export const getIO = (): TypedServer => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};
