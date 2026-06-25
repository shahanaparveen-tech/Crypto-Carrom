import { configureStore } from '@reduxjs/toolkit';

import { rootReducer } from './rootReducer';
import { appEnv } from '../config/env';

export const store = configureStore({
  reducer: rootReducer,
  devTools: appEnv.isDev,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Socket/PixiJS instances may flow through actions during gameplay.
        ignoredActions: ['game/frameTick'],
      },
    }),
});

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
export type { RootState } from './rootReducer';
