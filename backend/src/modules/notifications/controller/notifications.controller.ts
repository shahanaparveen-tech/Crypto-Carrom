import type { Request, Response } from 'express';

import { notificationsService } from '../service/notifications.service';
import { sendSuccess } from '../../../shared/utils/apiResponse';
import { getAuthUser } from '../../../shared/utils/requestUser';

export const notificationsController = {
  async list(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    const { items, unread, meta } = await notificationsService.list(
      user.id,
      req.query as Record<string, string>,
    );
    sendSuccess(res, { notifications: items, unread }, 'OK', 200, meta);
  },

  async markRead(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    await notificationsService.markRead(user.id, req.params.id as string);
    sendSuccess(res, { read: true });
  },

  async markAllRead(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    await notificationsService.markAllRead(user.id);
    sendSuccess(res, { read: true });
  },
};
