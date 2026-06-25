import { useQuery } from '@tanstack/react-query';

import { leaderboardApi } from '../services/leaderboard.api';

export const useLeaderboard = () =>
  useQuery({ queryKey: ['leaderboard', 'global'], queryFn: () => leaderboardApi.list() });

export const useMyRank = () =>
  useQuery({ queryKey: ['leaderboard', 'me'], queryFn: () => leaderboardApi.me() });
