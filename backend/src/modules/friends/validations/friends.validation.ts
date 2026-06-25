import { z } from 'zod';

export const sendRequestSchema = z.object({
  addresseeId: z.string().cuid(),
});

export const requestIdParamSchema = z.object({
  requestId: z.string().cuid(),
});

export const friendUserIdParamSchema = z.object({
  userId: z.string().cuid(),
});
