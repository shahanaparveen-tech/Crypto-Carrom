export const USER_ROLES = {
  PLAYER: 'PLAYER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const COOKIE_NAMES = {
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const WALLET = {
  SIGNUP_BONUS: 1000n,
  STARTING_GEMS: 120n,
  CURRENCY: 'COIN',
} as const;

export const GUEST = {
  USERNAME_PREFIX: 'Guest_',
  STARTING_COINS: 500n,
  STARTING_GEMS: 120n,
  AVATAR_URL: '/avatars/guest-default.png',
  MAX_USERNAME_ATTEMPTS: 6,
} as const;

/** Actions a guest account may NOT perform (enforced by requireNonGuest). */
export const GUEST_RESTRICTED_CAPABILITIES = [
  'crypto_withdraw',
  'crypto_tournament',
  'coin_transfer',
  'advanced_wallet',
] as const;

export type Capability = (typeof GUEST_RESTRICTED_CAPABILITIES)[number];

/** Verification/reset token lifetimes (hours). */
export const TOKEN_TTL = {
  EMAIL_VERIFY_HOURS: 24,
  PASSWORD_RESET_HOURS: 1,
} as const;

/** Refresh-token / session lifetime in milliseconds (7 days). */
export const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
