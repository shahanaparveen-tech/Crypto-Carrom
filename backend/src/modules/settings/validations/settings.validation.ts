import { z } from 'zod';

export const updateSettingsSchema = z
  .object({
    soundEnabled: z.boolean().optional(),
    musicEnabled: z.boolean().optional(),
    vibrationEnabled: z.boolean().optional(),
    notificationsEnabled: z.boolean().optional(),
    language: z.string().min(2).max(5).optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, { message: 'No settings provided' });

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
