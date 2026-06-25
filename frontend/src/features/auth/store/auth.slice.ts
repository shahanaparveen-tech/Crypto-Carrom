import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { PublicUser } from '@shared/types/domain.types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: PublicUser | null;
  status: AuthStatus;
}

const initialState: AuthState = {
  user: null,
  status: 'loading',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<PublicUser>) => {
      state.user = action.payload;
      state.status = 'authenticated';
    },
    clearUser: (state) => {
      state.user = null;
      state.status = 'unauthenticated';
    },
    setUnauthenticated: (state) => {
      state.status = 'unauthenticated';
    },
  },
});

export const { setUser, clearUser, setUnauthenticated } = authSlice.actions;
export const authReducer = authSlice.reducer;
