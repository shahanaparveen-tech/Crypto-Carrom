import { z } from 'zod';

export const userIdParamSchema = z.object({
  userId: z.string().cuid(),
});

export const searchUsersSchema = z.object({
  q: z.string().min(1).max(40),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
