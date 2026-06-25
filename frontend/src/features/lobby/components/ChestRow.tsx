import { useState } from 'react';
import { Package2, Lock } from 'lucide-react';

import { cn } from '@shared/utils/cn';
import { Countdown } from '@shared/components';
import { CHESTS } from '../data/homeContent';

const Chest = ({ seconds }: { seconds: number }): JSX.Element => {
  const [ready, setReady] = useState(false);
  // Bump key to restart the countdown after a claim.
  const [cycle, setCycle] = useState(0);

  const claim = (): void => {
    if (!ready) return;
    setReady(false);
    setCycle((c) => c + 1);
  };

  return (
    <div className="flex flex-1 flex-col items-center gap-1">
      {/* Status bubble */}
      <span
        className={cn(
          'rounded-md px-1.5 py-0.5 text-[9px] font-bold leading-tight shadow',
          ready ? 'animate-pulse bg-sky-500 text-white' : 'bg-black/45 text-felt/80',
        )}
      >
        {ready ? (
          'Tap to Unlock'
        ) : (
          <Countdown key={cycle} seconds={seconds} compact onComplete={() => setReady(true)} />
        )}
      </span>

      {/* Chest */}
      <button
        onClick={claim}
        disabled={!ready}
        aria-label={ready ? 'Unlock chest' : 'Chest locked'}
        className={cn(
          'relative flex aspect-square w-full items-center justify-center rounded-2xl border border-gold/15 bg-gradient-to-b from-wood-light to-wood-dark shadow-lg ring-1 ring-black/40 transition',
          ready
            ? 'cursor-pointer ring-2 ring-sky-400 hover:brightness-110 active:scale-95'
            : 'opacity-90',
        )}
      >
        <Package2 size={44} className="text-gold-light drop-shadow" />
        {!ready && (
          <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/60 p-1 text-felt/70">
            <Lock size={12} />
          </span>
        )}
      </button>
    </div>
  );
};

/** Row of timed "tap to unlock" reward chests. */
export const ChestRow = (): JSX.Element => (
  <div className="grid grid-cols-4 items-end gap-3 sm:gap-4">
    {CHESTS.map((seconds, i) => (
      <Chest key={i} seconds={seconds} />
    ))}
  </div>
);
