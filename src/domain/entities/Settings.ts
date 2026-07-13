export type ThemePreference = 'light' | 'dark';
export type AppLockMode = 'none' | 'biometric' | 'pin';

export interface AppSettings {
  theme: ThemePreference;
  locale: 'pt-BR';
  currency: 'BRL';
  financialMonthStartDay: number;
  notificationsEnabled: boolean;
  notificationDaysBefore: number;
  notificationHour: number;
  appLockMode: AppLockMode;
}
