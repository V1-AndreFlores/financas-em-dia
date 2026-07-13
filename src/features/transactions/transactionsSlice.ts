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
    transactionDeleted(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
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
  transactionsReplaced,
  transactionStatusChanged,
} = transactionsSlice.actions;
export const transactionsReducer = transactionsSlice.reducer;
