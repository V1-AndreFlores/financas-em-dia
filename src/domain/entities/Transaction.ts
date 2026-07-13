export type TransactionType = 'expense' | 'income';
export type TransactionStatus = 'paid' | 'pending';

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
  createdAt: string;
  updatedAt: string;
}
