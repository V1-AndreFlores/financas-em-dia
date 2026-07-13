export type AccountType = 'checking' | 'digital' | 'cash' | 'savings' | 'benefit';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalanceInCents: number;
  initialBalanceDate: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
