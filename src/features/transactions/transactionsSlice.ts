import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { FinancialTransaction } from '../../domain/entities/Transaction';

interface TransactionsState {
  items: FinancialTransaction[];
}

const initialState: TransactionsState = {
  items: [],
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    transactionsReplaced(state, action: PayloadAction<FinancialTransaction[]>) {
      state.items = action.payload;
    },
    transactionAdded(state, action: PayloadAction<FinancialTransaction>) {
      state.items.push(action.payload);
    },
    transactionsAdded(state, action: PayloadAction<FinancialTransaction[]>) {
      state.items.push(...action.payload);
    },
    transactionUpdated(state, action: PayloadAction<FinancialTransaction>) {
      const index = state.items.findIndex((item) => item.id === action.payload.id);

      if (index >= 0) {
        state.items[index] = action.payload;
      }
    },
    transactionDeleted(state, action: PayloadAction<string>) {
      const transaction = state.items.find((item) => item.id === action.payload);

      if (transaction?.recurring?.isOpenEnded) {
        const groupId = transaction.recurring.groupId;
        const excluded = new Set(transaction.recurring.excludedOccurrences ?? []);
        excluded.add(transaction.recurring.current);
        const excludedOccurrences = [...excluded].sort((a, b) => a - b);

        state.items.forEach((item) => {
          if (item.recurring?.groupId === groupId) {
            item.recurring.excludedOccurrences = excludedOccurrences;
            item.updatedAt = new Date().toISOString();
          }
        });
      }

      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    transactionsDeletedByAccountId(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.accountId !== action.payload);
    },
    transactionsCategoryReassigned(
      state,
      action: PayloadAction<{ fromCategoryId: string; toCategoryId: string }>,
    ) {
      const now = new Date().toISOString();

      state.items.forEach((item) => {
        if (item.categoryId === action.payload.fromCategoryId) {
          item.categoryId = action.payload.toCategoryId;
          item.updatedAt = now;
        }
      });
    },
    transactionStatusChanged(
      state,
      action: PayloadAction<Pick<FinancialTransaction, 'id' | 'status'>>,
    ) {
      const transaction = state.items.find((item) => item.id === action.payload.id);

      if (transaction) {
        transaction.status = action.payload.status;
        transaction.updatedAt = new Date().toISOString();
      }
    },
  },
});

export const {
  transactionAdded,
  transactionDeleted,
  transactionsAdded,
  transactionsCategoryReassigned,
  transactionsDeletedByAccountId,
  transactionsReplaced,
  transactionStatusChanged,
  transactionUpdated,
} = transactionsSlice.actions;
export const transactionsReducer = transactionsSlice.reducer;
