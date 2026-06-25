import { ActionPill } from '@shared/components';
import { formatCoins } from '@shared/utils/format';
import type { Pack } from '../data/shop';
import { GemPile, CoinPile } from './ShopArt';

interface PackCardProps {
  pack: Pack;
  kind: 'gems' | 'coins';
  onBuy?: (p: Pack) => void;
}

export const PackCard = ({ pack, kind, onBuy }: PackCardProps): JSX.Element => (
  <div className="relative flex flex-col items-center gap-2 rounded-2xl border-2 border-gold/60 bg-gradient-to-b from-wood/50 to-wood-dark/50 px-3 pb-3 pt-6 text-center shadow-panel">
    {pack.firstPurchase && (
      <div className="absolute -left-1 top-2 flex items-center">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-[11px] font-black text-white ring-2 ring-maroon-dark">
          x2
        </span>
        <span className="-ml-1 rounded-r-md bg-red-700 py-0.5 pl-2 pr-2 text-[10px] font-bold uppercase tracking-wide text-white">
          1st Purchase
        </span>
      </div>
    )}

    <p className="font-display text-sm font-bold text-felt">{pack.name}</p>

    <div className="relative py-1">
      {kind === 'gems' ? <GemPile size={68} /> : <CoinPile size={68} />}
      <span className="absolute -right-1 -top-1 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-lime-400 to-green-600 text-[11px] font-black text-white shadow ring-1 ring-black/20">
        {pack.bonus}
      </span>
    </div>

    <div className="leading-tight">
      <span className="block text-xs font-semibold text-felt/45 line-through decoration-red-500 decoration-2">
        {formatCoins(pack.was)}
      </span>
      <span className="font-display text-lg font-extrabold text-felt">
        {formatCoins(pack.amount)}
      </span>
    </div>

    <ActionPill tone="green" className="w-full" onClick={() => onBuy?.(pack)}>
      {pack.price}
    </ActionPill>
  </div>
);
