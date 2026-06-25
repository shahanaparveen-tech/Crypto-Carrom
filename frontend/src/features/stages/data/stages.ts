export interface StageTheme {
  /** Card body gradient. */
  card: string;
  /** Inner ribbon / panel gradient. */
  panel: string;
  /** Border ring colour. */
  ring: string;
  /** Glow colour behind the landmark. */
  glow: string;
}

export interface Stage {
  id: string;
  /** Big title line, e.g. "PARIS". */
  title: string;
  /** Small subtitle line, e.g. "Stage". */
  subtitle: string;
  theme: StageTheme;
  /** Collection power earned (doubled). */
  cp: number;
  coins: number;
  /** Event-ticket reward (+N). */
  ticket: number;
  entryFee: number;
  /** Disc-pool piece count (6 or 9). */
  pieces: number;
  /** Shows the "50% Chance to receive a pack" panel. */
  packChance: boolean;
  /** 2v2 team mode badge. */
  mode2v2?: boolean;
  /** Stage the player progresses toward. */
  progressIn: string;
}

const PROGRESS = 'Bollywood Retro';

export const STAGES: Stage[] = [
  {
    id: 'paris',
    title: 'PARIS',
    subtitle: 'Stage',
    theme: {
      card: 'from-orange-500 to-orange-800',
      panel: 'from-orange-700/70 to-orange-900/70',
      ring: 'border-amber-300/50',
      glow: '#f59e0b',
    },
    cp: 160,
    coins: 400,
    ticket: 10,
    entryFee: 200,
    pieces: 6,
    packChance: true,
    progressIn: PROGRESS,
  },
  {
    id: 'delhi',
    title: 'DELHI',
    subtitle: 'Lounge',
    theme: {
      card: 'from-fuchsia-600 to-purple-800',
      panel: 'from-purple-800/70 to-fuchsia-900/70',
      ring: 'border-fuchsia-300/50',
      glow: '#d946ef',
    },
    cp: 190,
    coins: 1000,
    ticket: 10,
    entryFee: 500,
    pieces: 6,
    packChance: true,
    progressIn: PROGRESS,
  },
  {
    id: 'london',
    title: 'LONDON',
    subtitle: 'Park',
    theme: {
      card: 'from-blue-600 to-blue-900',
      panel: 'from-blue-800/70 to-blue-950/70',
      ring: 'border-sky-300/50',
      glow: '#3b82f6',
    },
    cp: 225,
    coins: 5000,
    ticket: 10,
    entryFee: 2600,
    pieces: 9,
    packChance: true,
    progressIn: PROGRESS,
  },
  {
    id: 'istanbul',
    title: 'ISTANBUL',
    subtitle: 'Bazaar',
    theme: {
      card: 'from-rose-600 to-rose-900',
      panel: 'from-rose-800/70 to-rose-950/70',
      ring: 'border-rose-300/50',
      glow: '#f43f5e',
    },
    cp: 260,
    coins: 10000,
    ticket: 10,
    entryFee: 5500,
    pieces: 9,
    packChance: true,
    progressIn: PROGRESS,
  },
  {
    id: 'tokyo',
    title: 'TOKYO',
    subtitle: 'Palace',
    theme: {
      card: 'from-amber-700/80 to-stone-800',
      panel: 'from-stone-700/70 to-stone-900/70',
      ring: 'border-amber-400/40',
      glow: '#d6a756',
    },
    cp: 240,
    coins: 7500,
    ticket: 10,
    entryFee: 4000,
    pieces: 9,
    packChance: false,
    mode2v2: true,
    progressIn: PROGRESS,
  },
];

export type GameMode = 'disc' | 'carrom' | 'freestyle';

export const MODES: { id: GameMode; label: string }[] = [
  { id: 'disc', label: 'Disc Pool' },
  { id: 'carrom', label: 'Carrom' },
  { id: 'freestyle', label: 'Freestyle' },
];
