import type { Request, Response, NextFunction } from 'express';

import { ForbiddenError, UnauthorizedError } from '../../shared/errors';
import type { Capability } from '../../shared/constants';

/**
 * Blocks guest accounts from a restricted capability. Use after `authenticate`
 * on routes guests must not reach (crypto withdraw, coin transfer, etc.).
 */
export const requireNonGuest =
  (capability: Capability) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw new UnauthorizedError();
    if (req.user.isGuest) {
      throw new ForbiddenError(
        `Guests cannot use this feature (${capability}). Upgrade your account.`,
      );
    }
    next();
  };
