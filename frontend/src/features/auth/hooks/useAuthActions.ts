import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAppDispatch } from '@app/store/hooks';
import { tokenStorage } from '@shared/services';
import { authApi } from '../services/auth.api';
import { setUser, clearUser, setUnauthenticated } from '../store';
import type { RegisterValues } from '../validations/auth.schema';

/** Hydrates auth state on app load: calls /me if an access token exists. */
export const useBootstrapAuth = (): void => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let active = true;
    if (!tokenStorage.isAuthenticated()) {
      dispatch(setUnauthenticated());
      return;
    }
    authApi
      .me()
      .then(({ user }) => active && dispatch(setUser(user)))
      .catch(() => {
        tokenStorage.clear();
        if (active) dispatch(setUnauthenticated());
      });
    return () => {
      active = false;
    };
  }, [dispatch]);
};

export const useGuestLogin = () => {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: authApi.guest,
    onSuccess: ({ user, accessToken }) => {
      tokenStorage.set(accessToken);
      dispatch(setUser(user));
    },
  });
};

export const useLogin = () => {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ user, accessToken }) => {
      tokenStorage.set(accessToken);
      dispatch(setUser(user));
    },
  });
};

export const useRegister = () => {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: (values: RegisterValues) =>
      authApi.register({
        email: values.email,
        username: values.username,
        password: values.password,
      }),
    onSuccess: ({ user, accessToken }) => {
      tokenStorage.set(accessToken);
      dispatch(setUser(user));
    },
  });
};

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      tokenStorage.clear();
      dispatch(clearUser());
      queryClient.clear();
    },
  });
};

export const useForgotPassword = () => useMutation({ mutationFn: authApi.forgotPassword });

export const useResetPassword = () =>
  useMutation({ mutationFn: (b: { token: string; password: string }) => authApi.resetPassword(b) });

export const useVerifyEmail = () => useMutation({ mutationFn: authApi.verifyEmail });
