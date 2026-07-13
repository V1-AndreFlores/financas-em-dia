import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isHydrated: boolean;
  hydrationError: string | null;
}

const initialState: AppState = {
  isHydrated: false,
  hydrationError: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    appHydrated(state) {
      state.isHydrated = true;
      state.hydrationError = null;
    },
    appHydrationFailed(state, action: PayloadAction<string>) {
      state.isHydrated = false;
      state.hydrationError = action.payload;
    },
  },
});

export const { appHydrated, appHydrationFailed } = appSlice.actions;
export const appReducer = appSlice.reducer;
