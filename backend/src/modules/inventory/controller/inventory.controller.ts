import type { Request, Response } from 'express';

import { inventoryService } from '../service/inventory.service';
import { sendSuccess } from '../../../shared/utils/apiResponse';
import { getAuthUser } from '../../../shared/utils/requestUser';

export const inventoryController = {
  async get(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    const inventory = await inventoryService.get(user.id);
    sendSuccess(res, inventory);
  },

  async equip(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    const { key } = req.body as { key: string };
    const inventory = await inventoryService.equip(user.id, key);
    sendSuccess(res, inventory, 'Equipped');
  },
};
