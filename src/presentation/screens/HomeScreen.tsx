import { StyleSheet, View } from 'react-native';

import { useAppSelector } from '../../application/store/hooks';
import { formatCurrency } from '../../shared/utils/currency';
import { getFinancialPeriod, isDateInPeriod } from '../../shared/utils/financialPeriod';
import { AppCard } from '../components/AppCard';
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

  const period = getFinancialPeriod(new Date(), startDay);
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
    .filter((account) => account.isActive)
    .reduce((total, account) => total + account.initialBalanceInCents, 0);

  const balance = accountInitialBalance + income - expenses;

  const recentTransactions = [...transactions]
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
        subtitle={`Ciclo atual: ${period.label}`}
      />

      <AppCard style={styles.balanceCard}>
        <AppText color="muted">Saldo consolidado</AppText>
        <AppText variant="hero" color={balance < 0 ? 'expense' : 'primary'}>
          {formatCurrency(balance)}
        </AppText>
        <AppText variant="caption" color="muted">
          Considera saldos iniciais e lançamentos efetivados.
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
        title="Últimos lançamentos"
        description="Movimentações mais recentes de todas as contas."
      />

      <AppCard>
        {recentTransactions.length === 0 ? (
          <EmptyState
            title="Nenhum lançamento"
            description="Use a aba Adicionar para registrar sua primeira receita ou despesa."
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
