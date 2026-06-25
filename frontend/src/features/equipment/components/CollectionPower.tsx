import { Zap } from 'lucide-react';

import { COLLECTION_POWER } from '../data/equipment';

/** "Collection Power" progress banner. */
export const CollectionPower = (): JSX.Element => {
  const { current, max, level } = COLLECTION_POWER;
  const pct = Math.round((current / max) * 100);

  return (
    <div className="flex items-center gap-4 rounded-2xl border-2 border-gold/45 bg-maroon-dark/40 p-4 shadow-panel">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-gold-light to-gold-dark text-maroon-dark shadow-lg ring-1 ring-black/25">
        <Zap size={24} fill="currentColor" />
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="font-display text-lg font-bold text-gold-light">Collection Power</h3>
        <p className="text-xs text-felt/60">Upgrade to unlock powers!</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-black/40 ring-1 ring-black/30">
            <div className="h-full rounded-full bg-gold-gradient" style={{ width: `${pct}%` }} />
          </div>
          <span className="font-display text-sm font-bold tabular-nums text-felt/80">
            {current}/{max}
          </span>
        </div>
      </div>

      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-cyan-300/70 bg-cyan-600/30 font-display text-lg font-extrabold text-cyan-100 shadow">
        {level}
      </span>
    </div>
  );
};
