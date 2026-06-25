import { Clock, Play } from 'lucide-react';

import { CoinBadge, GemBadge, SectionRibbon, ActionPill, Countdown } from '@shared/components';
import { getApiErrorMessage } from '@shared/services/http';
import { formatCoins } from '@shared/utils/format';
import { useWalletBalance } from '@features/wallet/hooks/useWallet';
import { useBuyChest } from '../hooks/useShop';
import {
  SPECIAL_OFFERS,
  ROYAL_REWARDS,
  ROYAL_REFRESH_IN,
  PREMIUM_CHESTS,
  GEM_PACKS,
  COIN_PACKS,
} from '../data/shop';
import { SpecialOfferCard } from '../components/SpecialOfferCard';
import { RoyalRewardCard } from '../components/RoyalRewardCard';
import { ChestCard } from '../components/ChestCard';
import { PackCard } from '../components/PackCard';

const JUMP = [
  { id: 'chests', label: 'Chests' },
  { id: 'gems', label: 'Gems' },
  { id: 'coins', label: 'Coins' },
];

export const ShopPage = (): JSX.Element => {
  const { data: walletData } = useWalletBalance();
  const buyChest = useBuyChest();

  const jump = (id: string): void => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openChest = (chestId: string): void => {
    buyChest.mutate(chestId, {
      onSuccess: (r) =>
        window.alert(`🎉 You opened ${chestId} and won ${formatCoins(r.reward)} coins!`),
      onError: (e) => window.alert(getApiErrorMessage(e, 'Not enough gems')),
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-extrabold text-gold text-shadow-deep">Shop</h1>
        <div className="flex items-center gap-2">
          <GemBadge amount={walletData?.wallet.gems ?? '0'} size="lg" />
          <CoinBadge amount={walletData?.wallet.balance ?? '0'} size="lg" />
        </div>
      </header>

      {/* Quick jump */}
      <div className="mb-6 flex flex-wrap gap-2">
        {JUMP.map((j) => (
          <ActionPill key={j.id} tone="blue" size="sm" onClick={() => jump(j.id)}>
            {j.label}
          </ActionPill>
        ))}
      </div>

      {/* Special Offers */}
      <SectionRibbon title="Special Offers" tone="orange" />
      <div className="mb-8 mt-4 grid gap-4 lg:grid-cols-2">
        {SPECIAL_OFFERS.map((o) => (
          <SpecialOfferCard key={o.id} offer={o} />
        ))}
      </div>

      {/* Royal Rewards */}
      <SectionRibbon title="Royal Rewards" tone="purple" />
      <div className="mb-4 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/15 bg-maroon-dark/30 px-4 py-3">
        <p className="flex items-center gap-2 text-sm text-felt/80">
          <Clock size={18} className="text-gold-light" />
          Rewards refresh in{' '}
          <Countdown seconds={ROYAL_REFRESH_IN} compact className="font-bold text-felt" />
        </p>
        <ActionPill tone="green" icon={<Play size={15} fill="currentColor" />}>
          Refresh Now
        </ActionPill>
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROYAL_REWARDS.map((r) => (
          <RoyalRewardCard key={r.id} reward={r} />
        ))}
      </div>

      {/* Premium Chests */}
      <div id="chests" className="scroll-mt-4">
        <SectionRibbon title="Premium Chests" tone="orange" />
        <div className="mb-8 mt-4 grid gap-4 sm:grid-cols-3">
          {PREMIUM_CHESTS.map((c) => (
            <ChestCard key={c.id} chest={c} onBuy={(chest) => openChest(chest.id)} />
          ))}
        </div>
      </div>

      {/* Gems */}
      <div id="gems" className="scroll-mt-4">
        <SectionRibbon title="Gems" tone="orange" />
        <div className="mb-8 mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {GEM_PACKS.map((p) => (
            <PackCard key={p.id} pack={p} kind="gems" />
          ))}
        </div>
      </div>

      {/* Coins */}
      <div id="coins" className="scroll-mt-4">
        <SectionRibbon title="Coins" tone="orange" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {COIN_PACKS.map((p) => (
            <PackCard key={p.id} pack={p} kind="coins" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
