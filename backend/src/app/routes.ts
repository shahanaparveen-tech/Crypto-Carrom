import { Router } from 'express';

import { prisma } from './config/prisma';
import { sendSuccess } from '../shared/utils/apiResponse';
import { asyncHandler } from '../shared/utils/asyncHandler';
import { authRouter } from '../modules/auth';
import { usersRouter } from '../modules/users';
import { profileRouter } from '../modules/profile';
import { walletRouter } from '../modules/wallet';
import { settingsRouter } from '../modules/settings';
import { friendsRouter } from '../modules/friends';
import { roomsRouter } from '../modules/rooms';
import { leaderboardRouter } from '../modules/leaderboard';
import { notificationsRouter } from '../modules/notifications';

/**
 * Root API router. Every module router is mounted here under its own path.
 *
 * Mount map:
 *   /auth          → modules/auth          ✅
 *   /users         → modules/users         ✅
 *   /profile       → modules/profile       ✅
 *   /lobby         → modules/lobby
 *   /matchmaking   → modules/matchmaking
 *   /game          → modules/game
 *   /leaderboard   → modules/leaderboard
 *   /wallet        → modules/wallet        ✅
 *   /chat          → modules/chat
 *   /notifications → modules/notifications
 *   /settings      → modules/settings      ✅
 *   /crypto        → modules/crypto   (Phase 5)
 *   /admin         → modules/admin
 */
export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/profile', profileRouter);
apiRouter.use('/wallet', walletRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/friends', friendsRouter);
apiRouter.use('/rooms', roomsRouter);
apiRouter.use('/leaderboard', leaderboardRouter);
apiRouter.use('/notifications', notificationsRouter);

/** Liveness + dependency health check. */
apiRouter.get(
  '/health',
  asyncHandler(async (_req, res) => {
    const [db] = await Promise.allSettled([prisma.$queryRaw`SELECT 1`]);
    sendSuccess(res, {
      status: 'ok',
      uptime: process.uptime(),
      services: {
        database: db.status === 'fulfilled' ? 'up' : 'down',
      },
    });
  }),
);

apiRouter.get('/version', (_req, res) => {
  sendSuccess(res, { name: 'crypto-carrom-api', version: '0.1.0' });
});
