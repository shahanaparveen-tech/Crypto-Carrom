import type { JwtPayload } from '../utils/jwt';

/**
 * Augments Express Request with the authenticated user, populated by the
 * `authenticate` middleware after verifying the access token.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        isGuest: boolean;
      };
      auth?: JwtPayload;
      requestId?: string;
    }
  }
}

export {};
