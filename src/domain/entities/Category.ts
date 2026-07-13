export type CategoryType = 'expense' | 'income' | 'both';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}
