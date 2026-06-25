import type { Request, Response } from 'express';

import { usersService } from '../service/users.service';
import { sendSuccess } from '../../../shared/utils/apiResponse';

export const usersController = {
  async search(req: Request, res: Response): Promise<void> {
    const { q } = req.query as { q: string };
    const { items, meta } = await usersService.search(q, req.query as Record<string, string>);
    sendSuccess(res, { users: items }, 'OK', 200, meta);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const user = await usersService.getById(req.params.userId as string);
    sendSuccess(res, { user });
  },
};
