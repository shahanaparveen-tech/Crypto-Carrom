export type Rarity = 'STANDARD' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface RarityStyle {
  card: string;
  ring: string;
  text: string;
}

export const RARITY: Record<Rarity, RarityStyle> = {
  STANDARD: {
    card: 'from-wood/45 to-wood-dark/50',
    ring: 'border-wood-light/30',
    text: 'text-felt/60',
  },
  RARE: {
    card: 'from-amber-600/40 to-orange-900/50',
    ring: 'border-orange-400/40',
    text: 'text-orange-200',
  },
  EPIC: {
    card: 'from-rose-700/45 to-red-950/60',
    ring: 'border-rose-500/50',
    text: 'text-rose-200',
  },
  LEGENDARY: {
    card: 'from-fuchsia-700/45 to-purple-950/60',
    ring: 'border-fuchsia-400/50',
    text: 'text-fuchsia-200',
  },
};

export type Category = 'strikers' | 'powers' | 'pucks' | 'trails' | 'pockets';

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'strikers', label: 'Strikers' },
  { id: 'powers', label: 'Powers' },
  { id: 'pucks', label: 'Pucks' },
  { id: 'trails', label: 'Trails' },
  { id: 'pockets', label: 'Pockets' },
];

export type ArtKind = 'disc' | 'power' | 'puck' | 'trail' | 'pocket' | 'none';

export interface ItemFooter {
  title: string;
  sub?: string;
  lock?: boolean;
  ad?: boolean;
  bolt?: boolean;
}

export interface EquipItem {
  id: string;
  name: string;
  rarity?: Rarity;
  art: ArtKind;
  color: string;
  accent: string;
  owned: boolean;
  attrs?: { force: number; aim: number; time: number };
  progress?: { current: number; max: number };
  footer?: ItemFooter;
}

const chest = (sub: string): ItemFooter => ({ title: 'Find it in chests!', sub, lock: false });
const event = (): ItemFooter => ({ title: 'Find it in Events!', lock: true });
const prevPower = (): ItemFooter => ({ title: 'Unlock previous power', lock: true });

export const STRIKERS: EquipItem[] = [
  {
    id: 'blaze',
    name: 'Blaze',
    rarity: 'STANDARD',
    art: 'disc',
    color: '#f4f1e8',
    accent: '#c8881f',
    owned: true,
    attrs: { force: 45, aim: 55, time: 35 },
    progress: { current: 0, max: 10 },
  },
  {
    id: 'sunshine',
    name: 'Sunshine',
    rarity: 'STANDARD',
    art: 'disc',
    color: '#f4f1e8',
    accent: '#d98a2b',
    owned: false,
    progress: { current: 0, max: 5 },
    footer: chest('Paris Stage +'),
  },
  {
    id: 'arjun',
    name: 'Arjun',
    rarity: 'RARE',
    art: 'disc',
    color: '#e9d8c0',
    accent: '#b3261e',
    owned: false,
    progress: { current: 0, max: 7 },
    footer: chest('Paris Stage +'),
  },
  {
    id: 'sniper',
    name: 'Sniper',
    rarity: 'EPIC',
    art: 'disc',
    color: '#dff1f7',
    accent: '#19b3c4',
    owned: false,
    progress: { current: 0, max: 7 },
    footer: chest('Paris Stage +'),
  },
  {
    id: 'blood',
    name: 'Blood',
    rarity: 'RARE',
    art: 'disc',
    color: '#7a1410',
    accent: '#e0392b',
    owned: false,
    progress: { current: 0, max: 7 },
    footer: chest('Paris Stage +'),
  },
  {
    id: 'divine',
    name: 'Divine',
    rarity: 'EPIC',
    art: 'disc',
    color: '#7e3ff2',
    accent: '#c77dff',
    owned: false,
    progress: { current: 0, max: 10 },
    footer: chest('Paris Stage +'),
  },
  {
    id: 'zen',
    name: 'Zen',
    rarity: 'STANDARD',
    art: 'disc',
    color: '#c0392b',
    accent: '#e9c89a',
    owned: false,
    progress: { current: 0, max: 5 },
    footer: chest('Paris Stage +'),
  },
  {
    id: 'taj',
    name: 'Taj',
    rarity: 'STANDARD',
    art: 'disc',
    color: '#1f2937',
    accent: '#f5b942',
    owned: false,
    progress: { current: 0, max: 5 },
    footer: chest('Paris Stage +'),
  },
  {
    id: 'chakra',
    name: 'Chakra',
    rarity: 'STANDARD',
    art: 'disc',
    color: '#1e7d4f',
    accent: '#e9c89a',
    owned: false,
    progress: { current: 0, max: 5 },
    footer: chest('Paris Stage +'),
  },
];

