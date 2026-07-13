import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { FinancialTransaction } from '../../domain/entities/Transaction';
import { formatCurrency } from '../../shared/utils/currency';
import { isoDateToBr } from '../../shared/utils/date';
import { getTransactionSeriesLabel } from '../../shared/utils/transactionSeries';
import { AppText } from './AppText';
import { useAppTheme } from '../theme/AppThemeProvider';

interface TransactionRowProps {
  transaction: FinancialTransaction;
  categoryName: string;
  accountName: string;
  onPress?: () => void;
}

export function TransactionRow({
  transaction,
  categoryName,
  accountName,
  onPress,
}: TransactionRowProps) {
  const { theme } = useAppTheme();
  const isExpense = transaction.type === 'expense';
  const color = isExpense ? theme.colors.expense : theme.colors.income;
  const seriesLabel = getTransactionSeriesLabel(transaction);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          borderBottomColor: theme.colors.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: `${color}18` }]}>
        <Ionicons
          name={isExpense ? 'arrow-down-outline' : 'arrow-up-outline'}
          size={20}
          color={color}
        />
      </View>

      <View style={styles.content}>
        <AppText style={styles.description} numberOfLines={1}>
          {transaction.description}
        </AppText>
        <AppText variant="caption" color="muted" numberOfLines={1}>
          {categoryName} · {accountName} · {isoDateToBr(transaction.date)}
          {seriesLabel ? ` · ${seriesLabel}` : ''}
        </AppText>
      </View>

      <View style={styles.amountContainer}>
        <AppText style={[styles.amount, { color }]}>
          {isExpense ? '-' : '+'} {formatCurrency(transaction.amountInCents)}
        </AppText>
        <AppText
          variant="caption"
          style={{
            color:
              transaction.status === 'paid'
                ? theme.colors.muted
                : theme.colors.warning,
          }}
        >
          {transaction.status === 'paid' ? 'Efetivado' : 'Pendente'}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  amount: {
    fontSize: 14,
    fontWeight: '700',
  },
  amountContainer: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  container: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingVertical: 14,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  description: {
    fontWeight: '600',
    marginBottom: 3,
  },
  icon: {
    alignItems: 'center',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});
