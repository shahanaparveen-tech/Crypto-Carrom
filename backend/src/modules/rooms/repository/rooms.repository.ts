import type { GameMode } from '@prisma/client';

import { prisma } from '../../../app/config/prisma';

const playerUserSelect = {
  id: true,
  username: true,
  profile: { select: { displayName: true, avatarUrl: true, level: true, rating: true } },
} as const;

/** Includes the active (pending) lobby match with its players. */
export const roomInclude = {
  host: { select: { id: true, username: true } },
  matches: {
    where: { status: 'PENDING' as const },
    orderBy: { createdAt: 'desc' as const },
    take: 1,
    include: {
      players: {
        orderBy: { seat: 'asc' as const },
        include: { user: { select: playerUserSelect } },
      },
    },
  },
} as const;

export type RoomWithMembers = NonNullable<Awaited<ReturnType<typeof roomsRepository.findByCode>>>;

export const roomsRepository = {
  /** Create a room + its pending lobby match with the host seated at 0. */
  create(params: { hostId: string; code: string; mode: GameMode; maxPlayers: number }) {
    return prisma.gameRoom.create({
      data: {
        code: params.code,
        hostId: params.hostId,
        mode: params.mode,
        visibility: 'PRIVATE',
        status: 'WAITING',
        maxPlayers: params.maxPlayers,
        matches: {
          create: {
            mode: params.mode,
            status: 'PENDING',
            players: { create: { userId: params.hostId, seat: 0 } },
          },
        },
      },
      include: roomInclude,
    });
  },

  findByCode(code: string) {
    return prisma.gameRoom.findUnique({ where: { code }, include: roomInclude });
  },

  findById(id: string) {
    return prisma.gameRoom.findUnique({ where: { id }, include: roomInclude });
  },

  addPlayer(matchId: string, userId: string, seat: number) {
    return prisma.matchPlayer.create({ data: { matchId, userId, seat } });
  },

  removePlayer(matchId: string, userId: string) {
    return prisma.matchPlayer.deleteMany({ where: { matchId, userId } });
  },

  setStatus(
    roomId: string,
    status: 'WAITING' | 'READY' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED',
  ) {
    return prisma.gameRoom.update({ where: { id: roomId }, data: { status } });
  },
};
