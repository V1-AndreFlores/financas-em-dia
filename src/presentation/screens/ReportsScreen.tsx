import { useMemo } from 'react';
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
import { useAppTheme } from '../theme/AppThemeProvider';

export function ReportsScreen() {
  const { theme } = useAppTheme();
  const categories = useAppSelector((state) => state.categories?.items ?? []);
  const transactions = useAppSelector((state) => state.transactions?.items ?? []);
  const startDay = useAppSelector((state) => state.settings.financialMonthStartDay);
  const monthOffset = useAppSelector((state) => state.financialPeriod.monthOffset);

  const period = getFinancialPeriod(
    getFinancialPeriodReferenceDate(monthOffset),
    startDay,
  );

  const report = useMemo(() => {
    const expenseTransactions = transactions.filter(
      (transaction) =>
        transaction.type === 'expense' &&
        transaction.status === 'paid' &&
        isDateInPeriod(transaction.date, period),
    );

    const totals = new Map<string, number>();

    for (const transaction of expenseTransactions) {
      totals.set(
        transaction.categoryId,
        (totals.get(transaction.categoryId) ?? 0) + transaction.amountInCents,
      );
    }

    const totalExpenses = expenseTransactions.reduce(
      (total, transaction) => total + transaction.amountInCents,
      0,
    );

    return {
      totalExpenses,
      rows: [...totals.entries()]
        .map(([categoryId, amountInCents]) => ({
          categoryId,
          categoryName:
            categories.find((category) => category.id === categoryId)?.name ??
            'Sem categoria',
          amountInCents,
          percentage: totalExpenses > 0 ? amountInCents / totalExpenses : 0,
        }))
        .sort((a, b) => b.amountInCents - a.amountInCents),
    };
  }, [categories, period, transactions]);

  return (
    <AppScreen>
      <AppHeader
        title="Relatórios"
        subtitle={`Despesas efetivadas no ciclo de ${period.label}.`}
      />

      <FinancialPeriodNavigator />

      <AppCard style={styles.totalCard}>
        <AppText color="muted">Total de despesas no ciclo</AppText>
        <AppText variant="hero" color="expense">
          {formatCurrency(report.totalExpenses)}
        </AppText>
      </AppCard>

      <SectionTitle
        title="Despesas por categoria"
        description="Participação de cada categoria no total do ciclo."
      />

      <AppCard>
        {report.rows.length === 0 ? (
          <EmptyState
            title="Sem dados para o relatório"
            description="Registre despesas efetivadas para visualizar a distribuição por categoria."
          />
        ) : (
          report.rows.map((row) => (
            <View key={row.categoryId} style={styles.row}>
              <View style={styles.rowHeader}>
                <AppText style={styles.categoryName}>{row.categoryName}</AppText>
                <AppText style={styles.amount}>
                  {formatCurrency(row.amountInCents)}
                </AppText>
              </View>
              <View
                style={[
                  styles.progressTrack,
                  { backgroundColor: theme.colors.surfaceSecondary },
                ]}
              >
                <View
                  style={[
                    styles.progressBar,
                    {
                      backgroundColor: theme.colors.expense,
                      width: `${Math.max(row.percentage * 100, 3)}%`,
                    },
                  ]}
                />
              </View>
              <AppText variant="caption" color="muted">
                {(row.percentage * 100).toLocaleString('pt-BR', {
                  maximumFractionDigits: 1,
                })}
                % do total
              </AppText>
            </View>
          ))
        )}
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  amount: {
    fontWeight: '700',
  },
  categoryName: {
    fontWeight: '600',
  },
  progressBar: {
    borderRadius: 999,
    height: '100%',
  },
  progressTrack: {
    borderRadius: 999,
    height: 9,
    marginBottom: 5,
    marginTop: 8,
    overflow: 'hidden',
  },
  row: {
    marginBottom: 18,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalCard: {
    marginBottom: 14,
  },
});
