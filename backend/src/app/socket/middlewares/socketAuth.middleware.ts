import { verifyToken } from '../../../shared/utils/jwt';
import { logger } from '../../logger';
import type { TypedSocket } from '../types';

type NextFn = (err?: Error) => void;

/**
 * Socket.IO handshake authentication. The client passes the access token via
 * `auth.token` (preferred) or the Authorization header. Verified identity is
 * stored on `socket.data` for downstream handlers.
 */
export const socketAuthMiddleware = (socket: TypedSocket, next: NextFn): void => {
  try {
    const tokenFromAuth = (socket.handshake.auth as { token?: string }).token;
    const header = socket.handshake.headers.authorization;
    const token = tokenFromAuth ?? (header?.startsWith('Bearer ') ? header.slice(7) : undefined);

    if (!token) {
      next(new Error('UNAUTHORIZED: missing token'));
      return;
    }

    const payload = verifyToken(token, 'access');
    socket.data.userId = payload.sub;
    socket.data.role = payload.role;
    next();
  } catch (error) {
    logger.warn('Socket auth rejected', { error: (error as Error).message });
    next(new Error('UNAUTHORIZED: invalid token'));
  }
};
