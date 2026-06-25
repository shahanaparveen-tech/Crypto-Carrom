import type { UserSettings } from '@prisma/client';

import { settingsRepository } from '../repository/settings.repository';
import type { UpdateSettingsInput } from '../validations/settings.validation';

export const settingsService = {
  /** Returns settings, creating defaults on first access if missing. */
  async get(userId: string): Promise<UserSettings> {
    const existing = await settingsRepository.findByUserId(userId);
    if (existing) return existing;
    return settingsRepository.upsert(userId, {});
  },

  update(userId: string, input: UpdateSettingsInput): Promise<UserSettings> {
    return settingsRepository.upsert(userId, input);
  },
};
