import type { Account } from '../../domain/entities/Account';
import type { AppSnapshot } from '../../domain/entities/AppSnapshot';
import type { AppLockMode, ThemePreference } from '../../domain/entities/Settings';
import type {
  FinancialTransaction,
  RecurrenceFrequency,
  TransactionEntryMode,
  TransactionStatus,
  TransactionType,
} from '../../domain/entities/Transaction';
import { todayIsoDate } from '../../shared/utils/date';
import { createInitialSnapshot } from './createInitialSnapshot';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

function isAppLockMode(value: unknown): value is AppLockMode {
  return value === 'none' || value === 'biometric' || value === 'pin';
}

function isTransactionType(value: unknown): value is TransactionType {
  return value === 'expense' || value === 'income';
}

function isTransactionStatus(value: unknown): value is TransactionStatus {
  return value === 'paid' || value === 'pending';
}

function isEntryMode(value: unknown): value is TransactionEntryMode {
  return value === 'single' || value === 'recurring' || value === 'installment';
}

function isRecurrenceFrequency(value: unknown): value is RecurrenceFrequency {
  return (
    value === 'weekly' ||
    value === 'biweekly' ||
    value === 'monthly' ||
    value === 'yearly'
  );
}

function normalizeInteger(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  return Number.isInteger(value) && Number(value) >= min && Number(value) <= max
    ? Number(value)
    : fallback;
}

function normalizeAccounts(value: unknown, defaults: Account[]): Account[] {
  if (!Array.isArray(value)) {
    return defaults;
  }

  return value
    .filter(isRecord)
    .map((account) => {
      const createdAt =
        typeof account.createdAt === 'string'
          ? account.createdAt
          : new Date().toISOString();

      return {
        id: typeof account.id === 'string' ? account.id : `account-${createdAt}`,
        name: typeof account.name === 'string' ? account.name : 'Conta',
        type:
          account.type === 'checking' ||
          account.type === 'digital' ||
          account.type === 'cash' ||
          account.type === 'savings' ||
          account.type === 'benefit'
            ? account.type
            : 'digital',
        initialBalanceInCents:
          typeof account.initialBalanceInCents === 'number'
            ? Math.round(account.initialBalanceInCents)
            : 0,
        initialBalanceDate:
          typeof account.initialBalanceDate === 'string'
            ? account.initialBalanceDate
            : createdAt.slice(0, 10) || todayIsoDate(),
        isDefault: account.isDefault === true,
        isActive: account.isActive !== false,
        createdAt,
        updatedAt:
          typeof account.updatedAt === 'string' ? account.updatedAt : createdAt,
      } satisfies Account;
    });
}

function normalizeSeriesMetadata(value: unknown) {
  if (!isRecord(value)) {
    return undefined;
  }

  if (
    typeof value.groupId !== 'string' ||
    !Number.isInteger(value.current) ||
    !Number.isInteger(value.total)
  ) {
    return undefined;
  }

  return {
    groupId: value.groupId,
    current: Math.max(1, Number(value.current)),
    total: Math.max(1, Number(value.total)),
  };
}

function normalizeTransactions(value: unknown): FinancialTransaction[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).flatMap((transaction) => {
    if (
      typeof transaction.id !== 'string' ||
      typeof transaction.description !== 'string' ||
      typeof transaction.amountInCents !== 'number' ||
      typeof transaction.date !== 'string' ||
      typeof transaction.categoryId !== 'string' ||
      typeof transaction.accountId !== 'string' ||
      !isTransactionType(transaction.type) ||
      !isTransactionStatus(transaction.status)
    ) {
      return [];
    }

    const recurring = normalizeSeriesMetadata(transaction.recurring);
    const installment = normalizeSeriesMetadata(transaction.installment);
    const recurringRecord = isRecord(transaction.recurring)
      ? transaction.recurring
      : undefined;
    const now = new Date().toISOString();

    return [
      {
        id: transaction.id,
        type: transaction.type,
        description: transaction.description,
        amountInCents: Math.max(0, Math.round(transaction.amountInCents)),
        date: transaction.date,
        categoryId: transaction.categoryId,
        accountId: transaction.accountId,
        status: transaction.status,
        notes: typeof transaction.notes === 'string' ? transaction.notes : undefined,
        entryMode: isEntryMode(transaction.entryMode)
          ? transaction.entryMode
          : recurring
            ? 'recurring'
            : installment
              ? 'installment'
              : 'single',
        recurring:
          recurring &&
          recurringRecord &&
          isRecurrenceFrequency(recurringRecord.frequency)
            ? { ...recurring, frequency: recurringRecord.frequency }
            : undefined,
        installment,
        createdAt:
          typeof transaction.createdAt === 'string' ? transaction.createdAt : now,
        updatedAt:
          typeof transaction.updatedAt === 'string' ? transaction.updatedAt : now,
      },
    ];
  });
}

/** Normaliza snapshots antigos e incompletos antes da hidratação do Redux. */
export function normalizeAppSnapshot(snapshot: unknown): AppSnapshot {
  const defaults = createInitialSnapshot();

  if (!isRecord(snapshot)) {
    return defaults;
  }

  const persistedSettings = isRecord(snapshot.settings) ? snapshot.settings : {};

  return {
    version: 2,
    accounts: normalizeAccounts(snapshot.accounts, defaults.accounts),
    categories: Array.isArray(snapshot.categories)
      ? (snapshot.categories as AppSnapshot['categories'])
      : defaults.categories,
    transactions: normalizeTransactions(snapshot.transactions),
    settings: {
      theme: isThemePreference(persistedSettings.theme)
        ? persistedSettings.theme
        : defaults.settings.theme,
      locale: 'pt-BR',
      currency: 'BRL',
      financialMonthStartDay: normalizeInteger(
        persistedSettings.financialMonthStartDay,
        defaults.settings.financialMonthStartDay,
        1,
        28,
      ),
      notificationsEnabled: persistedSettings.notificationsEnabled === true,
      notificationDaysBefore: normalizeInteger(
        persistedSettings.notificationDaysBefore,
        defaults.settings.notificationDaysBefore,
        0,
        7,
      ),
      notificationHour: normalizeInteger(
        persistedSettings.notificationHour,
        defaults.settings.notificationHour,
        0,
        23,
      ),
      appLockMode: isAppLockMode(persistedSettings.appLockMode)
        ? persistedSettings.appLockMode
        : defaults.settings.appLockMode,
    },
  };
}
