import { Router } from 'express';

import { friendsController } from '../controller/friends.controller';
import {
  sendRequestSchema,
  requestIdParamSchema,
  friendUserIdParamSchema,
} from '../validations/friends.validation';
import { authenticate, validate } from '../../../app/middlewares';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

export const friendsRouter = Router();

friendsRouter.use(authenticate);

friendsRouter.get('/', asyncHandler(friendsController.list));
friendsRouter.get('/requests', asyncHandler(friendsController.requests));
friendsRouter.get('/suggestions', asyncHandler(friendsController.suggestions));

friendsRouter.post(
  '/requests',
  validate({ body: sendRequestSchema }),
  asyncHandler(friendsController.sendRequest),
);
friendsRouter.post(
  '/requests/:requestId/accept',
  validate({ params: requestIdParamSchema }),
  asyncHandler(friendsController.accept),
);
friendsRouter.delete(
  '/requests/:requestId',
  validate({ params: requestIdParamSchema }),
  asyncHandler(friendsController.removeRequest),
);
friendsRouter.delete(
  '/:userId',
  validate({ params: friendUserIdParamSchema }),
  asyncHandler(friendsController.removeFriend),
);
