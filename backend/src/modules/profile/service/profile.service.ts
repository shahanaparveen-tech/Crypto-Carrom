import type { Profile } from '@prisma/client';

import { profileRepository } from '../repository/profile.repository';
import { NotFoundError } from '../../../shared/errors';
import type { UpdateProfileInput } from '../validations/profile.validation';

export const profileService = {
  async getOwn(userId: string): Promise<Profile> {
    const profile = await profileRepository.findByUserId(userId);
    if (!profile) throw new NotFoundError('Profile not found');
    return profile;
  },

  async getPublic(userId: string) {
    const profile = await profileRepository.findPublicByUserId(userId);
    if (!profile) throw new NotFoundError('Profile not found');
    const { user, ...rest } = profile;
    return {
      ...rest,
      username: user.username,
      memberSince: user.createdAt,
    };
  },

  async update(userId: string, input: UpdateProfileInput): Promise<Profile> {
    await this.getOwn(userId); // ensure exists
    return profileRepository.update(userId, input);
  },
};
