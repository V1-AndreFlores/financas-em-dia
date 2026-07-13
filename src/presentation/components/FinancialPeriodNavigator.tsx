import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../application/store/hooks';
import {
  financialPeriodMoved,
  financialPeriodReset,
} from '../../features/financialPeriod/financialPeriodSlice';
import {
  getFinancialPeriod,
  getFinancialPeriodReferenceDate,
} from '../../shared/utils/financialPeriod';
import { AppText } from './AppText';
import { useAppTheme } from '../theme/AppThemeProvider';

export function FinancialPeriodNavigator() {
  const dispatch = useAppDispatch();
  const { theme } = useAppTheme();
  const monthOffset = useAppSelector((state) => state.financialPeriod.monthOffset);
  const startDay = useAppSelector((state) => state.settings.financialMonthStartDay);
  const period = getFinancialPeriod(
    getFinancialPeriodReferenceDate(monthOffset),
    startDay,
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Pressable
        accessibilityLabel="Ciclo anterior"
        onPress={() => dispatch(financialPeriodMoved(-1))}
        style={({ pressed }) => [styles.arrow, { opacity: pressed ? 0.55 : 1 }]}
      >
        <Ionicons name="chevron-back" size={22} color={theme.colors.primary} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar para o ciclo atual"
        onPress={() => dispatch(financialPeriodReset())}
        style={styles.labelArea}
      >
        <AppText variant="caption" color="muted">
          {monthOffset === 0 ? 'Ciclo atual' : monthOffset < 0 ? 'Ciclo anterior' : 'Ciclo futuro'}
        </AppText>
        <AppText style={styles.label}>{period.label}</AppText>
      </Pressable>

      <Pressable
        accessibilityLabel="Próximo ciclo"
        onPress={() => dispatch(financialPeriodMoved(1))}
        style={({ pressed }) => [styles.arrow, { opacity: pressed ? 0.55 : 1 }]}
      >
        <Ionicons name="chevron-forward" size={22} color={theme.colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  arrow: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  container: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  label: {
    fontWeight: '700',
    marginTop: 1,
    textAlign: 'center',
  },
  labelArea: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 6,
  },
});
