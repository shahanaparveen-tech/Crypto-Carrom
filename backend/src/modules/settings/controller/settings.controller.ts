import type { Request, Response } from 'express';

import { settingsService } from '../service/settings.service';
import { sendSuccess } from '../../../shared/utils/apiResponse';
import { getAuthUser } from '../../../shared/utils/requestUser';

export const settingsController = {
  async get(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    const settings = await settingsService.get(user.id);
    sendSuccess(res, { settings });
  },

  async update(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    const settings = await settingsService.update(user.id, req.body);
    sendSuccess(res, { settings }, 'Settings updated');
  },
};
