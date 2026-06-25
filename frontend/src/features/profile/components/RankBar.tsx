import { ChevronRight, Trophy } from 'lucide-react';

import { getRank } from '../utils/cosmetics';

/** "Rank explore" — current tier badge + progress bar toward the next tier. */
export const RankBar = ({ rating }: { rating: number }): JSX.Element => {
  const { tier, next, progress, toNext } = getRank(rating);

  return (
    <div className="rounded-2xl border border-gold/15 bg-maroon-dark/40 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={18} style={{ color: tier.color }} />
          <span className="font-display font-bold" style={{ color: tier.color }}>
            {tier.name}
          </span>
          <span className="text-xs text-felt/45">· {rating} pts</span>
        </div>
        {next ? (
          <span className="flex items-center gap-1 text-xs text-felt/50">
            {next.name} <ChevronRight size={14} />
          </span>
        ) : (
          <span className="text-xs text-gold-light">Max tier</span>
        )}
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-maroon-dark">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${tier.color}, #ffd470)`,
          }}
        />
      </div>

      {next && (
        <p className="mt-1.5 text-right text-[11px] text-felt/40">
          {toNext} pts to {next.name}
        </p>
      )}
    </div>
  );
};
