import type {
  FinancialTransaction,
  RecurrenceFrequency,
  TransactionStatus,
  TransactionType,
} from '../../domain/entities/Transaction';
import { createId } from './createId';
import { addDaysToIso, addMonthsToIso, addYearsToIso } from './date';

interface BaseTransactionInput {
  type: TransactionType;
  description: string;
  amountInCents: number;
  date: string;
  categoryId: string;
  accountId: string;
  status: TransactionStatus;
  notes?: string;
}

function createBaseTransaction(
  input: BaseTransactionInput,
  date: string,
  now: string,
): FinancialTransaction {
  return {
    id: createId('transaction'),
    type: input.type,
    description: input.description,
    amountInCents: input.amountInCents,
    date,
    categoryId: input.categoryId,
    accountId: input.accountId,
    status: input.status,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  };
}

function addRecurrenceDate(
  startDate: string,
  occurrenceOffset: number,
  frequency: RecurrenceFrequency,
): string {
  switch (frequency) {
    case 'weekly':
      return addDaysToIso(startDate, occurrenceOffset * 7);
    case 'biweekly':
      return addDaysToIso(startDate, occurrenceOffset * 14);
    case 'yearly':
      return addYearsToIso(startDate, occurrenceOffset);
    case 'monthly':
    default:
      return addMonthsToIso(startDate, occurrenceOffset);
  }
}

export function createSingleTransaction(
  input: BaseTransactionInput,
): FinancialTransaction {
  const now = new Date().toISOString();

  return {
    ...createBaseTransaction(input, input.date, now),
    entryMode: 'single',
  };
}

export function createRecurringTransactions(
  input: BaseTransactionInput,
  frequency: RecurrenceFrequency,
  occurrenceCount: number,
): FinancialTransaction[] {
  const safeCount = Math.min(60, Math.max(2, occurrenceCount));
  const now = new Date().toISOString();
  const groupId = createId('recurring');

  return Array.from({ length: safeCount }, (_, index) => ({
    ...createBaseTransaction(
      { ...input, status: index === 0 ? input.status : 'pending' },
      addRecurrenceDate(input.date, index, frequency),
      now,
    ),
    entryMode: 'recurring' as const,
    recurring: {
      groupId,
      current: index + 1,
      total: safeCount,
      frequency,
    },
  }));
}

export function createInstallmentTransactions(
  input: BaseTransactionInput,
  totalInstallments: number,
  startingInstallment: number,
): FinancialTransaction[] {
  const safeTotal = Math.min(120, Math.max(2, totalInstallments));
  const safeStart = Math.min(safeTotal, Math.max(1, startingInstallment));
  const remaining = safeTotal - safeStart + 1;
  const now = new Date().toISOString();
  const groupId = createId('installment');

  return Array.from({ length: remaining }, (_, index) => {
    const current = safeStart + index;

    return {
      ...createBaseTransaction(
        { ...input, status: index === 0 ? input.status : 'pending' },
        addMonthsToIso(input.date, index),
        now,
      ),
      entryMode: 'installment' as const,
      installment: {
        groupId,
        current,
        total: safeTotal,
      },
    };
  });
}

export function getTransactionSeriesLabel(
  transaction: FinancialTransaction,
): string | null {
  if (transaction.installment) {
    return `Parcela ${transaction.installment.current}/${transaction.installment.total}`;
  }

  if (transaction.recurring) {
    return `Recorrente ${transaction.recurring.current}/${transaction.recurring.total}`;
  }

  return null;
}
