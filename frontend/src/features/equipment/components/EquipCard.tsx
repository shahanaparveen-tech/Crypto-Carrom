import { Lock, Zap } from 'lucide-react';

import { cn } from '@shared/utils/cn';
import { RARITY, type EquipItem } from '../data/equipment';
import { EquipArt } from './EquipArt';
import { AttrBars } from './AttrBars';

interface EquipCardProps {
  item: EquipItem;
  equipped: boolean;
  onEquip: (item: EquipItem) => void;
}

const ProgressBar = ({ current, max }: { current: number; max: number }): JSX.Element => (
  <div className="flex items-center gap-2">
    <div className="h-3 flex-1 overflow-hidden rounded-full bg-black/40">
      <div
        className="h-full rounded-full bg-gold-gradient"
        style={{ width: `${(current / max) * 100}%` }}
      />
    </div>
    <span className="text-[10px] font-semibold tabular-nums text-felt/70">
      {current}/{max}
    </span>
  </div>
);

export const EquipCard = ({ item, equipped, onEquip }: EquipCardProps): JSX.Element => {
  const r = RARITY[item.rarity ?? 'STANDARD'];
  const locked = !item.owned;

  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => onEquip(item)}
      className={cn(
        'relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border-2 bg-gradient-to-b p-3 text-center shadow-panel transition',
        r.card,
        equipped ? 'border-lime-400 ring-2 ring-lime-400/60' : r.ring,
        locked ? 'cursor-default' : 'hover:brightness-110 active:scale-[0.98]',
      )}
    >
      {equipped && (
        <span className="absolute right-0 top-0 rounded-bl-lg bg-lime-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow">
          Using
        </span>
      )}

      {/* Title */}
      <div className="pt-1">
        <p
          className={cn(
            'font-display text-lg font-bold leading-none',
            locked ? 'text-felt/70' : 'text-felt',
          )}
        >
          {item.name}
        </p>
        {item.rarity && (
          <p className={cn('mt-0.5 text-[10px] font-bold uppercase tracking-widest', r.text)}>
            {item.rarity}
          </p>
        )}
      </div>

      {/* Art */}
      <div className="py-1">
        <EquipArt
          kind={item.art}
          color={item.color}
          accent={item.accent}
          size={78}
          dimmed={locked}
        />
      </div>

      {/* Footer */}
      <div className="w-full">
        {item.attrs && (
          <AttrBars force={item.attrs.force} aim={item.attrs.aim} time={item.attrs.time} />
        )}

        {item.footer && (
          <div className="space-y-1">
            <p className="flex items-center justify-center gap-1 font-display text-sm font-bold text-felt/85">
              {item.footer.lock && <Lock size={13} className="text-felt/60" />}
              {item.footer.ad && (
                <span className="rounded bg-gold/80 px-1 text-[8px] font-black text-maroon-dark">
                  AD
                </span>
              )}
              {item.footer.title}
            </p>
            {item.footer.sub && <p className="text-[10px] text-felt/50">{item.footer.sub}</p>}
            {item.footer.bolt && item.progress && (
              <div className="flex items-center gap-1.5">
                <Zap size={13} className="shrink-0 text-gold-light" fill="currentColor" />
                <ProgressBar current={item.progress.current} max={item.progress.max} />
              </div>
            )}
          </div>
        )}

        {/* Standalone progress (chests) */}
        {item.progress && !item.footer?.bolt && (
          <div className={cn(item.footer || item.attrs ? 'mt-2' : '')}>
            <ProgressBar current={item.progress.current} max={item.progress.max} />
          </div>
        )}
      </div>
    </button>
  );
};
