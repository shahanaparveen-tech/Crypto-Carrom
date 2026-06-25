import type { Request, Response, NextFunction } from 'express';

import { UnauthorizedError, ForbiddenError } from '../../shared/errors';
import { verifyToken } from '../../shared/utils/jwt';

/** Verifies the Bearer access token and attaches `req.user`. */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed Authorization header');
  }
  const token = header.slice('Bearer '.length).trim();
  const payload = verifyToken(token, 'access');
  req.auth = payload;
  req.user = { id: payload.sub, role: payload.role, isGuest: payload.isGuest ?? false };
  next();
};

/** Restricts a route to one or more roles. Use after `authenticate`. */
export const authorize =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw new UnauthorizedError();
    if (roles.length && !roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
    next();
  };
