/** Central route-path registry. Keeps links and the router table in sync. */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',

  LOBBY: '/lobby',
  MATCHMAKING: '/matchmaking',
  STAGES: '/stages',
  PRACTICE: '/play',
  GAME: '/game/:roomId',
  MATCH: '/match/:roomId',
  PROFILE: '/profile',
  LEADERBOARD: '/leaderboard',
  WALLET: '/wallet',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',

  // Bottom-navigation destinations
  FRIENDS: '/friends',
  EQUIPMENT: '/equipment',
  EVENTS: '/events',
  SHOP: '/shop',

  CRYPTO: '/crypto',
  ADMIN: '/admin',

  NOT_FOUND: '*',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export const gameRoute = (roomId: string): string => `/game/${roomId}`;
export const matchRoute = (roomId: string): string => `/match/${roomId}`;
