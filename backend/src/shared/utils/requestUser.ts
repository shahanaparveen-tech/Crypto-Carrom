import type { Request } from 'express';

import { UnauthorizedError } from '../errors';
import type { AuthenticatedUser } from '../types/common.types';

/** Returns the authenticated user or throws — use in handlers behind `authenticate`. */
export const getAuthUser = (req: Request): AuthenticatedUser => {
  if (!req.user) throw new UnauthorizedError();
  return req.user;
};
