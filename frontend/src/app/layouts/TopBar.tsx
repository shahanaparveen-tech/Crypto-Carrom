import { NavLink, useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

import { Avatar, CoinBadge, Logo, Button } from '@shared/components';
import { cn } from '@shared/utils/cn';
import { ROUTES } from '@app/config/routes.constants';
import { useAuthState, useLogout } from '@features/auth/hooks';
import { useWalletBalance } from '@features/wallet/hooks/useWallet';

export const TopBar = (): JSX.Element => {
  const { user } = useAuthState();
  const { data } = useWalletBalance();
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = async (): Promise<void> => {
    await logout.mutateAsync();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-gold/15 bg-maroon-dark/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <NavLink to={ROUTES.LOBBY} className="flex items-center gap-2">
          <Logo size={36} withText={false} />
          <span className="hidden font-display text-lg font-bold text-gold sm:inline">
            Crypto Carrom
          </span>
        </NavLink>

        <div className="flex items-center gap-3">
          <CoinBadge amount={data?.wallet.balance ?? '0'} size="sm" />
          <NavLink to={ROUTES.PROFILE} aria-label="Profile">
            <Avatar name={user?.username ?? '?'} size={36} />
          </NavLink>
          <NavLink
            to={ROUTES.SETTINGS}
            aria-label="Settings"
            className={({ isActive }) =>
              cn(
                'flex h-9 w-9 items-center justify-center rounded-xl border border-gold/20 bg-wood text-felt transition hover:bg-wood-light',
                isActive && 'bg-gold/20 text-gold-light',
              )
            }
          >
            <Settings size={18} />
          </NavLink>
          <Button variant="ghost" size="sm" onClick={handleLogout} isLoading={logout.isPending}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};
