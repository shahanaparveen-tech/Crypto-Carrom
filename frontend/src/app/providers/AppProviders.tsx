import { type ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';

import { store } from '@app/store';
import { queryClient } from '@shared/services/queryClient';

/**
 * Composition root for all app-wide providers. The Router is rendered by the
 * App component (via RouterProvider) so it sits inside these providers.
 */
export const AppProviders = ({ children }: { children: ReactNode }): JSX.Element => {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ReduxProvider>
  );
};
