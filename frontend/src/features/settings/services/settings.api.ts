import { http } from '@shared/services/http';
import type { UserSettings } from '@shared/types/domain.types';

export type UpdateSettingsBody = Partial<
  Pick<
    UserSettings,
    | 'soundEnabled'
    | 'musicEnabled'
    | 'vibrationEnabled'
    | 'notificationsEnabled'
    | 'language'
    | 'theme'
  >
>;

export const settingsApi = {
  get() {
    return http.get<{ settings: UserSettings }>('/settings');
  },
  update(body: UpdateSettingsBody) {
    return http.patch<{ settings: UserSettings }>('/settings', body);
  },
};
