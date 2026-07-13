import type { AppSnapshot } from '../../domain/entities/AppSnapshot';
import type { ThemePreference } from '../../domain/entities/Settings';
import { createInitialSnapshot } from './createInitialSnapshot';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

function normalizeFinancialMonthStartDay(value: unknown, fallback: number): number {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 28
    ? Number(value)
    : fallback;
}

/**
 * Normaliza snapshots persistidos para impedir que dados incompletos ou de uma
 * versão anterior deixem slices do Redux com propriedades indefinidas.
 */
export function normalizeAppSnapshot(snapshot: unknown): AppSnapshot {
  const defaults = createInitialSnapshot();

  if (!isRecord(snapshot)) {
    return defaults;
  }

  const persistedSettings = isRecord(snapshot.settings) ? snapshot.settings : {};

  return {
    version: 1,
    accounts: Array.isArray(snapshot.accounts)
      ? (snapshot.accounts as AppSnapshot['accounts'])
      : defaults.accounts,
    categories: Array.isArray(snapshot.categories)
      ? (snapshot.categories as AppSnapshot['categories'])
      : defaults.categories,
    transactions: Array.isArray(snapshot.transactions)
      ? (snapshot.transactions as AppSnapshot['transactions'])
      : defaults.transactions,
    settings: {
      theme: isThemePreference(persistedSettings.theme)
        ? persistedSettings.theme
        : defaults.settings.theme,
      locale: 'pt-BR',
      currency: 'BRL',
      financialMonthStartDay: normalizeFinancialMonthStartDay(
        persistedSettings.financialMonthStartDay,
        defaults.settings.financialMonthStartDay,
      ),
    },
  };
}
