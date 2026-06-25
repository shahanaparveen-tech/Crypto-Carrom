import type { Request, Response } from 'express';

import { profileService } from '../service/profile.service';
import { sendSuccess } from '../../../shared/utils/apiResponse';
import { getAuthUser } from '../../../shared/utils/requestUser';

export const profileController = {
  async getMine(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    const profile = await profileService.getOwn(user.id);
    sendSuccess(res, { profile });
  },

  async update(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    const profile = await profileService.update(user.id, req.body);
    sendSuccess(res, { profile }, 'Profile updated');
  },

  async getByUserId(req: Request, res: Response): Promise<void> {
    const profile = await profileService.getPublic(req.params.userId as string);
    sendSuccess(res, { profile });
  },
};
