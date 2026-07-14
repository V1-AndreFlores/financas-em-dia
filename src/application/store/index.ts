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
  accountDeleted,
  accountsReducer,
  accountUpdated,
} from '../../features/accounts/accountsSlice';
import { appHydrated, appReducer } from '../../features/app/appSlice';
import {
  categoryAdded,
  categoryArchived,
  categoryDeleted,
  categoriesReducer,
  categoryUpdated,
} from '../../features/categories/categoriesSlice';
import {
  financialPeriodChanged,
  financialPeriodMoved,
  financialPeriodReducer,
  financialPeriodReset,
} from '../../features/financialPeriod/financialPeriodSlice';
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
  transactionsCategoryReassigned,
  transactionsDeletedByAccountId,
  transactionsReducer,
  transactionStatusChanged,
  transactionUpdated,
} from '../../features/transactions/transactionsSlice';
import {
  getFinancialPeriod,
  getFinancialPeriodReferenceDate,
} from '../../shared/utils/financialPeriod';
import { extendOpenEndedRecurringTransactions } from '../../shared/utils/transactionSeries';

const persistenceListener = createListenerMiddleware();
const recurringSeriesListener = createListenerMiddleware();

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
    getDefaultMiddleware().prepend(
      recurringSeriesListener.middleware,
      persistenceListener.middleware,
    ),
});

const persistedActions = isAnyOf(
  accountAdded,
  accountArchived,
  accountDeleted,
  accountUpdated,
  appLockModeChanged,
  categoryAdded,
  categoryArchived,
  categoryDeleted,
  categoryUpdated,
  financialMonthStartDayChanged,
  notificationSettingsChanged,
  themeChanged,
  transactionAdded,
  transactionDeleted,
  transactionsAdded,
  transactionsCategoryReassigned,
  transactionsDeletedByAccountId,
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
      version: 3 as const,
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

recurringSeriesListener.startListening({
  matcher: isAnyOf(
    appHydrated,
    financialPeriodChanged,
    financialPeriodMoved,
    financialPeriodReset,
  ),
  effect: async (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState;

    if (!state.app.isHydrated) {
      return;
    }

    const targetPeriod = getFinancialPeriod(
      getFinancialPeriodReferenceDate(state.financialPeriod.monthOffset),
      state.settings.financialMonthStartDay,
    );
    const generated = extendOpenEndedRecurringTransactions(
      state.transactions?.items ?? [],
      targetPeriod.end,
    );

    if (generated.length > 0) {
      listenerApi.dispatch(transactionsAdded(generated));
    }
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
