import { Router } from 'express';
import { z } from 'zod';

import { notificationsController } from '../controller/notifications.controller';
import { authenticate, validate } from '../../../app/middlewares';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

const idParamSchema = z.object({ id: z.string().cuid() });

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);
notificationsRouter.get('/', asyncHandler(notificationsController.list));
notificationsRouter.post('/read-all', asyncHandler(notificationsController.markAllRead));
notificationsRouter.post(
  '/:id/read',
  validate({ params: idParamSchema }),
  asyncHandler(notificationsController.markRead),
);
