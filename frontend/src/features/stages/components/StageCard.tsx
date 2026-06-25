import { Landmark, Coins, Film, Info } from 'lucide-react';

import { cn } from '@shared/utils/cn';
import { formatCoins } from '@shared/utils/format';
import type { Stage } from '../data/stages';

const HexTicket = ({ size = 38 }: { size?: number }): JSX.Element => (
  <span
    className="flex items-center justify-center bg-gradient-to-b from-gold-light to-gold-dark text-maroon-dark shadow"
    style={{
      width: size,
      height: size,
      clipPath: 'polygon(25% 5%,75% 5%,100% 50%,75% 95%,25% 95%,0 50%)',
    }}
  >
    <Film size={size * 0.42} />
  </span>
);

const PackIcons = (): JSX.Element => (
  <span className="flex gap-1">
    {['#22c55e', '#3b82f6', '#ef4444', '#a855f7'].map((c) => (
      <span key={c} className="h-6 w-4 rounded-sm shadow" style={{ background: c }} />
    ))}
  </span>
);

const Panel = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): JSX.Element => (
  <div className={cn('rounded-xl bg-black/20 px-3 py-2.5 ring-1 ring-black/15', className)}>
    {children}
  </div>
);

export const StageCard = ({ stage }: { stage: Stage }): JSX.Element => {
  const t = stage.theme;
  return (
    <div
      className={cn(
        'relative flex flex-col gap-3 rounded-3xl border-2 bg-gradient-to-b p-4 text-white shadow-panel',
        t.card,
        t.ring,
      )}
    >
      {/* Corner tags */}
      <span className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-md bg-gradient-to-b from-gold-light to-gold-dark px-2 py-0.5 text-xs font-extrabold text-maroon-dark shadow ring-1 ring-black/20">
        +{stage.cp} CP
        <span className="rounded bg-red-600 px-1 text-[10px] text-white">x2</span>
      </span>
      {stage.mode2v2 && (
        <span className="absolute right-3 top-3 z-10 rounded-lg bg-gradient-to-b from-gold-light to-gold-dark px-2.5 py-1 font-display text-sm font-extrabold text-maroon-dark shadow ring-1 ring-black/20">
          2v2
        </span>
      )}

      {/* Landmark + name */}
      <div className="relative flex flex-col items-center pb-1 pt-4">
        <span
          className="pointer-events-none absolute top-0 h-24 w-24 rounded-full blur-2xl"
          style={{ background: t.glow, opacity: 0.7 }}
        />
        <Landmark size={46} className="relative drop-shadow" />
        <div className="relative mt-1 rounded-xl bg-black/25 px-5 py-1.5 text-center shadow ring-1 ring-white/10">
          <span className="block font-display text-3xl font-extrabold uppercase leading-none drop-shadow">
            {stage.title}
          </span>
          <span className="block font-display text-lg font-bold italic leading-none text-gold-light">
            {stage.subtitle}
          </span>
        </div>
      </div>

      {/* Rewards ribbon */}
      <div
        className={cn(
          'rounded-lg bg-gradient-to-b py-1.5 text-center font-display text-sm font-bold uppercase tracking-wide shadow',
          t.panel,
        )}
      >
        Rewards
      </div>

      {/* Reward amounts */}
      <Panel className="flex items-center justify-center gap-10">
        <span className="flex flex-col items-center gap-1">
          <Coins size={26} className="text-gold-light" />
          <span className="font-display text-base font-bold">{formatCoins(stage.coins)}</span>
        </span>
        <span className="flex flex-col items-center gap-1">
          <HexTicket />
          <span className="font-display text-base font-bold">+{stage.ticket}</span>
        </span>
      </Panel>

      {/* Pack chance */}
      {stage.packChance && (
        <Panel className="flex items-center justify-between gap-2">
          <div className="leading-tight">
            <span className="block text-sm font-bold text-gold-light">50% Chance</span>
            <span className="block text-xs text-white/85">To receive a pack!</span>
          </div>
          <PackIcons />
          <button
            aria-label="Pack info"
            className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-b from-sky-400 to-blue-600 text-white shadow"
          >
            <Info size={14} />
          </button>
        </Panel>
      )}

      {/* Progress */}
      <Panel className="flex items-center justify-between gap-2">
        <span className="text-sm text-white/90">
          Play to progress in <span className="font-semibold">{stage.progressIn}</span>
        </span>
        <HexTicket size={28} />
      </Panel>

      {/* Entry fee */}
      <Panel className="flex items-center justify-center gap-2 font-display text-lg font-bold">
        Entry fee: {formatCoins(stage.entryFee)}
        <Coins size={20} className="text-gold-light" />
      </Panel>

      {/* Rules */}
      <Panel className="flex items-center justify-center gap-2">
        <span className="text-sm">
          Rules:{' '}
          <span className="font-semibold text-gold-light">{stage.pieces} pieces Disc Pool</span>
        </span>
        <button
          aria-label="Rules info"
          className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-b from-sky-400 to-blue-600 text-white shadow"
        >
          <Info size={14} />
        </button>
      </Panel>
    </div>
  );
};
