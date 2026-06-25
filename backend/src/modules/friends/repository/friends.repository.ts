import type { Friend, FriendStatus } from '@prisma/client';

import { prisma } from '../../../app/config/prisma';

/** Public shape returned for a friend / suggested user. */
export const friendUserSelect = {
  id: true,
  username: true,
  profile: {
    select: { displayName: true, avatarUrl: true, country: true, level: true, rating: true },
  },
} as const;

export const friendsRepository = {
  /** Accepted friendships involving the user (either side). */
  listAccepted(userId: string) {
    return prisma.friend.findMany({
      where: { status: 'ACCEPTED', OR: [{ requesterId: userId }, { addresseeId: userId }] },
      include: { requester: { select: friendUserSelect }, addressee: { select: friendUserSelect } },
      orderBy: { updatedAt: 'desc' },
    });
  },

  /** Pending requests addressed TO the user (incoming). */
  listIncoming(userId: string) {
    return prisma.friend.findMany({
      where: { addresseeId: userId, status: 'PENDING' },
      include: { requester: { select: friendUserSelect } },
      orderBy: { createdAt: 'desc' },
    });
  },

  /** Pending requests SENT by the user (outgoing). */
  listOutgoing(userId: string) {
    return prisma.friend.findMany({
      where: { requesterId: userId, status: 'PENDING' },
      include: { addressee: { select: friendUserSelect } },
      orderBy: { createdAt: 'desc' },
    });
  },

  findBetween(a: string, b: string): Promise<Friend | null> {
    return prisma.friend.findFirst({
      where: {
        OR: [
          { requesterId: a, addresseeId: b },
          { requesterId: b, addresseeId: a },
        ],
      },
    });
  },

  findById(id: string): Promise<Friend | null> {
    return prisma.friend.findUnique({ where: { id } });
  },

  create(requesterId: string, addresseeId: string): Promise<Friend> {
    return prisma.friend.create({ data: { requesterId, addresseeId, status: 'PENDING' } });
  },

  updateStatus(id: string, status: FriendStatus): Promise<Friend> {
    return prisma.friend.update({ where: { id }, data: { status } });
  },

  delete(id: string): Promise<Friend> {
    return prisma.friend.delete({ where: { id } });
  },

  /** Users with no existing relation to the user — friend suggestions. */
  async suggestions(userId: string, take: number) {
    const related = await prisma.friend.findMany({
      where: { OR: [{ requesterId: userId }, { addresseeId: userId }] },
      select: { requesterId: true, addresseeId: true },
    });
    const exclude = new Set<string>([userId]);
    for (const r of related) {
      exclude.add(r.requesterId);
      exclude.add(r.addresseeId);
    }
    return prisma.user.findMany({
      where: { id: { notIn: [...exclude] }, status: { not: 'DELETED' } },
      select: friendUserSelect,
      take,
      orderBy: { createdAt: 'desc' },
    });
  },
};
