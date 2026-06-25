import { Router } from 'express';

import { usersController } from '../controller/users.controller';
import { searchUsersSchema, userIdParamSchema } from '../validations/users.validation';
import { authenticate, validate } from '../../../app/middlewares';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

export const usersRouter = Router();

usersRouter.use(authenticate);

usersRouter.get(
  '/search',
  validate({ query: searchUsersSchema }),
  asyncHandler(usersController.search),
);
usersRouter.get(
  '/:userId',
  validate({ params: userIdParamSchema }),
  asyncHandler(usersController.getById),
);
