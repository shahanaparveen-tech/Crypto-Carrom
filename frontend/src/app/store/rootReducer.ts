import { combineReducers } from '@reduxjs/toolkit';

import { uiReducer } from './ui.slice';
import { authReducer } from '@features/auth/store';

/**
 * Root reducer. Each feature registers its slice here as it is implemented.
 */
export const rootReducer = combineReducers({
  ui: uiReducer,
  auth: authReducer,
  // lobby:         lobbyReducer,
  // matchmaking:   matchmakingReducer,
  // game:          gameReducer,
  // chat:          chatReducer,
  // notifications: notificationsReducer,
  // wallet:        walletReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
