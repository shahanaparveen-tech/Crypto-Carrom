import { http } from '@shared/services/http';

export interface InventoryItem {
  key: string;
  name: string;
  category: string;
  rarity: string;
  owned: boolean;
  equipped: boolean;
}

export interface InventoryResponse {
  items: InventoryItem[];
  equipped: Record<string, string>;
}

export const inventoryApi = {
  get() {
    return http.get<InventoryResponse>('/inventory');
  },
  equip(key: string) {
    return http.post<InventoryResponse>('/inventory/equip', { key });
  },
};
