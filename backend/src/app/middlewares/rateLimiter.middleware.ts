import rateLimit from 'express-rate-limit';

import { env } from '../config/env';

/**
 * In-memory rate limiters (express-rate-limit default store). Limits are
 * per-process — fine for a single instance. If the API is ever scaled
 * horizontally, swap in a shared store backed by Postgres.
 */
export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, code: 'RATE_LIMITED', message: 'Too many requests, slow down.' },
});

/** Stricter limiter for sensitive auth endpoints (login, register, reset). */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, code: 'RATE_LIMITED', message: 'Too many attempts, try again later.' },
});
