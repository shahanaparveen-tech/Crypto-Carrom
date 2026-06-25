import type { Request, Response } from 'express';

import { shopService } from '../service/shop.service';
import { sendSuccess } from '../../../shared/utils/apiResponse';
import { getAuthUser } from '../../../shared/utils/requestUser';

export const shopController = {
  async catalog(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, shopService.catalog());
  },

  async buyChest(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    const result = await shopService.buyChest(user.id, req.params.chestId as string);
    sendSuccess(res, result, 'Chest opened');
  },
};
