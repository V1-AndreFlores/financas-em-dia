import { StyleSheet, View } from 'react-native';

import { useAppSelector } from '../../application/store/hooks';
import { formatCurrency } from '../../shared/utils/currency';
import {
  getFinancialPeriod,
  getFinancialPeriodReferenceDate,
  isDateInPeriod,
} from '../../shared/utils/financialPeriod';
import { AppCard } from '../components/AppCard';
import { FinancialPeriodNavigator } from '../components/FinancialPeriodNavigator';
import { AppHeader } from '../components/AppHeader';
import { AppScreen } from '../components/AppScreen';
import { AppText } from '../components/AppText';
import { EmptyState } from '../components/EmptyState';
import { SectionTitle } from '../components/SectionTitle';
import { SummaryCard } from '../components/SummaryCard';
import { TransactionRow } from '../components/TransactionRow';

export function HomeScreen() {
  const accounts = useAppSelector((state) => state.accounts?.items ?? []);
  const categories = useAppSelector((state) => state.categories?.items ?? []);
  const transactions = useAppSelector((state) => state.transactions?.items ?? []);
  const startDay = useAppSelector((state) => state.settings.financialMonthStartDay);
  const monthOffset = useAppSelector((state) => state.financialPeriod.monthOffset);

  const period = getFinancialPeriod(
    getFinancialPeriodReferenceDate(monthOffset),
    startDay,
  );
  const currentTransactions = transactions.filter((transaction) =>
    isDateInPeriod(transaction.date, period),
  );

  const paidTransactions = currentTransactions.filter(
    (transaction) => transaction.status === 'paid',
  );

  const income = paidTransactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amountInCents, 0);

  const expenses = paidTransactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amountInCents, 0);

  const pending = currentTransactions
    .filter((transaction) => transaction.status === 'pending')
    .reduce((total, transaction) => total + transaction.amountInCents, 0);

  const accountInitialBalance = accounts
    .filter(
      (account) =>
        account.isActive &&
        account.initialBalanceDate <= period.end,
    )
    .reduce((total, account) => total + account.initialBalanceInCents, 0);

  const paidThroughPeriodEnd = transactions.filter(
    (transaction) => transaction.status === 'paid' && transaction.date <= period.end,
  );
  const accumulatedIncome = paidThroughPeriodEnd
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amountInCents, 0);
  const accumulatedExpenses = paidThroughPeriodEnd
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amountInCents, 0);
  const balance = accountInitialBalance + accumulatedIncome - accumulatedExpenses;

  const recentTransactions = [...currentTransactions]
    .sort((a, b) => {
      const byDate = b.date.localeCompare(a.date);
      return byDate !== 0 ? byDate : b.createdAt.localeCompare(a.createdAt);
    })
    .slice(0, 5);

  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));
  const accountMap = new Map(accounts.map((account) => [account.id, account.name]));

  return (
    <AppScreen>
      <AppHeader
        title="Finanças em Dia"
        subtitle="Acompanhe o resultado e o saldo de cada ciclo financeiro."
      />

      <FinancialPeriodNavigator />

      <AppCard style={styles.balanceCard}>
        <AppText color="muted">Saldo consolidado ao final do ciclo</AppText>
        <AppText variant="hero" color={balance < 0 ? 'expense' : 'primary'}>
          {formatCurrency(balance)}
        </AppText>
        <AppText variant="caption" color="muted">
          Considera os saldos iniciais e todos os lançamentos efetivados até {period.end.split('-').reverse().join('/')}.
        </AppText>
      </AppCard>

      <View style={styles.summaryGrid}>
        <SummaryCard
          label="Receitas"
          value={formatCurrency(income)}
          type="income"
          icon="arrow-up-circle-outline"
        />
        <SummaryCard
          label="Despesas"
          value={formatCurrency(expenses)}
          type="expense"
          icon="arrow-down-circle-outline"
        />
        <SummaryCard
          label="Resultado do ciclo"
          value={formatCurrency(income - expenses)}
          type="balance"
          icon="analytics-outline"
        />
        <SummaryCard
          label="Pendências"
          value={formatCurrency(pending)}
          type="pending"
          icon="time-outline"
        />
      </View>

      <SectionTitle
        title="Lançamentos do ciclo"
        description="Cinco movimentações mais recentes do período selecionado."
      />

      <AppCard>
        {recentTransactions.length === 0 ? (
          <EmptyState
            title="Nenhum lançamento neste ciclo"
            description="Use a aba Adicionar ou navegue para outro ciclo financeiro."
          />
        ) : (
          recentTransactions.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              categoryName={categoryMap.get(transaction.categoryId) ?? 'Sem categoria'}
              accountName={accountMap.get(transaction.accountId) ?? 'Conta removida'}
            />
          ))
        )}
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
});
