import { Prisma } from '@prisma/client';

import { authRepository } from '../repository/auth.repository';
import { issueSession } from './auth.service';
import { GUEST } from '../../../shared/constants';
import { AppError } from '../../../shared/errors';
import type { AuthResult, SessionContext } from '../types/auth.types';

/** Random 5-digit guest suffix → `Guest_48217`. */
const randomGuestUsername = (): string => {
  const suffix = Math.floor(10000 + Math.random() * 90000);
  return `${GUEST.USERNAME_PREFIX}${suffix}`;
};

const isUniqueViolation = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';

export const guestService = {
  /**
   * Creates a brand-new guest account and signs the player in immediately.
   * No email/password — the account is identified solely by its unique id
   * (and unique `Guest_#####` username). It can later be upgraded to a real
   * Google/Facebook account in place, preserving all data.
   */
  async loginAsGuest(ctx: SessionContext): Promise<AuthResult> {
    for (let attempt = 0; attempt < GUEST.MAX_USERNAME_ATTEMPTS; attempt += 1) {
      const username = randomGuestUsername();
      try {
        const user = await authRepository.createGuest(username);
        return issueSession(user, ctx);
      } catch (error) {
        // Username collided with a concurrent guest — retry with a new suffix.
        if (isUniqueViolation(error)) continue;
        throw error;
      }
    }
    throw new AppError(
      'Could not allocate a guest username, please retry',
      503,
      'GUEST_ALLOC_FAILED',
    );
  },
};
