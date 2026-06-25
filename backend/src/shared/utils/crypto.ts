import { createHash, randomBytes } from 'crypto';

/** Cryptographically-random opaque token (hex). Used for email/reset tokens. */
export const generateToken = (bytes = 32): string => randomBytes(bytes).toString('hex');

/** Deterministic SHA-256 hash — we store hashes of tokens, never the raw value. */
export const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');
