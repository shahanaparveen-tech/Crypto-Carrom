export interface SpecialOffer {
  id: string;
  title: string;
  discount: string;
  rewardLabel: string;
  amount: number;
  price: string;
  endsIn: number; // seconds
}

export const SPECIAL_OFFERS: SpecialOffer[] = [
  {
    id: 'players-choice',
    title: "Player's Choice",
    discount: '50% OFF',
    rewardLabel: 'Coins',
    amount: 40000,
    price: '₹179',
    endsIn: 1 * 86400 + 10 * 3600 + 17 * 60,
  },
  {
    id: 'starter',
    title: 'Starter Pack',
    discount: '60% OFF',
    rewardLabel: 'Gems',
    amount: 500,
    price: '₹89',
    endsIn: 2 * 86400 + 4 * 3600,
  },
  {
    id: 'mega',
    title: 'Mega Bundle',
    discount: '40% OFF',
    rewardLabel: 'Coins',
    amount: 250000,
    price: '₹899',
    endsIn: 12 * 3600 + 30 * 60,
  },
];

export interface RoyalReward {
  id: string;
  name: string;
  multiplier: string;
  tone: 'wood' | 'orange' | 'red';
  action: string;
}

export const ROYAL_REWARDS: RoyalReward[] = [
  { id: 'coins', name: 'Coins', multiplier: 'x900', tone: 'wood', action: 'Chests' },
  { id: 'basketball', name: 'Basketball', multiplier: 'x5', tone: 'orange', action: 'Gems' },
  { id: 'ukraine', name: 'Ukraine', multiplier: 'x5', tone: 'red', action: 'Coins' },
];

export const ROYAL_REFRESH_IN = 2 * 86400 + 15 * 3600;

export type ChestTone = 'green' | 'blue' | 'gold';

export interface PremiumChest {
  id: string;
  name: string;
  tone: ChestTone;
  gems: number;
}

export const PREMIUM_CHESTS: PremiumChest[] = [
  { id: 'pro', name: 'Pro Chest', tone: 'green', gems: 100 },
  { id: 'master', name: 'Master Chest', tone: 'blue', gems: 200 },
  { id: 'supreme', name: 'Supreme Chest', tone: 'gold', gems: 520 },
];

export interface Pack {
  id: string;
  name: string;
  amount: number;
  was: number;
  price: string;
  bonus: string;
  firstPurchase: boolean;
  /** Relative pile size 1–4 for the artwork. */
  size: 1 | 2 | 3 | 4;
}

export const GEM_PACKS: Pack[] = [
  {
    id: 'g1',
    name: 'Handful of Gems',
    amount: 200,
    was: 100,
    price: '₹89',
    bonus: '100%',
    firstPurchase: true,
    size: 1,
  },
  {
    id: 'g2',
    name: 'Bunch of Gems',
    amount: 400,
    was: 200,
    price: '₹179',
    bonus: '100%',
    firstPurchase: true,
    size: 1,
  },
  {
    id: 'g3',
    name: 'Pile of Gems',
    amount: 1040,
    was: 520,
    price: '₹449',
    bonus: '100%',
    firstPurchase: true,
    size: 2,
  },
  {
    id: 'g4',
    name: 'Bag of Gems',
    amount: 2200,
    was: 1100,
    price: '₹899',
    bonus: '100%',
    firstPurchase: true,
    size: 3,
  },
  {
    id: 'g5',
    name: 'Locker of Gems',
    amount: 5000,
    was: 2500,
    price: '₹1,799',
    bonus: '100%',
    firstPurchase: true,
    size: 3,
  },
  {
    id: 'g6',
    name: 'Vault of Gems',
    amount: 16000,
    was: 8000,
    price: '₹4,499',
    bonus: '100%',
    firstPurchase: true,
    size: 4,
  },
];

export const COIN_PACKS: Pack[] = [
  {
    id: 'c1',
    name: 'Handful of Coins',
    amount: 20000,
    was: 10000,
    price: '₹89',
    bonus: '100%',
    firstPurchase: true,
    size: 1,
  },
  {
    id: 'c2',
    name: 'Bunch of Coins',
    amount: 40000,
    was: 20000,
    price: '₹179',
    bonus: '100%',
    firstPurchase: true,
    size: 1,
  },
  {
    id: 'c3',
    name: 'Pile of Coins',
    amount: 110000,
    was: 55000,
    price: '₹449',
    bonus: '100%',
    firstPurchase: true,
    size: 2,
  },
  {
    id: 'c4',
    name: 'Bag of Coins',
    amount: 230000,
    was: 115000,
    price: '₹899',
    bonus: '100%',
    firstPurchase: true,
    size: 3,
  },
  {
    id: 'c5',
    name: 'Locker of Coins',
    amount: 520000,
    was: 260000,
    price: '₹1,799',
    bonus: '100%',
    firstPurchase: true,
    size: 3,
  },
  {
    id: 'c6',
    name: 'Vault of Coins',
    amount: 1600000,
    was: 800000,
    price: '₹4,499',
    bonus: '100%',
    firstPurchase: true,
    size: 4,
  },
];
