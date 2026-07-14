import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Account } from '../../domain/entities/Account';

interface AccountsState {
  items: Account[];
}

const initialState: AccountsState = {
  items: [],
};

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    accountsReplaced(state, action: PayloadAction<Account[]>) {
      state.items = action.payload;
    },
    accountAdded(state, action: PayloadAction<Account>) {
      state.items.push(action.payload);
    },
    accountUpdated(state, action: PayloadAction<Account>) {
      const index = state.items.findIndex((item) => item.id === action.payload.id);

      if (index >= 0) {
        state.items[index] = action.payload;
      }
    },
    accountArchived(state, action: PayloadAction<string>) {
      const account = state.items.find((item) => item.id === action.payload);

      if (account) {
        account.isActive = false;
        account.updatedAt = new Date().toISOString();
      }
    },
    accountDeleted(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const {
  accountAdded,
  accountArchived,
  accountDeleted,
  accountsReplaced,
  accountUpdated,
} = accountsSlice.actions;
export const accountsReducer = accountsSlice.reducer;