export const POWERS: EquipItem[] = [
  {
    id: 'default',
    name: 'Default',
    art: 'power',
    color: '#f59e0b',
    accent: '#f59e0b',
    owned: true,
    attrs: { force: 18, aim: 14, time: 10 },
  },
  {
    id: 'spine',
    name: 'Spine',
    art: 'power',
    color: '#22d3ee',
    accent: '#0ea5e9',
    owned: false,
    progress: { current: 0, max: 20 },
    footer: { title: 'Points to unlock:', bolt: true },
  },
  {
    id: 'venom',
    name: 'Venom',
    art: 'power',
    color: '#84cc16',
    accent: '#65a30d',
    owned: false,
    footer: prevPower(),
  },
  {
    id: 'particle',
    name: 'Particle',
    art: 'power',
    color: '#d946ef',
    accent: '#a21caf',
    owned: false,
    footer: prevPower(),
  },
  {
    id: 'radiance',
    name: 'Radiance',
    art: 'power',
    color: '#ef4444',
    accent: '#b91c1c',
    owned: false,
    footer: prevPower(),
  },
  {
    id: 'reptile',
    name: 'Reptile',
    art: 'power',
    color: '#a3e635',
    accent: '#ca8a04',
    owned: false,
    footer: prevPower(),
  },
];

export const PUCKS: EquipItem[] = [
  {
    id: 'black',
    name: 'Black',
    rarity: 'STANDARD',
    art: 'puck',
    color: '#1f2937',
    accent: '#0b0f17',
    owned: true,
  },
  {
    id: 'white',
    name: 'White',
    rarity: 'STANDARD',
    art: 'puck',
    color: '#f4f1e8',
    accent: '#c9c2ad',
    owned: true,
  },
  {
    id: 'vervain',
    name: 'Vervain',
    rarity: 'STANDARD',
    art: 'puck',
    color: '#6d28d9',
    accent: '#4c1d95',
    owned: false,
    progress: { current: 0, max: 5 },
    footer: chest('Paris Stage +'),
  },
  {
    id: 'swathe',
    name: 'Swathe',
    rarity: 'RARE',
    art: 'puck',
    color: '#16a34a',
    accent: '#e5e7eb',
    owned: false,
    progress: { current: 0, max: 15 },
    footer: chest('Paris Stage +'),
  },
  {
    id: 'aqua',
    name: 'Aqua',
    rarity: 'EPIC',
    art: 'puck',
    color: '#0ea5e9',
    accent: '#38bdf8',
    owned: false,
    progress: { current: 0, max: 25 },
    footer: chest('Paris Stage +'),
  },
  {
    id: 'iris',
    name: 'Iris',
    rarity: 'STANDARD',
    art: 'puck',
    color: '#ea8c1c',
    accent: '#b45309',
    owned: false,
    progress: { current: 0, max: 10 },
    footer: chest('Delhi Lounge +'),
  },
  {
    id: 'enchant',
    name: 'Enchant',
    rarity: 'RARE',
    art: 'puck',
    color: '#dc2626',
    accent: '#f59e0b',
    owned: false,
    progress: { current: 0, max: 15 },
    footer: chest('Paris Stage +'),
  },
  {
    id: 'stardust',
    name: 'Stardust',
    rarity: 'EPIC',
    art: 'puck',
    color: '#3b82f6',
    accent: '#93c5fd',
    owned: false,
    progress: { current: 0, max: 25 },
    footer: chest('Paris Stage +'),
  },
  {
    id: 'oscar',
    name: 'Oscar',
    rarity: 'STANDARD',
    art: 'puck',
    color: '#16a34a',
    accent: '#86efac',
    owned: false,
    progress: { current: 0, max: 10 },
    footer: chest('Delhi Lounge +'),
  },
];

