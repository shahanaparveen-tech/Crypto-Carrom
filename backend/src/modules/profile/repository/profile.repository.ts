import type { Prisma, Profile } from '@prisma/client';

import { prisma } from '../../../app/config/prisma';

export const profileRepository = {
  findByUserId(userId: string): Promise<Profile | null> {
    return prisma.profile.findUnique({ where: { userId } });
  },

  /** Public profile joined with the owner's username. */
  findPublicByUserId(userId: string) {
    return prisma.profile.findUnique({
      where: { userId },
      include: { user: { select: { username: true, createdAt: true } } },
    });
  },

  update(userId: string, data: Prisma.ProfileUpdateInput): Promise<Profile> {
    return prisma.profile.update({ where: { userId }, data });
  },
};
