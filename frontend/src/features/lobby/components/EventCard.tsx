import { cn } from '@shared/utils/cn';
import { Countdown } from '@shared/components';
import { type RailItem, TONE_TILE } from '../data/homeContent';

interface EventCardProps {
  item: RailItem;
  onClick?: (item: RailItem) => void;
}

/** Labeled event / mini-game tile for the desktop events grid. */
export const EventCard = ({ item, onClick }: EventCardProps): JSX.Element => {
  const Icon = item.icon;

  return (
    <button
      onClick={() => onClick?.(item)}
      className="group relative flex flex-col items-center gap-2 rounded-2xl border border-gold/15 bg-maroon-light/30 p-3 text-center shadow-panel backdrop-blur transition hover:border-gold/40 active:scale-[0.98]"
    >
      {item.tag && (
        <span className="absolute left-2 top-2 rounded-md bg-black/70 px-1.5 text-[9px] font-bold uppercase text-gold-light">
          {item.tag}
        </span>
      )}
      {item.badge !== undefined && (
        <span className="absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-maroon-dark">
          {item.badge}
        </span>
      )}
      {item.alert && item.badge === undefined && (
        <span className="absolute right-2 top-2 h-3 w-3 rounded-full bg-red-600 ring-2 ring-maroon-dark" />
      )}

      <span
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b shadow-lg ring-1 ring-black/30 transition group-hover:scale-105',
          TONE_TILE[item.tone],
        )}
      >
        <Icon size={26} />
      </span>

      <span className="text-xs font-semibold leading-tight text-felt">{item.label}</span>

      {item.timer !== undefined && (
        <span className="rounded-md bg-black/45 px-2 py-0.5 text-[10px] font-semibold text-felt/80">
          <Countdown seconds={item.timer} compact />
        </span>
      )}
    </button>
  );
};
