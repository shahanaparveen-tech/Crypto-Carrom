import { Router } from 'express';

import { settingsController } from '../controller/settings.controller';
import { updateSettingsSchema } from '../validations/settings.validation';
import { authenticate, validate } from '../../../app/middlewares';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

export const settingsRouter = Router();

settingsRouter.use(authenticate);
settingsRouter.get('/', asyncHandler(settingsController.get));
settingsRouter.patch(
  '/',
  validate({ body: updateSettingsSchema }),
  asyncHandler(settingsController.update),
);
