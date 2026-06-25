import type {
  Prisma,
  User,
  Session,
  VerificationToken,
  VerificationTokenType,
} from '@prisma/client';

import { prisma } from '../../../app/config/prisma';
import { WALLET, GUEST } from '../../../shared/constants';

/**
 * Auth data-access layer. The only place that touches Prisma for auth concerns
 * (users + sessions + verification tokens).
 */
export const authRepository = {
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username } });
  },

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  /** Finds a user by email OR username (login identifier). */
  findByIdentifier(identifier: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { OR: [{ email: identifier.toLowerCase() }, { username: identifier }] },
    });
  },

  /**
   * Creates the user together with profile, settings, wallet, and the signup
   * bonus transaction — all atomically.
   */
  createUserWithRelations(data: {
    email: string;
    username: string;
    passwordHash: string;
  }): Promise<User> {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          username: data.username,
          passwordHash: data.passwordHash,
          profile: { create: { displayName: data.username } },
          settings: { create: {} },
          wallet: {
            create: {
              balance: WALLET.SIGNUP_BONUS,
              gems: WALLET.STARTING_GEMS,
              currency: WALLET.CURRENCY,
            },
          },
        },
        include: { wallet: true },
      });

      if (user.wallet) {
        await tx.walletTransaction.create({
          data: {
            walletId: user.wallet.id,
            type: 'CREDIT',
            reason: 'SIGNUP_BONUS',
            amount: WALLET.SIGNUP_BONUS,
            balanceBefore: 0n,
            balanceAfter: WALLET.SIGNUP_BONUS,
          },
        });
      }

      return user;
    });
  },

  usernameExists(username: string): Promise<boolean> {
    return prisma.user
      .findUnique({ where: { username }, select: { id: true } })
      .then((u) => u !== null);
  },

  /**
   * Creates a guest account (no email/password) with profile, settings, and a
   * wallet pre-funded with starting coins — all atomically.
   */
  createGuest(username: string): Promise<User> {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username,
          provider: 'GUEST',
          isGuest: true,
          profile: { create: { displayName: username, avatarUrl: GUEST.AVATAR_URL } },
          settings: { create: {} },
          wallet: {
            create: {
              balance: GUEST.STARTING_COINS,
              gems: GUEST.STARTING_GEMS,
              currency: WALLET.CURRENCY,
            },
          },
        },
        include: { wallet: true },
      });

      if (user.wallet) {
        await tx.walletTransaction.create({
          data: {
            walletId: user.wallet.id,
            type: 'CREDIT',
            reason: 'SIGNUP_BONUS',
            amount: GUEST.STARTING_COINS,
            balanceBefore: 0n,
            balanceAfter: GUEST.STARTING_COINS,
          },
        });
      }

      return user;
    });
  },

  updatePassword(userId: string, passwordHash: string): Promise<User> {
    return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  },

  setLastLogin(userId: string): Promise<User> {
    return prisma.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
  },

  markEmailVerified(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true, emailVerifiedAt: new Date() },
    });
  },

  // ---- Sessions (refresh tokens) ----

  createSession(data: Prisma.SessionUncheckedCreateInput): Promise<Session> {
    return prisma.session.create({ data });
  },

  findSessionByHash(refreshTokenHash: string): Promise<Session | null> {
    return prisma.session.findUnique({ where: { refreshTokenHash } });
  },

  revokeSession(id: string): Promise<Prisma.BatchPayload> {
    return prisma.session.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  revokeAllUserSessions(userId: string): Promise<Prisma.BatchPayload> {
    return prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  // ---- Verification / reset tokens ----

  createVerificationToken(data: {
    userId: string;
    tokenHash: string;
    type: VerificationTokenType;
    expiresAt: Date;
  }): Promise<VerificationToken> {
    return prisma.verificationToken.create({ data });
  },

  findVerificationToken(
    tokenHash: string,
    type: VerificationTokenType,
  ): Promise<VerificationToken | null> {
    return prisma.verificationToken.findFirst({ where: { tokenHash, type } });
  },

  consumeVerificationToken(id: string): Promise<VerificationToken> {
    return prisma.verificationToken.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  },

  invalidateUserTokens(userId: string, type: VerificationTokenType): Promise<Prisma.BatchPayload> {
    return prisma.verificationToken.updateMany({
      where: { userId, type, consumedAt: null },
      data: { consumedAt: new Date() },
    });
  },
};
