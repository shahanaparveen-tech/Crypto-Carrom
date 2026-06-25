/** Premium chests bought with gems; they open to a coin reward. */
export interface Chest {
  id: string;
  name: string;
  gems: bigint;
  coinMin: number;
  coinMax: number;
}

export const CHESTS: Chest[] = [
  { id: 'pro', name: 'Pro Chest', gems: 100n, coinMin: 5000, coinMax: 15000 },
  { id: 'master', name: 'Master Chest', gems: 200n, coinMin: 12000, coinMax: 30000 },
  { id: 'supreme', name: 'Supreme Chest', gems: 520n, coinMin: 40000, coinMax: 90000 },
];

export const findChest = (id: string): Chest | undefined => CHESTS.find((c) => c.id === id);
