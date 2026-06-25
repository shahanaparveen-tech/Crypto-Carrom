import { Router } from 'express';
import { z } from 'zod';

import { inventoryController } from '../controller/inventory.controller';
import { authenticate, validate } from '../../../app/middlewares';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

const equipSchema = z.object({ key: z.string().min(1).max(60) });

export const inventoryRouter = Router();

inventoryRouter.use(authenticate);
inventoryRouter.get('/', asyncHandler(inventoryController.get));
inventoryRouter.post(
  '/equip',
  validate({ body: equipSchema }),
  asyncHandler(inventoryController.equip),
);
