import {
  configureStore,
  createListenerMiddleware,
  isAnyOf,
} from '@reduxjs/toolkit';

import { appDataRepository } from '../../infrastructure/persistence/appDataRepository';
import { accountAdded, accountArchived, accountsReducer } from '../../features/accounts/accountsSlice';
import { appReducer } from '../../features/app/appSlice';
import {
  categoryAdded,
  categoryArchived,
  categoriesReducer,
} from '../../features/categories/categoriesSlice';
import {
  financialMonthStartDayChanged,
  settingsReducer,
  themeChanged,
} from '../../features/settings/settingsSlice';
import {
  transactionAdded,
  transactionDeleted,
  transactionsReducer,
  transactionStatusChanged,
} from '../../features/transactions/transactionsSlice';

const persistenceListener = createListenerMiddleware();

export const store = configureStore({
  reducer: {
    app: appReducer,
    accounts: accountsReducer,
    categories: categoriesReducer,
    settings: settingsReducer,
    transactions: transactionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(persistenceListener.middleware),
});

persistenceListener.startListening({
  matcher: isAnyOf(
    accountAdded,
    accountArchived,
    categoryAdded,
    categoryArchived,
    financialMonthStartDayChanged,
    themeChanged,
    transactionAdded,
    transactionDeleted,
    transactionStatusChanged,
  ),
  effect: async (_action, listenerApi) => {
    listenerApi.cancelActiveListeners();
    await listenerApi.delay(250);

    const state = listenerApi.getState() as RootState;

    if (!state.app.isHydrated) {
      return;
    }

    await appDataRepository.save({
      version: 1,
      accounts: state.accounts?.items ?? [],
      categories: state.categories?.items ?? [],
      transactions: state.transactions?.items ?? [],
      settings: state.settings,
    });
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
