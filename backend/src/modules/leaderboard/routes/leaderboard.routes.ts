import { Router } from 'express';

import { leaderboardController } from '../controller/leaderboard.controller';
import { authenticate } from '../../../app/middlewares';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

export const leaderboardRouter = Router();

leaderboardRouter.use(authenticate);
leaderboardRouter.get('/', asyncHandler(leaderboardController.list));
leaderboardRouter.get('/me', asyncHandler(leaderboardController.me));
