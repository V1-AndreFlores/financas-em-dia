import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import type { Account } from '../../domain/entities/Account';
import type { Category } from '../../domain/entities/Category';
import type {
  TransactionStatus,
  TransactionType,
} from '../../domain/entities/Transaction';
import { brDateToIso, isoDateToBr } from '../../shared/utils/date';
import type { FinancialPeriod } from '../../shared/utils/financialPeriod';
import { AppButton } from './AppButton';
import { AppModal } from './AppModal';
import { AppText } from './AppText';
import { FilterChip } from './FilterChip';
import { FormTextInput } from './FormTextInput';
import { MoneyInput } from './MoneyInput';
import { SectionTitle } from './SectionTitle';
import { useAppTheme } from '../theme/AppThemeProvider';

export type TransactionPeriodScope = 'cycle' | 'all' | 'custom';

export interface TransactionAdvancedFilters {
  periodScope: TransactionPeriodScope;
  type: 'all' | TransactionType;
  status: 'all' | TransactionStatus;
  categoryId: string | null;
  accountId: string | null;
  minimumAmountInCents: number;
  maximumAmountInCents: number;
  customStartDate: string | null;
  customEndDate: string | null;
}

export const defaultTransactionAdvancedFilters: TransactionAdvancedFilters = {
  periodScope: 'cycle',
  type: 'all',
  status: 'all',
  categoryId: null,
  accountId: null,
  minimumAmountInCents: 0,
  maximumAmountInCents: 0,
  customStartDate: null,
  customEndDate: null,
};

interface TransactionFiltersModalProps {
  visible: boolean;
  value: TransactionAdvancedFilters;
  period: FinancialPeriod;
  accounts: Account[];
  categories: Category[];
  onApply: (filters: TransactionAdvancedFilters) => void;
  onRequestClose: () => void;
  onValidationError: (title: string, message: string) => void;
}

