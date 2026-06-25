import { RouterProvider } from 'react-router-dom';

import { AppProviders } from '@app/providers';
import { router } from '@app/router';
import { useBootstrapAuth } from '@features/auth/hooks';

/** Runs one-time auth hydration (/me) on load. Renders nothing itself. */
const AuthBootstrap = (): null => {
  useBootstrapAuth();
  return null;
};

/** App root: wires global providers around the router. */
export const App = (): JSX.Element => {
  return (
    <AppProviders>
      <AuthBootstrap />
      <RouterProvider router={router} />
    </AppProviders>
  );
};
