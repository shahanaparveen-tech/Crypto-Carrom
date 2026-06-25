import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { RootLayout, AuthLayout } from '@app/layouts';
import { ROUTES } from '@app/config/routes.constants';
import { PlaceholderPage, FullPageSpinner } from '@shared/components';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';

// Code-split the game (PixiJS) so it only loads when a player enters a board.
const GamePage = lazy(() => import('@features/game/pages/GamePage'));
const MultiplayerMatchPage = lazy(() => import('@features/game/pages/MultiplayerMatchPage'));
const withSuspense = (node: JSX.Element): JSX.Element => (
  <Suspense fallback={<FullPageSpinner />}>{node}</Suspense>
);

import LoginPage from '@features/auth/pages/LoginPage';
import RegisterPage from '@features/auth/pages/RegisterPage';
import ForgotPasswordPage from '@features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@features/auth/pages/ResetPasswordPage';
import VerifyEmailPage from '@features/auth/pages/VerifyEmailPage';
import LobbyPage from '@features/lobby/pages/LobbyPage';
import FriendsPage from '@features/friends/pages/FriendsPage';
import EquipmentPage from '@features/equipment/pages/EquipmentPage';
import ShopPage from '@features/shop/pages/ShopPage';
import StagesPage from '@features/stages/pages/StagesPage';
import MatchmakingPage from '@features/matchmaking/pages/MatchmakingPage';
import ProfilePage from '@features/profile/pages/ProfilePage';
import WalletPage from '@features/wallet/pages/WalletPage';
import SettingsPage from '@features/settings/pages/SettingsPage';
import LeaderboardPage from '@features/leaderboard/pages/LeaderboardPage';
import NotificationsPage from '@features/notifications/pages/NotificationsPage';

/** Application route table. Implemented features use real pages; the rest are placeholders. */
export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.LOGIN, element: <LoginPage /> },
          { path: ROUTES.REGISTER, element: <RegisterPage /> },
          { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
          { path: ROUTES.RESET_PASSWORD, element: <ResetPasswordPage /> },
          { path: ROUTES.VERIFY_EMAIL, element: <VerifyEmailPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RootLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.LOBBY} replace /> },
          { path: ROUTES.LOBBY, element: <LobbyPage /> },
          { path: ROUTES.STAGES, element: <StagesPage /> },
          { path: ROUTES.PROFILE, element: <ProfilePage /> },
          { path: ROUTES.WALLET, element: <WalletPage /> },
          { path: ROUTES.SETTINGS, element: <SettingsPage /> },
          { path: ROUTES.PRACTICE, element: withSuspense(<GamePage />) },
          { path: ROUTES.GAME, element: withSuspense(<GamePage />) },
          { path: ROUTES.MATCH, element: withSuspense(<MultiplayerMatchPage />) },
          { path: ROUTES.MATCHMAKING, element: <MatchmakingPage /> },
          { path: ROUTES.LEADERBOARD, element: <LeaderboardPage /> },
          { path: ROUTES.NOTIFICATIONS, element: <NotificationsPage /> },
          { path: ROUTES.FRIENDS, element: <FriendsPage /> },
          { path: ROUTES.EQUIPMENT, element: <EquipmentPage /> },
          {
            path: ROUTES.EVENTS,
            element: (
              <PlaceholderPage
                title="Events"
                description="Seasonal events, tournaments and rewards — coming soon."
              />
            ),
          },
          { path: ROUTES.SHOP, element: <ShopPage /> },
          {
            path: ROUTES.CRYPTO,
            element: (
              <PlaceholderPage title="Crypto" description="Web3 features arrive in Phase 5." />
            ),
          },
          { path: ROUTES.ADMIN, element: <PlaceholderPage title="Admin" /> },
        ],
      },
    ],
  },
  {
    path: ROUTES.NOT_FOUND,
    element: <PlaceholderPage title="404" description="Page not found." />,
  },
]);
