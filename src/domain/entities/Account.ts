export type AccountType = 'checking' | 'digital' | 'cash' | 'savings' | 'benefit';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalanceInCents: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}
