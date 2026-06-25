import { http } from '@shared/services/http';

export interface ChestReward {
  chestId: string;
  reward: string;
  coins: string;
  gems: string;
}

export const shopApi = {
  buyChest(chestId: string) {
    return http.post<ChestReward>(`/shop/chests/${chestId}/buy`);
  },
};
