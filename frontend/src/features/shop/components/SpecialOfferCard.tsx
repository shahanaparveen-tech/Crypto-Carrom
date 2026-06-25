import { ActionPill, Countdown } from '@shared/components';
import { formatCoins } from '@shared/utils/format';
import type { SpecialOffer } from '../data/shop';
import { CoinPile, GemPile } from './ShopArt';

export const SpecialOfferCard = ({ offer }: { offer: SpecialOffer }): JSX.Element => (
  <div className="grid grid-cols-2 overflow-hidden rounded-2xl border-2 border-gold/60 shadow-panel">
    {/* Promo panel */}
    <div className="relative flex flex-col justify-between bg-gradient-to-br from-indigo-700 via-purple-700 to-purple-900 p-4">
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
      <h3 className="relative font-display text-2xl font-extrabold uppercase italic leading-none text-white drop-shadow">
        {offer.title}
      </h3>
      <p className="relative text-xs font-semibold text-white/80">
        Ends in: <Countdown seconds={offer.endsIn} compact />
      </p>
    </div>

    {/* Reward panel */}
    <div className="relative flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-600 to-fuchsia-800 p-4">
      <span className="absolute left-2 top-2 flex h-11 w-11 rotate-[-12deg] items-center justify-center rounded-full bg-red-600 text-center text-[10px] font-black leading-tight text-white shadow ring-2 ring-white/40">
        {offer.discount}
      </span>
      {offer.rewardLabel === 'Gems' ? <GemPile size={64} /> : <CoinPile size={64} />}
      <div className="rounded-lg bg-black/30 px-4 py-1 text-center">
        <span className="block text-[11px] uppercase tracking-wide text-white/70">
          {offer.rewardLabel}
        </span>
        <span className="font-display text-lg font-bold text-white">
          {formatCoins(offer.amount)}
        </span>
      </div>
      <ActionPill tone="green" className="w-full">
        {offer.price}
      </ActionPill>
    </div>
  </div>
);
