import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type {
  AppLockMode,
  AppSettings,
  ThemePreference,
} from '../../domain/entities/Settings';

const initialState: AppSettings = {
  theme: 'light',
  locale: 'pt-BR',
  currency: 'BRL',
  financialMonthStartDay: 1,
  notificationsEnabled: false,
  notificationDaysBefore: 1,
  notificationHour: 9,
  appLockMode: 'none',
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
    notificationSettingsChanged(
      state,
      action: PayloadAction<
        Pick<
          AppSettings,
          'notificationsEnabled' | 'notificationDaysBefore' | 'notificationHour'
        >
      >,
    ) {
      state.notificationsEnabled = action.payload.notificationsEnabled;
      state.notificationDaysBefore = Math.min(
        7,
        Math.max(0, action.payload.notificationDaysBefore),
      );
      state.notificationHour = Math.min(23, Math.max(0, action.payload.notificationHour));
    },
    appLockModeChanged(state, action: PayloadAction<AppLockMode>) {
      state.appLockMode = action.payload;
    },
  },
});

export const {
  appLockModeChanged,
  financialMonthStartDayChanged,
  notificationSettingsChanged,
  settingsReplaced,
  themeChanged,
} = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
