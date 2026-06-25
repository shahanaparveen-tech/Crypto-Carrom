import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@shared/constants/queryKeys';
import { shopApi } from '../services/shop.api';

export const useBuyChest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (chestId: string) => shopApi.buyChest(chestId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.wallet.balance });
    },
  });
};
