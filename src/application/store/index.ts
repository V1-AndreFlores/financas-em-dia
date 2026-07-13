import {
  configureStore,
  createListenerMiddleware,
  isAnyOf,
} from '@reduxjs/toolkit';

import { appDataRepository } from '../../infrastructure/persistence/appDataRepository';
import { notificationService } from '../../infrastructure/notifications/notificationService';
import {
  accountAdded,
  accountArchived,
  accountsReducer,
  accountUpdated,
} from '../../features/accounts/accountsSlice';
import { appReducer } from '../../features/app/appSlice';
import {
  categoryAdded,
  categoryArchived,
  categoriesReducer,
} from '../../features/categories/categoriesSlice';
import { financialPeriodReducer } from '../../features/financialPeriod/financialPeriodSlice';
import {
  appLockModeChanged,
  financialMonthStartDayChanged,
  notificationSettingsChanged,
  settingsReducer,
  themeChanged,
} from '../../features/settings/settingsSlice';
import {
  transactionAdded,
  transactionDeleted,
  transactionsAdded,
  transactionsReducer,
  transactionStatusChanged,
  transactionUpdated,
} from '../../features/transactions/transactionsSlice';

const persistenceListener = createListenerMiddleware();

export const store = configureStore({
  reducer: {
    app: appReducer,
    accounts: accountsReducer,
    categories: categoriesReducer,
    financialPeriod: financialPeriodReducer,
    settings: settingsReducer,
    transactions: transactionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(persistenceListener.middleware),
});

const persistedActions = isAnyOf(
  accountAdded,
  accountArchived,
  accountUpdated,
  appLockModeChanged,
  categoryAdded,
  categoryArchived,
  financialMonthStartDayChanged,
  notificationSettingsChanged,
  themeChanged,
  transactionAdded,
  transactionDeleted,
  transactionsAdded,
  transactionStatusChanged,
  transactionUpdated,
);

persistenceListener.startListening({
  matcher: persistedActions,
  effect: async (_action, listenerApi) => {
    listenerApi.cancelActiveListeners();
    await listenerApi.delay(250);

    const state = listenerApi.getState() as RootState;

    if (!state.app.isHydrated) {
      return;
    }

    const snapshot = {
      version: 2 as const,
      accounts: state.accounts?.items ?? [],
      categories: state.categories?.items ?? [],
      transactions: state.transactions?.items ?? [],
      settings: state.settings,
    };

    await appDataRepository.save(snapshot);

    try {
      await notificationService.sync(snapshot.transactions, snapshot.settings);
    } catch {
      // A persistência financeira não deve falhar caso o SO recuse uma notificação.
    }
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
