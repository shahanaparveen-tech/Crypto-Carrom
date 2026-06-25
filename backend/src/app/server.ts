import { createServer } from 'http';

import { createApp } from './app';
import { initSocket } from './socket';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/prisma';
import { logger } from './logger';

/**
 * Process bootstrap: connect infrastructure, start HTTP + Socket.IO, and wire
 * graceful shutdown / fatal-error guards.
 */
const bootstrap = async (): Promise<void> => {
  await connectDatabase();
  logger.info('🗄️  Database connected');

  const app = createApp();
  const httpServer = createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    logger.info(
      `🚀 ${env.APP_NAME} API listening on http://localhost:${env.PORT}${env.API_PREFIX}`,
    );
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received — shutting down gracefully`);
    httpServer.close();
    await Promise.allSettled([disconnectDatabase()]);
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
};

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  process.exit(1);
});

bootstrap().catch((error: unknown) => {
  logger.error('Fatal: failed to start server', { error });
  process.exit(1);
});
