import { Router } from 'express';

import { walletController } from '../controller/wallet.controller';
import { authenticate } from '../../../app/middlewares';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

export const walletRouter = Router();

walletRouter.use(authenticate);
walletRouter.get('/', asyncHandler(walletController.getBalance));
walletRouter.get('/transactions', asyncHandler(walletController.getTransactions));
