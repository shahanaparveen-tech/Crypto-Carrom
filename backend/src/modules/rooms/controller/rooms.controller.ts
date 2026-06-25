import type { Request, Response } from 'express';

import { roomsService } from '../service/rooms.service';
import { sendSuccess } from '../../../shared/utils/apiResponse';
import { getAuthUser } from '../../../shared/utils/requestUser';

export const roomsController = {
  async create(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    const room = await roomsService.create(
      user.id,
      req.body as { mode?: string; maxPlayers?: number },
    );
    sendSuccess(res, { room }, 'Room created', 201);
  },

  async join(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    const { code } = req.body as { code: string };
    const room = await roomsService.join(user.id, code);
    sendSuccess(res, { room }, 'Joined room');
  },

  async get(req: Request, res: Response): Promise<void> {
    const room = await roomsService.get(req.params.code as string);
    sendSuccess(res, { room });
  },

  async leave(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    const { roomId } = req.body as { roomId: string };
    await roomsService.leave(user.id, roomId);
    sendSuccess(res, { left: true });
  },
};
