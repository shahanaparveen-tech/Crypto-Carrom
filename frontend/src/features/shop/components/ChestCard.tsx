import { Info, Gem } from 'lucide-react';

import { ActionPill } from '@shared/components';
import type { PremiumChest } from '../data/shop';
import { ChestArt } from './ShopArt';

interface ChestCardProps {
  chest: PremiumChest;
  onBuy?: (c: PremiumChest) => void;
}

export const ChestCard = ({ chest, onBuy }: ChestCardProps): JSX.Element => (
  <div className="relative flex flex-col items-center gap-3 rounded-2xl border border-gold/20 bg-gradient-to-b from-wood/45 to-wood-dark/50 p-4 shadow-panel">
    <button
      aria-label={`${chest.name} info`}
      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-b from-sky-400 to-blue-600 text-white shadow ring-1 ring-black/25"
    >
      <Info size={14} />
    </button>

    <p className="font-display text-lg font-bold text-felt">{chest.name}</p>
    <ChestArt tone={chest.tone} size={110} />

    <ActionPill
      tone="green"
      className="w-full"
      icon={<Gem size={15} className="text-sky-200" fill="currentColor" />}
      onClick={() => onBuy?.(chest)}
    >
      {chest.gems}
    </ActionPill>
  </div>
);
