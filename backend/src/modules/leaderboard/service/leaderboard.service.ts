import { leaderboardRepository } from '../repository/leaderboard.repository';
import { getPagination, buildPaginationMeta } from '../../../shared/utils/pagination';

const winRate = (won: number, played: number): number =>
  played > 0 ? Math.round((won / played) * 100) : 0;

export const leaderboardService = {
  async list(query: { page?: string; limit?: string }) {
    const { page, limit, skip } = getPagination(query);
    const [rows, total] = await leaderboardRepository.top(skip, limit);
    const items = rows.map((p, i) => ({
      rank: skip + i + 1,
      userId: p.userId,
      username: p.user.username,
      displayName: p.displayName,
      avatarUrl: p.avatarUrl,
      country: p.country,
      rating: p.rating,
      level: p.level,
      gamesWon: p.gamesWon,
      winRate: winRate(p.gamesWon, p.gamesPlayed),
    }));
    return { items, meta: buildPaginationMeta(total, page, limit) };
  },

  async me(userId: string) {
    const p = await leaderboardRepository.findMine(userId);
    if (!p) return null;
    return {
      rank: await leaderboardRepository.rankOf(p.rating),
      userId: p.userId,
      username: p.user.username,
      displayName: p.displayName,
      avatarUrl: p.avatarUrl,
      rating: p.rating,
      level: p.level,
      gamesWon: p.gamesWon,
      winRate: winRate(p.gamesWon, p.gamesPlayed),
    };
  },
};
