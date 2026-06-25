import { cn } from '@shared/utils/cn';

export type RibbonTone = 'gold' | 'orange' | 'purple';

const TONE: Record<RibbonTone, string> = {
  gold: 'from-gold-light via-gold to-gold-dark text-maroon-dark',
  orange: 'from-amber-400 via-orange-500 to-orange-700 text-white',
  purple: 'from-fuchsia-500 via-purple-600 to-purple-800 text-white',
};

/** Carrom-Pool style ribbon section header. */
export const SectionRibbon = ({
  title,
  tone = 'gold',
}: {
  title: string;
  tone?: RibbonTone;
}): JSX.Element => (
  <div className="relative flex items-center justify-center py-1">
    <span className="absolute left-0 hidden h-3 w-10 -skew-y-6 rounded-sm bg-black/30 sm:block" />
    <span className="absolute right-0 hidden h-3 w-10 skew-y-6 rounded-sm bg-black/30 sm:block" />
    <div
      className={cn(
        'relative w-full max-w-md rounded-xl bg-gradient-to-b py-2 text-center font-display text-base font-extrabold uppercase tracking-wider shadow-panel ring-1 ring-black/20',
        TONE[tone],
      )}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-xl bg-white/25" />
      <span className="relative">{title}</span>
    </div>
  </div>
);
