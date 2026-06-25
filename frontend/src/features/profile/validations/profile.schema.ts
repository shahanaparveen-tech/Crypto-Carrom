import { z } from 'zod';

export const editProfileSchema = z.object({
  displayName: z.string().min(2, 'Too short').max(40, 'Too long').optional().or(z.literal('')),
  country: z.string().length(2, 'Use a 2-letter code').optional().or(z.literal('')),
  avatarUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  bio: z.string().max(280, 'Max 280 characters').optional().or(z.literal('')),
});

export type EditProfileValues = z.infer<typeof editProfileSchema>;
