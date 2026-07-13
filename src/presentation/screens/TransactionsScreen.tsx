import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../application/store/hooks';
import type {
  FinancialTransaction,
  TransactionType,
} from '../../domain/entities/Transaction';
import {
  transactionDeleted,
  transactionStatusChanged,
} from '../../features/transactions/transactionsSlice';
import { AppActionSheet } from '../components/AppActionSheet';
import { AppCard } from '../components/AppCard';
import { AppDialog } from '../components/AppDialog';
import { AppHeader } from '../components/AppHeader';
import { AppScreen } from '../components/AppScreen';
import { EmptyState } from '../components/EmptyState';
import { FilterChip } from '../components/FilterChip';
import { FormTextInput } from '../components/FormTextInput';
import { TransactionRow } from '../components/TransactionRow';

type TransactionFilter = 'all' | TransactionType;
type SelectedTransaction = Pick<FinancialTransaction, 'id' | 'description' | 'status'>;

const MODAL_TRANSITION_DELAY = 190;

export function TransactionsScreen() {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((state) => state.accounts?.items ?? []);
  const categories = useAppSelector((state) => state.categories?.items ?? []);
  const transactions = useAppSelector((state) => state.transactions?.items ?? []);

  const [filter, setFilter] = useState<TransactionFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedTransaction, setSelectedTransaction] =
    useState<SelectedTransaction | null>(null);
  const [deleteTransaction, setDeleteTransaction] =
    useState<SelectedTransaction | null>(null);
  const deleteTransitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (deleteTransitionTimer.current) {
        clearTimeout(deleteTransitionTimer.current);
      }
    },
    [],
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
      .filter((transaction) => filter === 'all' || transaction.type === filter)
      .filter((transaction) => {
        if (!normalizedSearch) {
          return true;
        }

        const categoryName = categoryMap.get(transaction.categoryId) ?? '';
        const accountName = accountMap.get(transaction.accountId) ?? '';
        const searchableValue =
          `${transaction.description} ${categoryName} ${accountName}`.toLocaleLowerCase(
            'pt-BR',
          );

        return searchableValue.includes(normalizedSearch);
      })
      .sort((a, b) => {
        const byDate = b.date.localeCompare(a.date);
        return byDate !== 0 ? byDate : b.createdAt.localeCompare(a.createdAt);
      });
  }, [accountMap, categoryMap, filter, search, transactions]);

  const openActions = (transaction: FinancialTransaction) => {
    setSelectedTransaction({
      id: transaction.id,
      description: transaction.description,
      status: transaction.status,
    });
  };

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

  const requestDeleteConfirmation = () => {
    if (!selectedTransaction) {
      return;
    }

    const transaction = selectedTransaction;
    setSelectedTransaction(null);

    deleteTransitionTimer.current = setTimeout(() => {
      setDeleteTransaction(transaction);
      deleteTransitionTimer.current = null;
    }, MODAL_TRANSITION_DELAY);
  };

  const confirmDelete = () => {
    if (!deleteTransaction) {
      return;
    }

    dispatch(transactionDeleted(deleteTransaction.id));
    setDeleteTransaction(null);
  };

  return (
    <>
      <AppScreen>
        <AppHeader
          title="Lançamentos"
          subtitle="Consulte, filtre e atualize suas movimentações."
        />

        <FormTextInput
          label="Pesquisar"
          onChangeText={setSearch}
          placeholder="Descrição, categoria ou conta"
          value={search}
        />

        <View style={styles.filters}>
          <FilterChip
            label="Todos"
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <FilterChip
            label="Despesas"
            selected={filter === 'expense'}
            onPress={() => setFilter('expense')}
          />
          <FilterChip
            label="Receitas"
            selected={filter === 'income'}
            onPress={() => setFilter('income')}
          />
        </View>

        <AppCard>
          {filteredTransactions.length === 0 ? (
            <EmptyState
              title="Nenhum resultado"
              description="Altere os filtros ou registre um novo lançamento."
            />
          ) : (
            filteredTransactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                categoryName={
                  categoryMap.get(transaction.categoryId) ?? 'Sem categoria'
                }
                accountName={
                  accountMap.get(transaction.accountId) ?? 'Conta removida'
                }
                onPress={() => openActions(transaction)}
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

      <AppDialog
        visible={deleteTransaction !== null}
        title="Excluir lançamento?"
        message={
          deleteTransaction
            ? `O lançamento “${deleteTransaction.description}” será removido definitivamente. Esta ação não pode ser desfeita.`
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
    </>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
});
