export type ThemePreference = 'system' | 'light' | 'dark';

export interface AppSettings {
  theme: ThemePreference;
  locale: 'pt-BR';
  currency: 'BRL';
  financialMonthStartDay: number;
}
