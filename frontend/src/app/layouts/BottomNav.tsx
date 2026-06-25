import { NavLink } from 'react-router-dom';
import { Home, Users, Disc3, Trophy, ShoppingCart, type LucideIcon } from 'lucide-react';

import { cn } from '@shared/utils/cn';
import { ROUTES } from '@app/config/routes.constants';

interface Tab {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

const TABS: Tab[] = [
  { to: ROUTES.LOBBY, label: 'Home', icon: Home },
  { to: ROUTES.FRIENDS, label: 'Friends', icon: Users },
  { to: ROUTES.EQUIPMENT, label: 'Equipment', icon: Disc3 },
  { to: ROUTES.EVENTS, label: 'Events', icon: Trophy, badge: 7 },
  { to: ROUTES.SHOP, label: 'Shop', icon: ShoppingCart },
];

/** App-wide bottom tab bar (Carrom-Pool style). */
export const BottomNav = (): JSX.Element => (
  <nav className="sticky bottom-0 z-20 border-t border-gold/25 bg-gradient-to-b from-wood/95 to-wood-dark/95 backdrop-blur shadow-[0_-6px_18px_rgba(0,0,0,0.35)]">
    <div className="mx-auto flex max-w-2xl items-stretch gap-1 px-2 py-1.5">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end
            className={({ isActive }) =>
              cn(
                'relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 transition',
                isActive
                  ? 'bg-gold-gradient text-maroon-dark shadow'
                  : 'text-felt/70 hover:bg-white/5 hover:text-felt',
              )
            }
          >
            {tab.badge !== undefined && (
              <span className="absolute right-3 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white ring-2 ring-wood-dark">
                {tab.badge}
              </span>
            )}
            <Icon size={22} />
            <span className="text-[11px] font-semibold">{tab.label}</span>
          </NavLink>
        );
      })}
    </div>
  </nav>
);
