import { prisma } from '../../../app/config/prisma';

const entrySelect = {
  userId: true,
  rating: true,
  level: true,
  gamesPlayed: true,
  gamesWon: true,
  displayName: true,
  avatarUrl: true,
  country: true,
  user: { select: { username: true } },
} as const;

export const leaderboardRepository = {
  /** Top profiles by rating (global). */
  top(skip: number, take: number) {
    return Promise.all([
      prisma.profile.findMany({
        orderBy: [{ rating: 'desc' }, { gamesWon: 'desc' }],
        skip,
        take,
        select: entrySelect,
      }),
      prisma.profile.count(),
    ]);
  },

  findMine(userId: string) {
    return prisma.profile.findUnique({ where: { userId }, select: entrySelect });
  },

  /** Rank = how many players out-rate me, +1. */
  async rankOf(rating: number): Promise<number> {
    const higher = await prisma.profile.count({ where: { rating: { gt: rating } } });
    return higher + 1;
  },
};
