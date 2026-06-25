import { useAppSelector } from '@app/store/hooks';
import type { AuthStatus } from '../store';
import type { PublicUser } from '@shared/types/domain.types';

export const useAuthState = (): {
  user: PublicUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
} => {
  const { user, status } = useAppSelector((s) => s.auth);
  return {
    user,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
  };
};
