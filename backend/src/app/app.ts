import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { env } from './config/env';
import { apiRouter } from './routes';
import { errorHandler, notFoundHandler, requestId, globalRateLimiter } from './middlewares';

/**
 * Assembles the Express application: security, parsing, routing, and the
 * global error pipeline. Transport (HTTP/Socket.IO) lives in server.ts.
 */
// Allow BigInt (e.g. wallet balances) to be JSON-serialized as strings.
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function toJSON(): string {
  return this.toString();
};

export const createApp = (): Express => {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // Security
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  );

  // Parsing & performance
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(compression());

  // Tracing & rate limiting
  app.use(requestId);
  app.use(env.API_PREFIX, globalRateLimiter);

  // API
  app.use(env.API_PREFIX, apiRouter);

  // 404 + error handling (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
