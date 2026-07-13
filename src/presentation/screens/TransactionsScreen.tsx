import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../application/store/hooks';
import type { TransactionType } from '../../domain/entities/Transaction';
import {
  transactionDeleted,
  transactionStatusChanged,
} from '../../features/transactions/transactionsSlice';
import { AppCard } from '../components/AppCard';
import { AppHeader } from '../components/AppHeader';
import { AppScreen } from '../components/AppScreen';
import { EmptyState } from '../components/EmptyState';
import { FilterChip } from '../components/FilterChip';
import { FormTextInput } from '../components/FormTextInput';
import { TransactionRow } from '../components/TransactionRow';

type TransactionFilter = 'all' | TransactionType;

export function TransactionsScreen() {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((state) => state.accounts?.items ?? []);
  const categories = useAppSelector((state) => state.categories?.items ?? []);
  const transactions = useAppSelector((state) => state.transactions?.items ?? []);

  const [filter, setFilter] = useState<TransactionFilter>('all');
  const [search, setSearch] = useState('');

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

  const openActions = (transactionId: string, currentStatus: 'paid' | 'pending') => {
    Alert.alert('Ações do lançamento', 'Escolha uma opção.', [
      {
        text: currentStatus === 'paid' ? 'Marcar como pendente' : 'Marcar como efetivado',
        onPress: () =>
          dispatch(
            transactionStatusChanged({
              id: transactionId,
              status: currentStatus === 'paid' ? 'pending' : 'paid',
            }),
          ),
      },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () =>
          Alert.alert(
            'Excluir lançamento?',
            'Essa ação removerá definitivamente o lançamento.',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Excluir',
                style: 'destructive',
                onPress: () => dispatch(transactionDeleted(transactionId)),
              },
            ],
          ),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
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
        <FilterChip label="Todos" selected={filter === 'all'} onPress={() => setFilter('all')} />
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
              categoryName={categoryMap.get(transaction.categoryId) ?? 'Sem categoria'}
              accountName={accountMap.get(transaction.accountId) ?? 'Conta removida'}
              onPress={() => openActions(transaction.id, transaction.status)}
            />
          ))
        )}
      </AppCard>
    </AppScreen>
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
