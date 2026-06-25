import { useMemo, useState } from 'react';
import { Info } from 'lucide-react';

import { Card, CoinBadge, GemBadge } from '@shared/components';
import { cn } from '@shared/utils/cn';
import { useWalletBalance } from '@features/wallet/hooks/useWallet';
import { CATEGORIES, ITEMS, STRIKERS, type Category, type EquipItem } from '../data/equipment';
import { useInventory, useEquipItem, itemKey, CATEGORY_ENUM } from '../hooks/useInventory';
import { CollectionPower } from '../components/CollectionPower';
import { EquipCard } from '../components/EquipCard';
import { EquipArt } from '../components/EquipArt';
import { AttrBars } from '../components/AttrBars';

export const EquipmentPage = (): JSX.Element => {
  const { data: walletData } = useWalletBalance();
  const { data: inv } = useInventory();
  const equipMutation = useEquipItem();
  const [category, setCategory] = useState<Category>('strikers');

  const ownedKeys = useMemo(
    () => new Set((inv?.items ?? []).filter((i) => i.owned).map((i) => i.key)),
    [inv],
  );
  const equippedByCat = inv?.equipped ?? {};
  const isOwned = (cat: Category, id: string): boolean => ownedKeys.has(itemKey(cat, id));
  const isEquipped = (cat: Category, id: string): boolean =>
    equippedByCat[CATEGORY_ENUM[cat] ?? ''] === itemKey(cat, id);

  const equip = (item: EquipItem): void => {
    if (isOwned(category, item.id)) equipMutation.mutate(itemKey(category, item.id));
  };

  const equippedStriker = useMemo(() => {
    const id = (equippedByCat.STRIKER ?? 'striker:blaze').split(':')[1];
    return STRIKERS.find((s) => s.id === id) ?? STRIKERS[0]!;
  }, [equippedByCat.STRIKER]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-gold text-shadow-deep">
            Equipment
          </h1>
          <p className="mt-1 text-sm text-felt/60">
            Collect and upgrade strikers, pucks, trails and more.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GemBadge amount={walletData?.wallet.gems ?? '0'} size="lg" />
          <CoinBadge amount={walletData?.wallet.balance ?? '0'} size="lg" />
        </div>
      </header>

      <div className="mb-5">
        <CollectionPower />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="inline-flex flex-wrap gap-1 rounded-2xl border border-gold/15 bg-maroon-dark/40 p-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                'rounded-xl px-5 py-2 font-display text-sm font-bold transition',
                category === c.id
                  ? 'bg-gold-gradient text-maroon-dark shadow'
                  : 'text-felt/60 hover:text-felt',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <button
          aria-label="Equipment info"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-sky-400 to-blue-700 text-white shadow ring-1 ring-black/25 transition hover:brightness-105 active:scale-95"
        >
          <Info size={18} />
        </button>
      </div>

      {/* Featured panel (per category) */}
      {category === 'powers' && (
        <Card className="mb-5 grid items-center gap-4 sm:grid-cols-2">
          <div className="flex flex-col items-center gap-2">
            <p className="font-display text-lg font-bold text-felt">{equippedStriker.name}</p>
            <EquipArt kind="power" color="#f59e0b" accent="#f59e0b" size={96} />
          </div>
          <div>
            <p className="mb-3 text-sm text-felt/75">
              Collect new equipment and upgrade it to unlock powers that improve your striker.
            </p>
            <AttrBars
              force={equippedStriker.attrs?.force ?? 20}
              aim={equippedStriker.attrs?.aim ?? 20}
              time={equippedStriker.attrs?.time ?? 20}
            />
          </div>
        </Card>
      )}

      {category === 'trails' && (
        <Card className="mb-5 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-felt">No Trail</span>
          <EquipArt
            kind="disc"
            color={equippedStriker.color}
            accent={equippedStriker.accent}
            size={64}
          />
        </Card>
      )}

      {category === 'pockets' && (
        <Card className="mb-5 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-felt">No Pocket Effect</span>
          <EquipArt kind="pocket" color="#2a0a09" accent="#5b3a1a" size={64} />
        </Card>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {ITEMS[category].map((item) => (
          <EquipCard
            key={item.id}
            item={{ ...item, owned: isOwned(category, item.id) }}
            equipped={isEquipped(category, item.id)}
            onEquip={equip}
          />
        ))}
      </div>
    </div>
  );
};

export default EquipmentPage;
