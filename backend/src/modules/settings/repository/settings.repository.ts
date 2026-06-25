import type { Prisma, UserSettings } from '@prisma/client';

import { prisma } from '../../../app/config/prisma';

export type SettingsPatch = Partial<
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

export const settingsRepository = {
  findByUserId(userId: string): Promise<UserSettings | null> {
    return prisma.userSettings.findUnique({ where: { userId } });
  },

  /** Upsert so settings exist even for accounts created before this module. */
  upsert(userId: string, data: SettingsPatch): Promise<UserSettings> {
    const create: Prisma.UserSettingsUncheckedCreateInput = { userId, ...data };
    return prisma.userSettings.upsert({ where: { userId }, update: data, create });
  },
};
