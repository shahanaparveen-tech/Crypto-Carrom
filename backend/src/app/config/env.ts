import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

/**
 * Single source of truth for all environment configuration.
 * Validated once at boot — the process exits if anything is missing/invalid.
 */
const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().default('/api/v1'),
  APP_NAME: z.string().default('crypto-carrom'),

  // CORS
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((value) => value.split(',').map((origin) => origin.trim())),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_ISSUER: z.string().default('crypto-carrom'),

  // Bcrypt
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(15).default(12),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),

  // Cookies
  COOKIE_SECRET: z.string().min(8),
  COOKIE_DOMAIN: z.string().default('localhost'),

  // Socket.IO
  SOCKET_PATH: z.string().default('/socket.io'),
  SOCKET_PING_INTERVAL: z.coerce.number().int().positive().default(25_000),
  SOCKET_PING_TIMEOUT: z.coerce.number().int().positive().default(20_000),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),

  // Crypto (Phase 5 — inert placeholders)
  CRYPTO_ENABLED: z
    .string()
    .default('false')
    .transform((value) => value === 'true'),
  BLOCKCHAIN_RPC_URL: z.string().optional(),
  BLOCKCHAIN_CHAIN_ID: z.string().optional(),
  TOKEN_CONTRACT_ADDRESS: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration:');
  // eslint-disable-next-line no-console
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

export type Env = typeof env;
