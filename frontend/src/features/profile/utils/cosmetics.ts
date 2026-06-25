/**
 * Cosmetic catalogue for the profile screen. These are client-side presets for
 * now (no backend) — equipping is local state. When the inventory/customisation
 * backend lands, these become server-driven.
 */

export interface StrikerOption {
  id: string;
  name: string;
  tier: string;
  force: number; // 0..100
  aim: number;
  time: number;
}

export const STRIKERS: StrikerOption[] = [
  { id: 'blaze', name: 'Blaze', tier: 'Standard', force: 62, aim: 74, time: 55 },
  { id: 'pro', name: 'Pro Strike', tier: 'Standard', force: 70, aim: 60, time: 68 },
  { id: 'titan', name: 'Titan', tier: 'Premium', force: 88, aim: 52, time: 44 },
  { id: 'comet', name: 'Comet', tier: 'Premium', force: 58, aim: 90, time: 60 },
];

export interface CoinOption {
  id: string;
  name: string;
  tier: string;
  color: string;
}

export const COINS: CoinOption[] = [
  { id: 'black', name: 'Black', tier: 'Standard', color: '#23262e' },
  { id: 'classic', name: 'Classic', tier: 'Standard', color: '#f2efe6' },
  { id: 'royal', name: 'Royal', tier: 'Premium', color: '#6d28d9' },
  { id: 'ember', name: 'Ember', tier: 'Premium', color: '#d23b32' },
];

export interface AvatarOption {
  id: string;
  name: string;
  bg: string;
}

export const AVATARS: AvatarOption[] = [
  { id: 'a1', name: 'Maroon', bg: '#7a1f1a' },
  { id: 'a2', name: 'Wood', bg: '#9c5a25' },
  { id: 'a3', name: 'Gold', bg: '#c8881f' },
  { id: 'a4', name: 'Teal', bg: '#0e7c8a' },
  { id: 'a5', name: 'Violet', bg: '#6d28d9' },
  { id: 'a6', name: 'Slate', bg: '#334155' },
];

export interface FrameOption {
  id: string;
  name: string;
  ring: string; // tailwind ring/border colour class fragment
}

export const FRAMES: FrameOption[] = [
  { id: 'f1', name: 'Classic', ring: 'border-gold' },
  { id: 'f2', name: 'Champion', ring: 'border-emerald-400' },
  { id: 'f3', name: 'Royal', ring: 'border-brand-light' },
  { id: 'f4', name: 'Ember', ring: 'border-coin-queen' },
  { id: 'f5', name: 'Frost', ring: 'border-sky-300' },
];

// ---- Rank tiers (derived from matchmaking rating) ----

export interface RankTier {
  name: string;
  min: number;
  color: string;
}

export const RANK_TIERS: RankTier[] = [
  { name: 'Bronze', min: 0, color: '#cd7f32' },
  { name: 'Silver', min: 1100, color: '#c0c0c0' },
  { name: 'Gold', min: 1300, color: '#f5b942' },
  { name: 'Platinum', min: 1500, color: '#67e8f9' },
  { name: 'Diamond', min: 1700, color: '#93c5fd' },
  { name: 'Master', min: 1900, color: '#fb7185' },
];

export interface RankInfo {
  tier: RankTier;
  next: RankTier | null;
  /** 0..100 progress toward the next tier. */
  progress: number;
  toNext: number;
}

export const getRank = (rating: number): RankInfo => {
  let index = 0;
  for (let i = 0; i < RANK_TIERS.length; i += 1) {
    if (rating >= RANK_TIERS[i]!.min) index = i;
  }
  const tier = RANK_TIERS[index]!;
  const next = RANK_TIERS[index + 1] ?? null;
  if (!next) return { tier, next: null, progress: 100, toNext: 0 };
  const span = next.min - tier.min;
  const progress = Math.max(0, Math.min(100, ((rating - tier.min) / span) * 100));
  return { tier, next, progress, toNext: Math.max(0, next.min - rating) };
};
