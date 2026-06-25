import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthState } from '@features/auth/hooks';
import { FullPageSpinner } from '@shared/components';
import { ROUTES } from '@app/config/routes.constants';

/** Guards authenticated routes; waits for bootstrap, then redirects if needed. */
export const ProtectedRoute = (): JSX.Element => {
  const { isAuthenticated, isLoading } = useAuthState();
  const location = useLocation();

  if (isLoading) return <FullPageSpinner />;
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }
  return <Outlet />;
};

/** Inverse guard: keeps already-authenticated users out of auth pages. */
export const PublicOnlyRoute = (): JSX.Element => {
  const { isAuthenticated, isLoading } = useAuthState();
  if (isLoading) return <FullPageSpinner />;
  if (isAuthenticated) return <Navigate to={ROUTES.LOBBY} replace />;
  return <Outlet />;
};
