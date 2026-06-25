import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { inventoryApi } from '../services/inventory.api';

const KEY = ['inventory'] as const;

export const useInventory = () => useQuery({ queryKey: KEY, queryFn: () => inventoryApi.get() });

export const useEquipItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => inventoryApi.equip(key),
    onSuccess: (data) => qc.setQueryData(KEY, data),
  });
};

/** Maps a frontend category to the backend item-key prefix. */
export const CATEGORY_PREFIX: Record<string, string> = {
  strikers: 'striker',
  powers: 'power',
  pucks: 'puck',
  trails: 'trail',
  pockets: 'pocket',
};

/** Maps a frontend category to the backend ItemCategory enum. */
export const CATEGORY_ENUM: Record<string, string> = {
  strikers: 'STRIKER',
  powers: 'POWER',
  pucks: 'PUCK',
  trails: 'TRAIL',
  pockets: 'POCKET',
};

export const itemKey = (category: string, id: string): string =>
  `${CATEGORY_PREFIX[category] ?? category}:${id}`;
