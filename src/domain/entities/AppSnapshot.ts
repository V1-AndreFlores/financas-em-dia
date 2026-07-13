import type { Account } from './Account';
import type { Category } from './Category';
import type { AppSettings } from './Settings';
import type { FinancialTransaction } from './Transaction';

export interface AppSnapshot {
  version: 2;
  accounts: Account[];
  categories: Category[];
  transactions: FinancialTransaction[];
  settings: AppSettings;
}