export function TransactionFiltersModal({
  visible,
  value,
  period,
  accounts,
  categories,
  onApply,
  onRequestClose,
  onValidationError,
}: TransactionFiltersModalProps) {
  const { theme } = useAppTheme();
  const { height } = useWindowDimensions();
  const [draft, setDraft] = useState(value);
  const [startDate, setStartDate] = useState(isoDateToBr(period.start));
  const [endDate, setEndDate] = useState(isoDateToBr(period.end));

  useEffect(() => {
    if (!visible) {
      return;
    }

    setDraft(value);
    setStartDate(isoDateToBr(value.customStartDate ?? period.start));
    setEndDate(isoDateToBr(value.customEndDate ?? period.end));
  }, [period.end, period.start, value, visible]);

  const apply = () => {
    let customStartDate: string | null = null;
    let customEndDate: string | null = null;

    if (draft.periodScope === 'custom') {
      customStartDate = brDateToIso(startDate);
      customEndDate = brDateToIso(endDate);

      if (!customStartDate || !customEndDate || customStartDate > customEndDate) {
        onValidationError(
          'Período inválido',
          'Informe datas válidas e mantenha a data inicial anterior à data final.',
        );
        return;
      }
    }

    if (
      draft.maximumAmountInCents > 0 &&
      draft.minimumAmountInCents > draft.maximumAmountInCents
    ) {
      onValidationError(
        'Faixa de valor inválida',
        'O valor mínimo não pode ser maior que o valor máximo.',
      );
      return;
    }

    onApply({ ...draft, customStartDate, customEndDate });
  };

  return (
    <AppModal
      visible={visible}
      presentation="bottom"
      onRequestClose={onRequestClose}
      dismissOnBackdropPress={false}
      maxWidth={680}
      contentStyle={{
        maxHeight: height * 0.92,
        paddingBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
      }}
    >
      <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
      <AppText variant="title" style={styles.title}>
        Filtros avançados
      </AppText>
      <AppText color="muted" style={styles.description}>
        Combine período, situação, categoria, conta e faixa de valor.
      </AppText>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <SectionTitle title="Período" />
        <View style={styles.chips}>
          <FilterChip
            label="Ciclo selecionado"
            selected={draft.periodScope === 'cycle'}
            onPress={() => setDraft((current) => ({ ...current, periodScope: 'cycle' }))}
          />
          <FilterChip
            label="Todos"
            selected={draft.periodScope === 'all'}
            onPress={() => setDraft((current) => ({ ...current, periodScope: 'all' }))}
          />
          <FilterChip
            label="Personalizado"
            selected={draft.periodScope === 'custom'}
            onPress={() => setDraft((current) => ({ ...current, periodScope: 'custom' }))}
          />
        </View>

        {draft.periodScope === 'custom' ? (
          <View style={styles.twoColumns}>
            <View style={styles.column}>
              <FormTextInput
                label="Data inicial"
                keyboardType="numeric"
                maxLength={10}
                onChangeText={setStartDate}
                value={startDate}
              />
            </View>
            <View style={styles.column}>
              <FormTextInput
                label="Data final"
                keyboardType="numeric"
                maxLength={10}
                onChangeText={setEndDate}
                value={endDate}
              />
            </View>
          </View>
        ) : null}

        <SectionTitle title="Tipo" />
        <View style={styles.chips}>
          {(['all', 'expense', 'income'] as const).map((type) => (
            <FilterChip
              key={type}
              label={type === 'all' ? 'Todos' : type === 'expense' ? 'Despesas' : 'Receitas'}
              selected={draft.type === type}
              onPress={() => setDraft((current) => ({ ...current, type }))}
            />
          ))}
        </View>

        <SectionTitle title="Situação" />
        <View style={styles.chips}>
          {(['all', 'paid', 'pending'] as const).map((status) => (
            <FilterChip
              key={status}
              label={status === 'all' ? 'Todas' : status === 'paid' ? 'Efetivados' : 'Pendentes'}
              selected={draft.status === status}
              onPress={() => setDraft((current) => ({ ...current, status }))}
            />
          ))}
        </View>

        <SectionTitle title="Categoria" />
        <View style={styles.chips}>
          <FilterChip
            label="Todas"
            selected={draft.categoryId === null}
            onPress={() => setDraft((current) => ({ ...current, categoryId: null }))}
          />
          {categories
            .filter((category) => category.isActive)
            .map((category) => (
              <FilterChip
                key={category.id}
                label={category.name}
                selected={draft.categoryId === category.id}
                onPress={() =>
                  setDraft((current) => ({ ...current, categoryId: category.id }))
                }
              />
            ))}
        </View>

        <SectionTitle title="Conta ou carteira" />
        <View style={styles.chips}>
          <FilterChip
            label="Todas"
            selected={draft.accountId === null}
            onPress={() => setDraft((current) => ({ ...current, accountId: null }))}
          />
          {accounts
            .filter((account) => account.isActive)
            .map((account) => (
              <FilterChip
                key={account.id}
                label={account.name}
                selected={draft.accountId === account.id}
                onPress={() =>
                  setDraft((current) => ({ ...current, accountId: account.id }))
                }
              />
            ))}
        </View>

        <View style={styles.twoColumns}>
          <View style={styles.column}>
            <MoneyInput
              label="Valor mínimo"
              valueInCents={draft.minimumAmountInCents}
              onChangeValue={(minimumAmountInCents) =>
                setDraft((current) => ({ ...current, minimumAmountInCents }))
              }
            />
          </View>
          <View style={styles.column}>
            <MoneyInput
              label="Valor máximo"
              valueInCents={draft.maximumAmountInCents}
              onChangeValue={(maximumAmountInCents) =>
                setDraft((current) => ({ ...current, maximumAmountInCents }))
              }
            />
          </View>
        </View>

        <View style={styles.actions}>
          <AppButton title="Aplicar filtros" onPress={apply} fullWidth />
          <AppButton
            title="Limpar filtros"
            variant="secondary"
            onPress={() => {
              setDraft(defaultTransactionAdvancedFilters);
              setStartDate(isoDateToBr(period.start));
              setEndDate(isoDateToBr(period.end));
            }}
            fullWidth
          />
          <AppButton title="Cancelar" variant="ghost" onPress={onRequestClose} fullWidth />
        </View>
      </ScrollView>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 10,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  column: {
    flex: 1,
    minWidth: 140,
  },
  description: {
    marginBottom: 18,
  },
  handle: {
    alignSelf: 'center',
    borderRadius: 999,
    height: 4,
    marginBottom: 16,
    width: 46,
  },
  title: {
    marginBottom: 6,
  },
  twoColumns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
