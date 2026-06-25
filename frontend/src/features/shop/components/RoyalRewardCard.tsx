import { Info } from 'lucide-react';

import { ActionPill } from '@shared/components';
import { cn } from '@shared/utils/cn';
import type { RoyalReward } from '../data/shop';
import { CoinPile } from './ShopArt';

const TONE: Record<RoyalReward['tone'], string> = {
  wood: 'from-wood/55 to-wood-dark/55',
  orange: 'from-orange-600/55 to-orange-900/60',
  red: 'from-rose-700/55 to-red-950/60',
};

const Art = ({ reward }: { reward: RoyalReward }): JSX.Element => {
  if (reward.id === 'coins') return <CoinPile size={64} />;
  if (reward.id === 'basketball')
    return (
      <span className="block h-14 w-14 rounded-full bg-gradient-to-b from-orange-400 to-orange-700 shadow-inner ring-2 ring-orange-900/40" />
    );
  // ukraine flag disc
  return (
    <span className="block h-14 w-14 overflow-hidden rounded-full shadow ring-2 ring-black/20">
      <span className="block h-1/2 w-full bg-sky-500" />
      <span className="block h-1/2 w-full bg-yellow-400" />
    </span>
  );
};

export const RoyalRewardCard = ({ reward }: { reward: RoyalReward }): JSX.Element => (
  <div
    className={cn(
      'relative flex flex-col items-center gap-2 rounded-2xl border border-gold/20 bg-gradient-to-b p-4 shadow-panel',
      TONE[reward.tone],
    )}
  >
    <button
      aria-label={`${reward.name} info`}
      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-b from-sky-400 to-blue-600 text-white shadow ring-1 ring-black/25"
    >
      <Info size={14} />
    </button>

    <div className="flex w-full items-center justify-between">
      <p className="font-display text-base font-bold text-white">{reward.name}</p>
      <span className="rounded-md bg-black/40 px-2 py-0.5 text-xs font-bold text-gold-light">
        {reward.multiplier}
      </span>
    </div>

    <div className="py-2">
      <Art reward={reward} />
    </div>

    <ActionPill tone="blue" className="w-full">
      {reward.action}
    </ActionPill>
  </div>
);
