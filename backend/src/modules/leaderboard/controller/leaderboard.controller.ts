import type { Request, Response } from 'express';

import { leaderboardService } from '../service/leaderboard.service';
import { sendSuccess } from '../../../shared/utils/apiResponse';
import { getAuthUser } from '../../../shared/utils/requestUser';

export const leaderboardController = {
  async list(req: Request, res: Response): Promise<void> {
    const { items, meta } = await leaderboardService.list(req.query as Record<string, string>);
    sendSuccess(res, { leaderboard: items }, 'OK', 200, meta);
  },

  async me(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    const entry = await leaderboardService.me(user.id);
    sendSuccess(res, { entry });
  },
};
