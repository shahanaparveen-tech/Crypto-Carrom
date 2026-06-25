import type { Request, Response } from 'express';

import { walletService } from '../service/wallet.service';
import { sendSuccess } from '../../../shared/utils/apiResponse';
import { getAuthUser } from '../../../shared/utils/requestUser';

export const walletController = {
  async getBalance(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    const wallet = await walletService.getBalance(user.id);
    sendSuccess(res, { wallet });
  },

  async getTransactions(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    const { items, meta } = await walletService.getTransactions(
      user.id,
      req.query as Record<string, string>,
    );
    sendSuccess(res, { transactions: items }, 'OK', 200, meta);
  },
};
