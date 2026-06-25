import { Router } from 'express';

import { profileController } from '../controller/profile.controller';
import { updateProfileSchema, userIdParamSchema } from '../validations/profile.validation';
import { authenticate, validate } from '../../../app/middlewares';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

export const profileRouter = Router();

profileRouter.get('/me', authenticate, asyncHandler(profileController.getMine));

profileRouter.patch(
  '/me',
  authenticate,
  validate({ body: updateProfileSchema }),
  asyncHandler(profileController.update),
);

profileRouter.get(
  '/:userId',
  validate({ params: userIdParamSchema }),
  asyncHandler(profileController.getByUserId),
);
