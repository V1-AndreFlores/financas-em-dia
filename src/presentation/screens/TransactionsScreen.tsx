import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../application/store/hooks';
import type { FinancialTransaction } from '../../domain/entities/Transaction';
import {
  transactionDeleted,
  transactionStatusChanged,
  transactionUpdated,
} from '../../features/transactions/transactionsSlice';
import {
  getFinancialPeriod,
  getFinancialPeriodReferenceDate,
  isDateInPeriod,
} from '../../shared/utils/financialPeriod';
import { AppActionSheet } from '../components/AppActionSheet';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { AppDialog } from '../components/AppDialog';
import { FinancialPeriodNavigator } from '../components/FinancialPeriodNavigator';
import { AppHeader } from '../components/AppHeader';
import { AppScreen } from '../components/AppScreen';
import { EmptyState } from '../components/EmptyState';
import { FilterChip } from '../components/FilterChip';
import { FormTextInput } from '../components/FormTextInput';
import {
  defaultTransactionAdvancedFilters,
  TransactionFiltersModal,
  type TransactionAdvancedFilters,
} from '../components/TransactionFiltersModal';
import { TransactionFormModal } from '../components/TransactionFormModal';
import { TransactionRow } from '../components/TransactionRow';

const MODAL_TRANSITION_DELAY = 190;

interface FeedbackDialogState {
  title: string;
  message: string;
}

