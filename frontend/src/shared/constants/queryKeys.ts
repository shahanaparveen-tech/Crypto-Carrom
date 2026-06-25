/**
 * Centralized React Query keys. Using factories keeps cache invalidation
 * consistent across features.
 */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  profile: {
    byId: (id: string) => ['profile', id] as const,
  },
  lobby: {
    rooms: (filters?: unknown) => ['lobby', 'rooms', filters] as const,
  },
  leaderboard: {
    board: (period: string) => ['leaderboard', period] as const,
  },
  wallet: {
    balance: ['wallet', 'balance'] as const,
    transactions: (page: number) => ['wallet', 'transactions', page] as const,
  },
  notifications: {
    list: ['notifications', 'list'] as const,
  },
} as const;
