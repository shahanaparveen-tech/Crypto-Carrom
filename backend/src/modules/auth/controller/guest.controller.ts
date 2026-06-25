import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { guestService } from '../service/guest.service';
import { sendSuccess } from '../../../shared/utils/apiResponse';
import { setRefreshCookie } from '../../../shared/helpers';

export const guestController = {
  async login(req: Request, res: Response): Promise<void> {
    const result = await guestService.loginAsGuest({
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
    setRefreshCookie(res, result.refreshToken);
    sendSuccess(
      res,
      { user: result.user, accessToken: result.accessToken },
      'Guest session created',
      StatusCodes.CREATED,
    );
  },
};
