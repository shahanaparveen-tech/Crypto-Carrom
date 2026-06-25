import { http } from '@shared/services/http';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  country: string | null;
  rating: number;
  level: number;
  gamesWon: number;
  winRate: number;
}

export const leaderboardApi = {
  list() {
    return http.get<{ leaderboard: LeaderboardEntry[] }>('/leaderboard', { limit: 50 });
  },
  me() {
    return http.get<{ entry: LeaderboardEntry | null }>('/leaderboard/me');
  },
};
