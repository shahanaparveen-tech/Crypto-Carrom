import { Router } from 'express';
import { z } from 'zod';

import { shopController } from '../controller/shop.controller';
import { authenticate, validate } from '../../../app/middlewares';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

const chestParamSchema = z.object({ chestId: z.string().min(1).max(40) });

export const shopRouter = Router();

shopRouter.use(authenticate);
shopRouter.get('/catalog', asyncHandler(shopController.catalog));
shopRouter.post(
  '/chests/:chestId/buy',
  validate({ params: chestParamSchema }),
  asyncHandler(shopController.buyChest),
);
