import type { User } from '@prisma/client';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Public-safe user shape returned to clients (never includes passwordHash). */
export interface PublicUser {
  id: string;
  email: string | null;
  username: string;
  role: string;
  provider: string;
  isGuest: boolean;
  status: string;
  isEmailVerified: boolean;
  createdAt: Date;
}

export interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

export interface SessionContext {
  userAgent?: string;
  ipAddress?: string;
}

export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  email: user.email,
  username: user.username,
  role: user.role,
  provider: user.provider,
  isGuest: user.isGuest,
  status: user.status,
  isEmailVerified: user.isEmailVerified,
  createdAt: user.createdAt,
});
