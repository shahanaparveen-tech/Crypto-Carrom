import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    displayName: z.string().min(2).max(40).trim().optional(),
    avatarUrl: z.string().url().max(500).optional(),
    country: z.string().length(2).toUpperCase().optional(),
    bio: z.string().max(280).trim().optional(),
  })
  .strict();

export const userIdParamSchema = z.object({
  userId: z.string().cuid(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
