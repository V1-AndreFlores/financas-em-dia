export type TransactionType = 'expense' | 'income';
export type TransactionStatus = 'paid' | 'pending';
export type TransactionEntryMode = 'single' | 'recurring' | 'installment';
export type RecurrenceFrequency = 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface TransactionSeriesMetadata {
  groupId: string;
  current: number;
  total: number;
}

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  description: string;
  amountInCents: number;
  date: string;
  categoryId: string;
  accountId: string;
  status: TransactionStatus;
  notes?: string;
  entryMode?: TransactionEntryMode;
  recurring?: TransactionSeriesMetadata & {
    frequency: RecurrenceFrequency;
  };
  installment?: TransactionSeriesMetadata;
  createdAt: string;
  updatedAt: string;
}
