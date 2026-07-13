import type { AppSettings } from '../../domain/entities/Settings';
import type { FinancialTransaction } from '../../domain/entities/Transaction';

export const notificationService = {
  async requestPermission(): Promise<boolean> {
    return false;
  },
  async sync(
    _transactions: FinancialTransaction[],
    _settings: AppSettings,
  ): Promise<void> {
    return undefined;
  },
  async clear(): Promise<void> {
    return undefined;
  },
};
