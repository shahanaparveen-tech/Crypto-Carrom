import { friendsRepository } from '../repository/friends.repository';
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from '../../../shared/errors';

const SUGGESTION_LIMIT = 10;

export const friendsService = {
  /** Accepted friends, each resolved to "the other" user. */
  async listFriends(userId: string) {
    const rows = await friendsRepository.listAccepted(userId);
    return rows.map((f) => ({
      friendshipId: f.id,
      since: f.updatedAt,
      user: f.requesterId === userId ? f.addressee : f.requester,
    }));
  },

  async listRequests(userId: string) {
    const [incoming, outgoing] = await Promise.all([
      friendsRepository.listIncoming(userId),
      friendsRepository.listOutgoing(userId),
    ]);
    return {
      incoming: incoming.map((f) => ({
        requestId: f.id,
        createdAt: f.createdAt,
        user: f.requester,
      })),
      outgoing: outgoing.map((f) => ({
        requestId: f.id,
        createdAt: f.createdAt,
        user: f.addressee,
      })),
    };
  },

  listSuggestions(userId: string) {
    return friendsRepository.suggestions(userId, SUGGESTION_LIMIT);
  },

  /** Send a friend request to another user. */
  async sendRequest(userId: string, addresseeId: string) {
    if (addresseeId === userId) throw new BadRequestError('You cannot add yourself');

    const existing = await friendsRepository.findBetween(userId, addresseeId);
    if (existing) {
      if (existing.status === 'ACCEPTED') throw new ConflictError('Already friends');
      if (existing.status === 'BLOCKED') throw new ForbiddenError('Unable to send request');
      // A pending request already exists in one direction.
      if (existing.addresseeId === userId) {
        // They already invited us — accept instead of duplicating.
        return friendsRepository.updateStatus(existing.id, 'ACCEPTED');
      }
      throw new ConflictError('Friend request already sent');
    }
    return friendsRepository.create(userId, addresseeId);
  },

  async acceptRequest(userId: string, requestId: string) {
    const req = await friendsRepository.findById(requestId);
    if (!req) throw new NotFoundError('Request not found');
    if (req.addresseeId !== userId) throw new ForbiddenError('Not your request');
    if (req.status !== 'PENDING') throw new BadRequestError('Request is not pending');
    return friendsRepository.updateStatus(requestId, 'ACCEPTED');
  },

  /** Decline an incoming request or cancel an outgoing one. */
  async removeRequest(userId: string, requestId: string) {
    const req = await friendsRepository.findById(requestId);
    if (!req) throw new NotFoundError('Request not found');
    if (req.addresseeId !== userId && req.requesterId !== userId) {
      throw new ForbiddenError('Not your request');
    }
    await friendsRepository.delete(requestId);
  },

  /** Remove an existing friendship (by the other user's id). */
  async removeFriend(userId: string, otherUserId: string) {
    const rel = await friendsRepository.findBetween(userId, otherUserId);
    if (!rel) throw new NotFoundError('Not friends');
    await friendsRepository.delete(rel.id);
  },
};
