import type { Request, Response } from 'express';

import { friendsService } from '../service/friends.service';
import { sendSuccess } from '../../../shared/utils/apiResponse';
import { getAuthUser } from '../../../shared/utils/requestUser';

export const friendsController = {
  async list(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    const friends = await friendsService.listFriends(user.id);
    sendSuccess(res, { friends });
  },

  async requests(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    const requests = await friendsService.listRequests(user.id);
    sendSuccess(res, requests);
  },

  async suggestions(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    const suggestions = await friendsService.listSuggestions(user.id);
    sendSuccess(res, { suggestions });
  },

  async sendRequest(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    const { addresseeId } = req.body as { addresseeId: string };
    const request = await friendsService.sendRequest(user.id, addresseeId);
    sendSuccess(res, { request }, 'Friend request sent', 201);
  },

  async accept(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    const friend = await friendsService.acceptRequest(user.id, req.params.requestId as string);
    sendSuccess(res, { friend }, 'Request accepted');
  },

  async removeRequest(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    await friendsService.removeRequest(user.id, req.params.requestId as string);
    sendSuccess(res, { removed: true });
  },

  async removeFriend(req: Request, res: Response): Promise<void> {
    const user = getAuthUser(req);
    await friendsService.removeFriend(user.id, req.params.userId as string);
    sendSuccess(res, { removed: true });
  },
};
