import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@shared/constants/queryKeys';
import { walletApi } from '../services/wallet.api';

export const useWalletBalance = () =>
  useQuery({
    queryKey: queryKeys.wallet.balance,
    queryFn: () => walletApi.getBalance(),
  });

export const useWalletTransactions = (page = 1) =>
  useQuery({
    queryKey: queryKeys.wallet.transactions(page),
    queryFn: () => walletApi.getTransactions(page),
  });
