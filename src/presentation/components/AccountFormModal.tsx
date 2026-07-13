import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import type { Account, AccountType } from '../../domain/entities/Account';
import {
  brDateToIso,
  getBrDateValidationError,
  isoDateToBr,
  todayIsoDate,
} from '../../shared/utils/date';
import { createId } from '../../shared/utils/createId';
import { AppButton } from './AppButton';
import { AppModal } from './AppModal';
import { AppText } from './AppText';
import { DateInput } from './DateInput';
import { FilterChip } from './FilterChip';
import { FormTextInput } from './FormTextInput';
import { MoneyInput } from './MoneyInput';
import { SectionTitle } from './SectionTitle';
import { useAppTheme } from '../theme/AppThemeProvider';

interface AccountFormModalProps {
  visible: boolean;
  account: Account | null;
  onRequestClose: () => void;
  onSave: (account: Account) => void;
  onValidationError: (title: string, message: string) => void;
}

const accountTypeLabels: Record<AccountType, string> = {
  checking: 'Conta corrente',
  digital: 'Conta digital',
  cash: 'Dinheiro',
  savings: 'Poupança',
  benefit: 'Benefício',
};

export function AccountFormModal({
  visible,
  account,
  onRequestClose,
  onSave,
  onValidationError,
}: AccountFormModalProps) {
  const { theme } = useAppTheme();
  const { height } = useWindowDimensions();
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('digital');
  const [initialBalanceInCents, setInitialBalanceInCents] = useState(0);
  const [initialBalanceDate, setInitialBalanceDate] = useState(
    isoDateToBr(todayIsoDate()),
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    setName(account?.name ?? '');
    setType(account?.type ?? 'digital');
    setInitialBalanceInCents(account?.initialBalanceInCents ?? 0);
    setInitialBalanceDate(
      isoDateToBr(account?.initialBalanceDate ?? todayIsoDate()),
    );
  }, [account, visible]);

  const save = () => {
    const normalizedName = name.trim();
    const dateValidationError = getBrDateValidationError(initialBalanceDate);
    const isoDate = brDateToIso(initialBalanceDate);

    if (!normalizedName) {
      onValidationError('Nome obrigatório', 'Informe o nome da conta ou carteira.');
      return;
    }

    if (dateValidationError || !isoDate) {
      onValidationError(
        'Data inválida',
        dateValidationError ?? 'Informe uma data válida para o saldo inicial.',
      );
      return;
    }

    const now = new Date().toISOString();

    onSave({
      id: account?.id ?? createId('account'),
      name: normalizedName,
      type,
      initialBalanceInCents,
      initialBalanceDate: isoDate,
      isDefault: account?.isDefault ?? false,
      isActive: account?.isActive ?? true,
      createdAt: account?.createdAt ?? now,
      updatedAt: now,
    });
  };

  return (
    <AppModal
      visible={visible}
      presentation="bottom"
      onRequestClose={onRequestClose}
      dismissOnBackdropPress={false}
      maxWidth={620}
      contentStyle={{
        maxHeight: height * 0.9,
        paddingBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
      }}
    >
      <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
      <AppText variant="title" style={styles.title}>
        {account ? 'Editar conta' : 'Nova conta'}
      </AppText>
      <AppText color="muted" style={styles.description}>
        O saldo inicial representa o valor disponível na data informada.
      </AppText>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <FormTextInput
          label="Nome"
          maxLength={60}
          onChangeText={setName}
          placeholder="Ex.: Banco digital"
          value={name}
        />

        <SectionTitle title="Tipo" />
        <View style={styles.chips}>
          {(Object.keys(accountTypeLabels) as AccountType[]).map((accountType) => (
            <FilterChip
              key={accountType}
              label={accountTypeLabels[accountType]}
              selected={type === accountType}
              onPress={() => setType(accountType)}
            />
          ))}
        </View>

        <MoneyInput
          label="Saldo inicial"
          valueInCents={initialBalanceInCents}
          onChangeValue={setInitialBalanceInCents}
        />
        <DateInput
          label="Data do saldo inicial"
          onChangeText={setInitialBalanceDate}
          value={initialBalanceDate}
        />

        <View style={styles.actions}>
          <AppButton title="Salvar conta" onPress={save} fullWidth />
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
});
