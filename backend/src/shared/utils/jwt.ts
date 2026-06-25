import { randomUUID } from 'crypto';

import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';

import { env } from '../../app/config/env';
import { UnauthorizedError } from '../errors';

export type TokenType = 'access' | 'refresh';

export interface JwtPayload {
  sub: string; // user id
  role: string;
  isGuest: boolean;
  type: TokenType;
  jti?: string; // unique token id — guarantees each issued token is distinct
}

const secretFor = (type: TokenType): string =>
  type === 'access' ? env.JWT_ACCESS_SECRET : env.JWT_REFRESH_SECRET;

const expiresFor = (type: TokenType): string =>
  type === 'access' ? env.JWT_ACCESS_EXPIRES_IN : env.JWT_REFRESH_EXPIRES_IN;

export const signToken = (payload: Omit<JwtPayload, 'type'>, type: TokenType): string => {
  const options: SignOptions = {
    expiresIn: expiresFor(type) as SignOptions['expiresIn'],
    issuer: env.JWT_ISSUER,
  };
  return jwt.sign({ ...payload, type, jti: randomUUID() }, secretFor(type), options);
};

export const verifyToken = (token: string, type: TokenType): JwtPayload => {
  try {
    const decoded = jwt.verify(token, secretFor(type), { issuer: env.JWT_ISSUER }) as JwtPayload;
    if (decoded.type !== type) throw new UnauthorizedError('Invalid token type');
    return decoded;
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
};

export const signTokenPair = (
  payload: Omit<JwtPayload, 'type'>,
): { accessToken: string; refreshToken: string } => ({
  accessToken: signToken(payload, 'access'),
  refreshToken: signToken(payload, 'refresh'),
});
