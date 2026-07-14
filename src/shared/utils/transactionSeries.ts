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

const OPEN_ENDED_BATCH_SIZE = 12;
const MAX_GENERATED_PER_SYNC = 600;

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

export function addRecurrenceDate(
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
      isOpenEnded: false,
      seriesStartDate: input.date,
    },
  }));
}

export function createOpenEndedRecurringTransactions(
  input: BaseTransactionInput,
  frequency: RecurrenceFrequency,
): FinancialTransaction[] {
  const now = new Date().toISOString();
  const groupId = createId('recurring');

  return Array.from({ length: OPEN_ENDED_BATCH_SIZE }, (_, index) => ({
    ...createBaseTransaction(
      { ...input, status: index === 0 ? input.status : 'pending' },
      addRecurrenceDate(input.date, index, frequency),
      now,
    ),
    entryMode: 'recurring' as const,
    recurring: {
      groupId,
      current: index + 1,
      total: null,
      frequency,
      isOpenEnded: true,
      seriesStartDate: input.date,
    },
  }));
}

export function extendOpenEndedRecurringTransactions(
  transactions: FinancialTransaction[],
  targetDate: string,
): FinancialTransaction[] {
  const groups = new Map<string, FinancialTransaction[]>();

  transactions.forEach((transaction) => {
    if (!transaction.recurring?.isOpenEnded || transaction.recurring.total !== null) {
      return;
    }

    const group = groups.get(transaction.recurring.groupId) ?? [];
    group.push(transaction);
    groups.set(transaction.recurring.groupId, group);
  });

  const generated: FinancialTransaction[] = [];
  const now = new Date().toISOString();

  groups.forEach((group) => {
    const ordered = [...group].sort((a, b) => {
      const byOccurrence =
        (a.recurring?.current ?? 0) - (b.recurring?.current ?? 0);
      return byOccurrence !== 0 ? byOccurrence : a.date.localeCompare(b.date);
    });
    let latest: FinancialTransaction | undefined = ordered.at(-1);

    if (!latest?.recurring || latest.date >= targetDate) {
      return;
    }

    const excludedOccurrences = new Set(
      ordered.flatMap((item) => item.recurring?.excludedOccurrences ?? []),
    );
    let generatedForGroup = 0;

    while (
      latest &&
      latest.date < targetDate &&
      generatedForGroup < MAX_GENERATED_PER_SYNC
    ) {
      const batchStart: FinancialTransaction = latest;

      for (
        let offset = 1;
        offset <= OPEN_ENDED_BATCH_SIZE && generatedForGroup < MAX_GENERATED_PER_SYNC;
        offset += 1
      ) {
        const current = (batchStart.recurring?.current ?? 0) + offset;
        const date = addRecurrenceDate(
          batchStart.date,
          offset,
          batchStart.recurring?.frequency ?? 'monthly',
        );

        if (excludedOccurrences.has(current)) {
          latest = {
            ...batchStart,
            date,
            recurring: {
              ...batchStart.recurring!,
              current,
            },
          };
          continue;
        }

        const next: FinancialTransaction = {
          ...batchStart,
          id: createId('transaction'),
          date,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
          recurring: {
            ...batchStart.recurring!,
            current,
            total: null,
            isOpenEnded: true,
            excludedOccurrences:
              excludedOccurrences.size > 0
                ? [...excludedOccurrences].sort((a, b) => a - b)
                : undefined,
          },
        };

        generated.push(next);
        latest = next;
        generatedForGroup += 1;
      }
    }
  });

  return generated;
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
    return transaction.recurring.isOpenEnded || transaction.recurring.total === null
      ? `Recorrente ${transaction.recurring.current} · sem término`
      : `Recorrente ${transaction.recurring.current}/${transaction.recurring.total}`;
  }

  return null;
}
