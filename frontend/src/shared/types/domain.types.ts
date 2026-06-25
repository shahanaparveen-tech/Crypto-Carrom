export type AuthProvider = 'GUEST' | 'GOOGLE' | 'FACEBOOK' | 'EMAIL';

export interface PublicUser {
  id: string;
  email: string | null;
  username: string;
  role: 'PLAYER' | 'MODERATOR' | 'ADMIN';
  provider: AuthProvider;
  isGuest: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DELETED';
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  country: string | null;
  bio: string | null;
  level: number;
  xp: number;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winStreak: number;
  bestStreak: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  balance: string; // BigInt serialized as string
  gems: string; // premium currency, BigInt serialized as string
  currency: string;
  status: 'ACTIVE' | 'FROZEN';
}

export interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  reason: string;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  referenceId: string | null;
  createdAt: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  notificationsEnabled: boolean;
  language: string;
  theme: 'light' | 'dark' | 'system';
}
