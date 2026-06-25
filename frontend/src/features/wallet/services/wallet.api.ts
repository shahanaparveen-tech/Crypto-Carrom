import { http } from '@shared/services/http';
import type { Wallet, WalletTransaction } from '@shared/types/domain.types';

export const walletApi = {
  getBalance() {
    return http.get<{ wallet: Wallet }>('/wallet');
  },
  getTransactions(page = 1, limit = 20) {
    return http.getWithMeta<{ transactions: WalletTransaction[] }>('/wallet/transactions', {
      page,
      limit,
    });
  },
};
