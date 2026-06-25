import { Outlet, useLocation } from 'react-router-dom';

import { ROUTES } from '@app/config/routes.constants';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';

/** Routes that render their own header and hide the global top bar. */
const FULLSCREEN_ROUTES: string[] = [ROUTES.FRIENDS, ROUTES.EQUIPMENT, ROUTES.EVENTS, ROUTES.SHOP];

/** Immersive routes that hide both the top bar and the bottom tab bar. */
const IMMERSIVE_ROUTES: string[] = [ROUTES.MATCHMAKING, ROUTES.PRACTICE];

/** Primary authenticated app shell: top bar, content, and bottom tab bar. */
export const RootLayout = (): JSX.Element => {
  const { pathname } = useLocation();
  const immersive =
    IMMERSIVE_ROUTES.includes(pathname) ||
    pathname.startsWith('/game/') ||
    pathname.startsWith('/match/');
  const hideTopBar = immersive || FULLSCREEN_ROUTES.includes(pathname);

  return (
    <div className="flex min-h-screen flex-col bg-maroon-radial text-felt">
      {!hideTopBar && <TopBar />}
      <main className={hideTopBar ? 'flex-1' : 'mx-auto w-full max-w-6xl flex-1 px-4 py-6'}>
        <Outlet />
      </main>
      {!immersive && <BottomNav />}
    </div>
  );
};
