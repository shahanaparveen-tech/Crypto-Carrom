import { prisma } from '../../../app/config/prisma';

const publicSelect = {
  id: true,
  username: true,
  role: true,
  status: true,
  isEmailVerified: true,
  createdAt: true,
  profile: {
    select: { displayName: true, avatarUrl: true, country: true, level: true, rating: true },
  },
} as const;

export const usersRepository = {
  findPublicById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: publicSelect });
  },

  search(term: string, skip: number, take: number) {
    const where = {
      status: { not: 'DELETED' as const },
      username: { contains: term, mode: 'insensitive' as const },
    };
    return Promise.all([
      prisma.user.findMany({
        where,
        select: publicSelect,
        skip,
        take,
        orderBy: { username: 'asc' },
      }),
      prisma.user.count({ where }),
    ]);
  },
};