export function TransactionsScreen() {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((state) => state.accounts?.items ?? []);
  const categories = useAppSelector((state) => state.categories?.items ?? []);
  const transactions = useAppSelector((state) => state.transactions?.items ?? []);
  const startDay = useAppSelector((state) => state.settings.financialMonthStartDay);
  const monthOffset = useAppSelector((state) => state.financialPeriod.monthOffset);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<TransactionAdvancedFilters>(
    defaultTransactionAdvancedFilters,
  );
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<FinancialTransaction | null>(null);
  const [editTransaction, setEditTransaction] =
    useState<FinancialTransaction | null>(null);
  const [deleteTransaction, setDeleteTransaction] =
    useState<FinancialTransaction | null>(null);
  const [feedbackDialog, setFeedbackDialog] =
    useState<FeedbackDialogState | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (transitionTimer.current) {
        clearTimeout(transitionTimer.current);
      }
    },
    [],
  );

  const period = getFinancialPeriod(
    getFinancialPeriodReferenceDate(monthOffset),
    startDay,
  );

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );
  const accountMap = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.name])),
    [accounts],
  );

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');

    return [...transactions]
      .filter((transaction) => {
        if (filters.periodScope === 'cycle') {
          return isDateInPeriod(transaction.date, period);
        }

        if (
          filters.periodScope === 'custom' &&
          filters.customStartDate &&
          filters.customEndDate
        ) {
          return (
            transaction.date >= filters.customStartDate &&
            transaction.date <= filters.customEndDate
          );
        }

        return true;
      })
      .filter((transaction) => filters.type === 'all' || transaction.type === filters.type)
      .filter(
        (transaction) =>
          filters.status === 'all' || transaction.status === filters.status,
      )
      .filter(
        (transaction) =>
          filters.categoryId === null || transaction.categoryId === filters.categoryId,
      )
      .filter(
        (transaction) =>
          filters.accountId === null || transaction.accountId === filters.accountId,
      )
      .filter(
        (transaction) =>
          transaction.amountInCents >= filters.minimumAmountInCents &&
          (filters.maximumAmountInCents === 0 ||
            transaction.amountInCents <= filters.maximumAmountInCents),
      )
      .filter((transaction) => {
        if (!normalizedSearch) {
          return true;
        }

        const categoryName = categoryMap.get(transaction.categoryId) ?? '';
        const accountName = accountMap.get(transaction.accountId) ?? '';
        const searchableValue =
          `${transaction.description} ${categoryName} ${accountName} ${transaction.notes ?? ''}`.toLocaleLowerCase(
            'pt-BR',
          );

        return searchableValue.includes(normalizedSearch);
      })
      .sort((a, b) => {
        const byDate = b.date.localeCompare(a.date);
        return byDate !== 0 ? byDate : b.createdAt.localeCompare(a.createdAt);
      });
  }, [accountMap, categoryMap, filters, period, search, transactions]);

  const activeFilterCount = [
    filters.periodScope !== 'cycle',
    filters.type !== 'all',
    filters.status !== 'all',
    filters.categoryId !== null,
    filters.accountId !== null,
    filters.minimumAmountInCents > 0,
    filters.maximumAmountInCents > 0,
  ].filter(Boolean).length;

  const changeSelectedStatus = () => {
    if (!selectedTransaction) {
      return;
    }

    dispatch(
      transactionStatusChanged({
        id: selectedTransaction.id,
        status: selectedTransaction.status === 'paid' ? 'pending' : 'paid',
      }),
    );
    setSelectedTransaction(null);
  };

  const openEdit = () => {
    if (!selectedTransaction) {
      return;
    }

    const transaction = selectedTransaction;
    setSelectedTransaction(null);
    transitionTimer.current = setTimeout(() => {
      setEditTransaction(transaction);
      transitionTimer.current = null;
    }, MODAL_TRANSITION_DELAY);
  };

  const requestDeleteConfirmation = () => {
    if (!selectedTransaction) {
      return;
    }

    const transaction = selectedTransaction;
    setSelectedTransaction(null);
    transitionTimer.current = setTimeout(() => {
      setDeleteTransaction(transaction);
      transitionTimer.current = null;
    }, MODAL_TRANSITION_DELAY);
  };

  const confirmDelete = () => {
    if (!deleteTransaction) {
      return;
    }

    dispatch(transactionDeleted(deleteTransaction.id));
    setDeleteTransaction(null);
  };

  const saveEditedTransaction = (transaction: FinancialTransaction) => {
    dispatch(transactionUpdated(transaction));
    setEditTransaction(null);
    setFeedbackDialog({
      title: 'Lançamento atualizado',
      message: 'As alterações foram salvas no dispositivo.',
    });
  };

  return (
    <>
      <AppScreen>
        <AppHeader
          title="Lançamentos"
          subtitle="Consulte, filtre, edite e atualize suas movimentações."
        />

        <FinancialPeriodNavigator />

        <FormTextInput
          label="Pesquisar"
          onChangeText={setSearch}
          placeholder="Descrição, observação, categoria ou conta"
          value={search}
        />

        <View style={styles.filters}>
          <FilterChip
            label="Todos"
            selected={filters.type === 'all'}
            onPress={() => setFilters((current) => ({ ...current, type: 'all' }))}
          />
          <FilterChip
            label="Despesas"
            selected={filters.type === 'expense'}
            onPress={() => setFilters((current) => ({ ...current, type: 'expense' }))}
          />
          <FilterChip
            label="Receitas"
            selected={filters.type === 'income'}
            onPress={() => setFilters((current) => ({ ...current, type: 'income' }))}
          />
        </View>

        <View style={styles.filterActions}>
          <AppButton
            title={`Filtros avançados${activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}`}
            variant="secondary"
            onPress={() => setFiltersVisible(true)}
          />
          {activeFilterCount > 0 ? (
            <AppButton
              title="Limpar"
              variant="ghost"
              onPress={() => setFilters(defaultTransactionAdvancedFilters)}
            />
          ) : null}
        </View>

        <AppCard>
          {filteredTransactions.length === 0 ? (
            <EmptyState
              title="Nenhum resultado"
              description="Altere os filtros, navegue para outro ciclo ou registre um novo lançamento."
            />
          ) : (
            filteredTransactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                categoryName={categoryMap.get(transaction.categoryId) ?? 'Sem categoria'}
                accountName={accountMap.get(transaction.accountId) ?? 'Conta removida'}
                onPress={() => setSelectedTransaction(transaction)}
              />
            ))
          )}
        </AppCard>
      </AppScreen>

      <AppActionSheet
        visible={selectedTransaction !== null}
        title="Ações do lançamento"
        description={
          selectedTransaction
            ? `Escolha o que deseja fazer com “${selectedTransaction.description}”.`
            : undefined
        }
        actions={[
          {
            title: 'Editar lançamento',
            variant: 'primary',
            onPress: openEdit,
          },
          {
            title:
              selectedTransaction?.status === 'paid'
                ? 'Marcar como pendente'
                : 'Marcar como efetivado',
            variant: 'secondary',
            onPress: changeSelectedStatus,
          },
          {
            title: 'Excluir lançamento',
            variant: 'danger',
            onPress: requestDeleteConfirmation,
          },
        ]}
        onRequestClose={() => setSelectedTransaction(null)}
      />

      <TransactionFormModal
        visible={editTransaction !== null}
        transaction={editTransaction}
        accounts={accounts}
        categories={categories}
        onRequestClose={() => setEditTransaction(null)}
        onSave={saveEditedTransaction}
        onValidationError={(title, message) => setFeedbackDialog({ title, message })}
      />

      <TransactionFiltersModal
        visible={filtersVisible}
        value={filters}
        period={period}
        accounts={accounts}
        categories={categories}
        onApply={(nextFilters) => {
          setFilters(nextFilters);
          setFiltersVisible(false);
        }}
        onRequestClose={() => setFiltersVisible(false)}
        onValidationError={(title, message) => setFeedbackDialog({ title, message })}
      />

      <AppDialog
        visible={deleteTransaction !== null}
        title="Excluir lançamento?"
        message={
          deleteTransaction
            ? `O lançamento “${deleteTransaction.description}” será removido somente nesta ocorrência. Esta ação não pode ser desfeita.`
            : undefined
        }
        onRequestClose={() => setDeleteTransaction(null)}
        actions={[
          {
            title: 'Excluir definitivamente',
            variant: 'danger',
            onPress: confirmDelete,
          },
          {
            title: 'Cancelar',
            variant: 'ghost',
            onPress: () => setDeleteTransaction(null),
          },
        ]}
      />

      <AppDialog
        visible={feedbackDialog !== null}
        title={feedbackDialog?.title ?? ''}
        message={feedbackDialog?.message}
        onRequestClose={() => setFeedbackDialog(null)}
        actions={[
          {
            title: 'Continuar',
            onPress: () => setFeedbackDialog(null),
          },
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  filterActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
});
