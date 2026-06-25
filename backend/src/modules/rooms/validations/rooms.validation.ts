import { z } from 'zod';

export const createRoomSchema = z.object({
  mode: z.enum(['disc', 'carrom', 'freestyle']).optional(),
  maxPlayers: z.coerce.number().int().min(2).max(4).optional(),
});

export const joinRoomSchema = z.object({
  code: z.string().trim().min(4).max(8),
});

export const roomCodeParamSchema = z.object({
  code: z.string().trim().min(4).max(8),
});

export const leaveRoomSchema = z.object({
  roomId: z.string().cuid(),
});
