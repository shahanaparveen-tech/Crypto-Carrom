import { http } from '@shared/services/http';
import type { Profile } from '@shared/types/domain.types';

export interface UpdateProfileBody {
  displayName?: string;
  avatarUrl?: string;
  country?: string;
  bio?: string;
}

export const profileApi = {
  getMine() {
    return http.get<{ profile: Profile }>('/profile/me');
  },
  update(body: UpdateProfileBody) {
    return http.patch<{ profile: Profile }>('/profile/me', body);
  },
};
