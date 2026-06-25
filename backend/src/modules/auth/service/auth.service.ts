import type { User } from '@prisma/client';

import { authRepository } from '../repository/auth.repository';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../../../shared/errors';
import { comparePassword, hashPassword } from '../../../shared/utils/password';
import { signTokenPair, verifyToken } from '../../../shared/utils/jwt';
import { generateToken, sha256 } from '../../../shared/utils/crypto';
import { sendMail } from '../../../shared/helpers';
import { TOKEN_TTL, REFRESH_TOKEN_MAX_AGE_MS } from '../../../shared/constants';
import { toPublicUser, type AuthResult, type SessionContext } from '../types/auth.types';

const hoursFromNow = (hours: number): Date => new Date(Date.now() + hours * 60 * 60 * 1000);

/** Issues an access/refresh pair and persists a session row for the refresh token. */
export const issueSession = async (user: User, ctx: SessionContext): Promise<AuthResult> => {
  const { accessToken, refreshToken } = signTokenPair({
    sub: user.id,
    role: user.role,
    isGuest: user.isGuest,
  });
  await authRepository.createSession({
    userId: user.id,
    refreshTokenHash: sha256(refreshToken),
    userAgent: ctx.userAgent ?? null,
    ipAddress: ctx.ipAddress ?? null,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
  });
  return { user: toPublicUser(user), accessToken, refreshToken };
};

const assertActive = (user: User): void => {
  if (user.status === 'BANNED') throw new ForbiddenError('This account has been banned');
  if (user.status === 'SUSPENDED') throw new ForbiddenError('This account is suspended');
  if (user.status === 'DELETED') throw new UnauthorizedError('Invalid credentials');
};

const sendEmailVerification = async (user: User): Promise<void> => {
  const email = user.email;
  if (!email) return; // guests / future passwordless accounts have no email
  const raw = generateToken();
  await authRepository.invalidateUserTokens(user.id, 'EMAIL_VERIFY');
  await authRepository.createVerificationToken({
    userId: user.id,
    tokenHash: sha256(raw),
    type: 'EMAIL_VERIFY',
    expiresAt: hoursFromNow(TOKEN_TTL.EMAIL_VERIFY_HOURS),
  });
  await sendMail({
    to: email,
    subject: 'Verify your Crypto Carrom email',
    text: `Welcome! Verify your email with this token: ${raw}`,
  });
};

export const authService = {
  async register(
    input: { email: string; username: string; password: string },
    ctx: SessionContext,
  ): Promise<AuthResult> {
    const [emailTaken, usernameTaken] = await Promise.all([
      authRepository.findByEmail(input.email),
      authRepository.findByUsername(input.username),
    ]);
    if (emailTaken) throw new ConflictError('Email is already registered');
    if (usernameTaken) throw new ConflictError('Username is already taken');

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createUserWithRelations({
      email: input.email,
      username: input.username,
      passwordHash,
    });

    await sendEmailVerification(user);
    return issueSession(user, ctx);
  },

  async login(
    input: { identifier: string; password: string },
    ctx: SessionContext,
  ): Promise<AuthResult> {
    const user = await authRepository.findByIdentifier(input.identifier);
    if (!user || !user.passwordHash) throw new UnauthorizedError('Invalid credentials');

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid credentials');

    assertActive(user);
    await authRepository.setLastLogin(user.id);
    return issueSession(user, ctx);
  },

  /** Verifies + rotates a refresh token: revokes the old session, issues a new one. */
  async refresh(refreshToken: string | undefined, ctx: SessionContext): Promise<AuthResult> {
    if (!refreshToken) throw new UnauthorizedError('Missing refresh token');

    // Signature/expiry check first.
    const payload = verifyToken(refreshToken, 'refresh');

    const session = await authRepository.findSessionByHash(sha256(refreshToken));
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token is no longer valid');
    }

    const user = await authRepository.findById(payload.sub);
    if (!user) throw new UnauthorizedError('Invalid credentials');
    assertActive(user);

    await authRepository.revokeSession(session.id);
    return issueSession(user, ctx);
  },

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    const session = await authRepository.findSessionByHash(sha256(refreshToken));
    if (session) await authRepository.revokeSession(session.id);
  },

  async logoutAll(userId: string): Promise<void> {
    await authRepository.revokeAllUserSessions(userId);
  },

  async getCurrentUser(userId: string): Promise<ReturnType<typeof toPublicUser>> {
    const user = await authRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return toPublicUser(user);
  },

  async verifyEmail(token: string): Promise<void> {
    const record = await authRepository.findVerificationToken(sha256(token), 'EMAIL_VERIFY');
    if (!record || record.consumedAt || record.expiresAt < new Date()) {
      throw new BadRequestError('Verification token is invalid or expired');
    }
    await authRepository.markEmailVerified(record.userId);
    await authRepository.consumeVerificationToken(record.id);
  },

  /** Always resolves the same way to avoid leaking which emails exist. */
  async forgotPassword(email: string): Promise<void> {
    const user = await authRepository.findByEmail(email);
    if (!user) return;

    const raw = generateToken();
    await authRepository.invalidateUserTokens(user.id, 'PASSWORD_RESET');
    await authRepository.createVerificationToken({
      userId: user.id,
      tokenHash: sha256(raw),
      type: 'PASSWORD_RESET',
      expiresAt: hoursFromNow(TOKEN_TTL.PASSWORD_RESET_HOURS),
    });
    await sendMail({
      to: email,
      subject: 'Reset your Crypto Carrom password',
      text: `Use this token to reset your password (valid ${TOKEN_TTL.PASSWORD_RESET_HOURS}h): ${raw}`,
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const record = await authRepository.findVerificationToken(sha256(token), 'PASSWORD_RESET');
    if (!record || record.consumedAt || record.expiresAt < new Date()) {
      throw new BadRequestError('Reset token is invalid or expired');
    }
    const passwordHash = await hashPassword(newPassword);
    await authRepository.updatePassword(record.userId, passwordHash);
    await authRepository.consumeVerificationToken(record.id);
    // Force re-login everywhere after a password change.
    await authRepository.revokeAllUserSessions(record.userId);
  },

  /** Re-sends an email verification link for the authenticated user. */
  async resendVerification(userId: string): Promise<void> {
    const user = await authRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    if (user.isEmailVerified) throw new BadRequestError('Email is already verified');
    await sendEmailVerification(user);
  },
};
