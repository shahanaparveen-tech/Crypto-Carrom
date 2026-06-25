import { useNavigate } from 'react-router-dom';
import { Coins, Crosshair, BarChart3 } from 'lucide-react';

import { ROUTES } from '@app/config/routes.constants';
import { Countdown } from '@shared/components';
import { LEADERBOARD_ENDS_IN } from '../data/homeContent';

const Badge = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-maroon-dark">
    {children}
  </span>
);

const Chip = ({
  icon,
  title,
  sub,
  badge,
  onClick,
}: {
  icon: JSX.Element;
  title: string;
  sub: JSX.Element | string;
  badge?: React.ReactNode;
  onClick: () => void;
}): JSX.Element => (
  <button
    onClick={onClick}
    className="relative flex flex-1 items-center justify-center gap-3 rounded-2xl border border-gold/30 bg-gradient-to-b from-wood-light/90 to-wood-dark/90 px-4 py-3 text-left shadow ring-1 ring-black/30 transition hover:brightness-105 active:scale-[0.98]"
  >
    {badge !== undefined && <Badge>{badge}</Badge>}
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/25 text-gold-light">
      {icon}
    </span>
    <span className="min-w-0">
      <span className="block text-sm font-bold leading-tight text-felt">{title}</span>
      <span className="block text-xs leading-tight text-gold-light/90">{sub}</span>
    </span>
  </button>
);

export const PromoStrip = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className="grid items-stretch gap-3 sm:grid-cols-3">
      <Chip
        icon={<Coins size={18} />}
        title="Free Rewards"
        sub="Collect Now!"
        badge={5}
        onClick={() => navigate(ROUTES.WALLET)}
      />
      <Chip
        icon={<Crosshair size={18} />}
        title="Lucky Shot"
        sub="Free Shot Ready"
        badge="!"
        onClick={() => navigate(ROUTES.PRACTICE)}
      />
      <Chip
        icon={<BarChart3 size={18} />}
        title="Leaderboards"
        sub={
          <>
            Ends in: <Countdown seconds={LEADERBOARD_ENDS_IN} compact />
          </>
        }
        onClick={() => navigate(ROUTES.LEADERBOARD)}
      />
    </div>
  );
};
