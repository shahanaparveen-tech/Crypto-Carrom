import { useSyncExternalStore } from 'react';

import { tokenStorage } from '@shared/services/tokenStorage';

/**
 * Foundation-level auth hook used by route guards. It reflects access-token
 * presence and reacts to cross-tab `storage` events. The full auth feature
 * (login/register/me) replaces/extends this with Redux + React Query later.
 */
const subscribe = (callback: () => void): (() => void) => {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

export const useAuth = (): { isAuthenticated: boolean } => {
  const isAuthenticated = useSyncExternalStore(
    subscribe,
    () => tokenStorage.isAuthenticated(),
    () => false,
  );
  return { isAuthenticated };
};
