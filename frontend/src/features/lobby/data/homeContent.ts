import {
  Gift,
  Dices,
  Clapperboard,
  Sticker,
  Film,
  BadgePercent,
  Sparkles,
  Users,
  BookImage,
  Home,
  UserRound,
  Swords,
  Trophy,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react';

import { ROUTES } from '@app/config/routes.constants';

/** Visual tone presets used across rail items, actions and chests. */
export type Tone = 'gold' | 'blue' | 'green' | 'red' | 'purple' | 'wood';

export interface RailItem {
  id: string;
  label: string;
  icon: LucideIcon;
  tone: Tone;
  /** Small numeric notification badge. */
  badge?: number;
  /** Show a "!" alert badge instead of a number. */
  alert?: boolean;
  /** Countdown duration in seconds (renders a live timer chip). */
  timer?: number;
  /** Short corner tag, e.g. "AD". */
  tag?: string;
}

/** Left feature rail — seasonal events & mini-games. */
export const LEFT_RAIL: RailItem[] = [
  { id: 'daily-gift', label: 'Daily Gift', icon: Gift, tone: 'blue', badge: 1 },
  { id: 'carrom-cricket', label: 'Carrom Cricket', icon: Dices, tone: 'purple' },
  {
    id: 'cinema-party',
    label: 'Cinema Party',
    icon: Clapperboard,
    tone: 'red',
    timer: 6 * 86400 + 17 * 3600,
  },
  {
    id: 'sticker-rush',
    label: 'Sticker Rush',
    icon: Sticker,
    tone: 'gold',
    badge: 6,
    timer: 6 * 86400 + 17 * 3600,
  },
  {
    id: 'bollywood-retro',
    label: 'Bollywood Retro',
    icon: Film,
    tone: 'red',
    badge: 5,
    timer: 6 * 86400 + 17 * 3600,
  },
];

/** Right feature rail — store & social shortcuts. */
export const RIGHT_RAIL: RailItem[] = [
  { id: 'free-gift', label: 'Free Gift', icon: Gift, tone: 'gold' },
  { id: 'no-ads', label: 'No Ads', icon: BadgePercent, tone: 'red', tag: 'AD' },
  { id: 'pocket-effect', label: 'Pocket Effect', icon: Sparkles, tone: 'purple' },
  { id: 'club', label: 'Club', icon: Users, tone: 'gold' },
  { id: 'album', label: 'Album', icon: BookImage, tone: 'purple', alert: true },
];

export type ActionId = 'collect' | 'play' | 'jackpot' | 'bollywood';

export interface CenterAction {
  id: ActionId;
  title: string;
  subtitle?: string;
  tone: Tone;
  icon: LucideIcon;
}

/** Central call-to-action stack. */
export const CENTER_ACTIONS: CenterAction[] = [
  { id: 'collect', title: 'Collect Rewards', tone: 'gold', icon: Gift },
  { id: 'play', title: 'Play', subtitle: 'Practice on the board', tone: 'blue', icon: Dices },
  { id: 'jackpot', title: 'Jackpot Of The Month', tone: 'green', icon: Trophy },
  { id: 'bollywood', title: 'Bollywood Retro', tone: 'red', icon: Film },
];

/** Tap-to-unlock chest timers (seconds). */
export const CHESTS: number[] = [10, 30, 60, 300];

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  to: string;
  badge?: number;
}

/** Bottom navigation tabs. */
export const BOTTOM_NAV: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, to: ROUTES.LOBBY },
  { id: 'friends', label: 'Friends', icon: UserRound, to: ROUTES.LEADERBOARD },
  { id: 'equipment', label: 'Equipment', icon: Swords, to: ROUTES.PROFILE },
  { id: 'events', label: 'Events', icon: Trophy, to: ROUTES.LEADERBOARD, badge: 7 },
  { id: 'shop', label: 'Shop', icon: ShoppingBag, to: ROUTES.WALLET },
];

/** Leaderboard event countdown (seconds) shown in the promo strip. */
export const LEADERBOARD_ENDS_IN = 4 * 86400 + 23 * 3600 + 36 * 60;

/** Tailwind classes per tone for solid action buttons. */
export const TONE_BG: Record<Tone, string> = {
  gold: 'from-gold-light via-gold to-gold-dark text-maroon-dark',
  blue: 'from-sky-400 via-sky-500 to-sky-700 text-white',
  green: 'from-emerald-400 via-emerald-500 to-emerald-700 text-white',
  red: 'from-rose-500 via-red-600 to-red-800 text-white',
  purple: 'from-fuchsia-400 via-purple-500 to-purple-700 text-white',
  wood: 'from-wood-light via-wood to-wood-dark text-felt',
};

/** Tailwind classes per tone for the small rail icon tiles. */
export const TONE_TILE: Record<Tone, string> = {
  gold: 'from-gold-light to-gold-dark text-maroon-dark',
  blue: 'from-sky-400 to-sky-700 text-white',
  green: 'from-emerald-400 to-emerald-700 text-white',
  red: 'from-rose-500 to-red-800 text-white',
  purple: 'from-fuchsia-400 to-purple-700 text-white',
  wood: 'from-wood-light to-wood-dark text-felt',
};
