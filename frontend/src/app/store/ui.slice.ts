import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * App-level UI state (theme, global modal/toast surface). Feature-specific
 * state lives in each feature's own slice under `features/<name>/store`.
 */
export type ThemeMode = 'light' | 'dark' | 'system';

interface UiState {
  theme: ThemeMode;
  isSidebarOpen: boolean;
  activeModal: string | null;
}

const initialState: UiState = {
  theme: 'system',
  isSidebarOpen: false,
  activeModal: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
  },
});

export const { setTheme, toggleSidebar, openModal, closeModal } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
