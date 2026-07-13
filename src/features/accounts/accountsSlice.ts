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
    accountArchived(state, action: PayloadAction<string>) {
      const account = state.items.find((item) => item.id === action.payload);

      if (account) {
        account.isActive = false;
      }
    },
  },
});

export const { accountAdded, accountArchived, accountsReplaced } = accountsSlice.actions;
export const accountsReducer = accountsSlice.reducer;