export const TRAILS: EquipItem[] = [
  { id: 'no-trail', name: 'No Trail', art: 'none', color: '#000', accent: '#000', owned: true },
  {
    id: 'burst',
    name: 'Burst',
    rarity: 'STANDARD',
    art: 'trail',
    color: '#f97316',
    accent: '#fbbf24',
    owned: false,
    footer: event(),
  },
  {
    id: 'verdant',
    name: 'Verdant',
    rarity: 'STANDARD',
    art: 'trail',
    color: '#22c55e',
    accent: '#86efac',
    owned: false,
    footer: event(),
  },
  {
    id: 'death',
    name: 'Death',
    rarity: 'RARE',
    art: 'trail',
    color: '#dc2626',
    accent: '#fca5a5',
    owned: false,
    footer: event(),
  },
  {
    id: 'haunted',
    name: 'Haunted',
    rarity: 'RARE',
    art: 'trail',
    color: '#2dd4bf',
    accent: '#99f6e4',
    owned: false,
    footer: event(),
  },
  {
    id: 'pennon',
    name: 'Pennon',
    rarity: 'RARE',
    art: 'trail',
    color: '#3b82f6',
    accent: '#4ade80',
    owned: false,
    footer: event(),
  },
  {
    id: 'flame',
    name: 'Flame',
    rarity: 'RARE',
    art: 'trail',
    color: '#f59e0b',
    accent: '#ef4444',
    owned: false,
    footer: event(),
  },
  {
    id: 'noel',
    name: 'Noel',
    rarity: 'RARE',
    art: 'trail',
    color: '#ef4444',
    accent: '#22c55e',
    owned: false,
    footer: event(),
  },
  {
    id: 'curse',
    name: 'Curse',
    rarity: 'RARE',
    art: 'trail',
    color: '#7c3aed',
    accent: '#c4b5fd',
    owned: false,
    footer: event(),
  },
];

export const POCKETS: EquipItem[] = [
  {
    id: 'no-pocket',
    name: 'No Pocket Effect',
    art: 'none',
    color: '#000',
    accent: '#000',
    owned: true,
  },
  {
    id: 'firestarter',
    name: 'Firestarter',
    rarity: 'STANDARD',
    art: 'pocket',
    color: '#f97316',
    accent: '#fbbf24',
    owned: false,
    footer: { title: 'Get it now!', ad: true },
  },
  {
    id: 'jade-echo',
    name: 'Jade Echo',
    rarity: 'RARE',
    art: 'pocket',
    color: '#22c55e',
    accent: '#86efac',
    owned: false,
    footer: { title: 'Coming Soon!', lock: true },
  },
  {
    id: 'mystic',
    name: 'Mystic',
    rarity: 'EPIC',
    art: 'pocket',
    color: '#fbbf24',
    accent: '#f59e0b',
    owned: false,
    footer: { title: 'Coming Soon!', lock: true },
  },
  {
    id: 'plasma',
    name: 'Plasma',
    rarity: 'EPIC',
    art: 'pocket',
    color: '#ec4899',
    accent: '#3b82f6',
    owned: false,
    footer: { title: 'Get it now!', ad: true },
  },
];

export const ITEMS: Record<Category, EquipItem[]> = {
  strikers: STRIKERS,
  powers: POWERS,
  pucks: PUCKS,
  trails: TRAILS,
  pockets: POCKETS,
};

/** Default equipped item per category (the "USING" one). */
export const DEFAULT_EQUIPPED: Record<Category, string> = {
  strikers: 'blaze',
  powers: 'default',
  pucks: 'black',
  trails: 'no-trail',
  pockets: 'no-pocket',
};

export const COLLECTION_POWER = { current: 0, max: 20, level: 2 };
