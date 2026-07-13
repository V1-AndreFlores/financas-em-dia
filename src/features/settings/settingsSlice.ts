import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { AppSettings, ThemePreference } from '../../domain/entities/Settings';

const initialState: AppSettings = {
  theme: 'system',
  locale: 'pt-BR',
  currency: 'BRL',
  financialMonthStartDay: 1,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    settingsReplaced(_state, action: PayloadAction<AppSettings>) {
      return action.payload;
    },
    themeChanged(state, action: PayloadAction<ThemePreference>) {
      state.theme = action.payload;
    },
    financialMonthStartDayChanged(state, action: PayloadAction<number>) {
      state.financialMonthStartDay = Math.min(28, Math.max(1, action.payload));
    },
  },
});

export const {
  financialMonthStartDayChanged,
  settingsReplaced,
  themeChanged,
} = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
