import { StyleSheet, View } from 'react-native';
import { Ionicons, type Ionicons as IoniconsType } from '@expo/vector-icons';

import { AppCard } from './AppCard';
import { AppText } from './AppText';
import { useAppTheme } from '../theme/AppThemeProvider';

interface SummaryCardProps {
  label: string;
  value: string;
  type: 'income' | 'expense' | 'balance' | 'pending';
  icon: React.ComponentProps<typeof Ionicons>['name'];
}

export function SummaryCard({ label, value, type, icon }: SummaryCardProps) {
  const { theme } = useAppTheme();

  const colorMap = {
    income: theme.colors.income,
    expense: theme.colors.expense,
    balance: theme.colors.primary,
    pending: theme.colors.warning,
  };

  const color = colorMap[type];

  return (
    <AppCard style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <AppText variant="caption" color="muted" style={styles.label}>
        {label}
      </AppText>
      <AppText variant="subtitle" style={{ color }}>
        {value}
      </AppText>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 145,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 10,
    height: 38,
    justifyContent: 'center',
    marginBottom: 12,
    width: 38,
  },
  label: {
    marginBottom: 4,
  },
});
