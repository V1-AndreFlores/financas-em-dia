import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import type { Account } from '../../domain/entities/Account';
import type { Category } from '../../domain/entities/Category';
import type {
  FinancialTransaction,
  TransactionStatus,
  TransactionType,
} from '../../domain/entities/Transaction';
import {
  brDateToIso,
  getBrDateValidationError,
  isoDateToBr,
} from '../../shared/utils/date';
import { AppButton } from './AppButton';
import { AppModal } from './AppModal';
import { AppText } from './AppText';
import { DateInput } from './DateInput';
import { FilterChip } from './FilterChip';
import { FormTextInput } from './FormTextInput';
import { MoneyInput } from './MoneyInput';
import { SectionTitle } from './SectionTitle';
import { useAppTheme } from '../theme/AppThemeProvider';

interface TransactionFormModalProps {
  visible: boolean;
  transaction: FinancialTransaction | null;
  accounts: Account[];
  categories: Category[];
  onRequestClose: () => void;
  onSave: (transaction: FinancialTransaction) => void;
  onValidationError: (title: string, message: string) => void;
}

export function TransactionFormModal({
  visible,
  transaction,
  accounts,
  categories,
  onRequestClose,
  onSave,
  onValidationError,
}: TransactionFormModalProps) {
  const { theme } = useAppTheme();
  const { height } = useWindowDimensions();
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amountInCents, setAmountInCents] = useState(0);
  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [status, setStatus] = useState<TransactionStatus>('paid');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!transaction || !visible) {
      return;
    }

    setType(transaction.type);
    setDescription(transaction.description);
    setAmountInCents(transaction.amountInCents);
    setDate(isoDateToBr(transaction.date));
    setCategoryId(transaction.categoryId);
    setAccountId(transaction.accountId);
    setStatus(transaction.status);
    setNotes(transaction.notes ?? '');
  }, [transaction, visible]);

  const availableCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.isActive &&
          (category.type === type || category.type === 'both'),
      ),
    [categories, type],
  );

  const save = () => {
    if (!transaction) {
      return;
    }

    const normalizedDescription = description.trim();
    const dateValidationError = getBrDateValidationError(date);
    const isoDate = brDateToIso(date);

    if (!normalizedDescription) {
      onValidationError('Descrição obrigatória', 'Informe uma descrição para o lançamento.');
      return;
    }

    if (amountInCents <= 0) {
      onValidationError('Valor inválido', 'Informe um valor maior que zero.');
      return;
    }

    if (dateValidationError || !isoDate) {
      onValidationError(
        'Data inválida',
        dateValidationError ?? 'Informe uma data válida.',
      );
      return;
    }

    if (!categoryId || !accountId) {
      onValidationError(
        'Dados incompletos',
        'Selecione uma categoria e uma conta ou carteira.',
      );
      return;
    }

    onSave({
      ...transaction,
      type,
      description: normalizedDescription,
      amountInCents,
      date: isoDate,
      categoryId,
      accountId,
      status,
      notes: notes.trim() || undefined,
      updatedAt: new Date().toISOString(),
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
        maxHeight: height * 0.92,
        paddingBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
      }}
    >
      <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
      <AppText variant="title" style={styles.title}>
        Editar lançamento
      </AppText>
      <AppText color="muted" style={styles.description}>
        Altere os dados desta ocorrência. Parcelas e recorrências continuam independentes.
      </AppText>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle title="Tipo" />
        <View style={styles.chips}>
          <FilterChip
            label="Despesa"
            selected={type === 'expense'}
            onPress={() => {
              setType('expense');
              setCategoryId('');
            }}
          />
          <FilterChip
            label="Receita"
            selected={type === 'income'}
            onPress={() => {
              setType('income');
              setCategoryId('');
            }}
          />
        </View>

        <FormTextInput
          label="Descrição"
          maxLength={80}
          onChangeText={setDescription}
          value={description}
        />
        <MoneyInput
          label="Valor"
          valueInCents={amountInCents}
          onChangeValue={setAmountInCents}
        />
        <DateInput label="Data" onChangeText={setDate} value={date} />

        <SectionTitle title="Categoria" />
        <View style={styles.chips}>
          {availableCategories.map((category) => (
            <FilterChip
              key={category.id}
              label={category.name}
              selected={categoryId === category.id}
              onPress={() => setCategoryId(category.id)}
            />
          ))}
        </View>

        <SectionTitle title="Conta ou carteira" />
        <View style={styles.chips}>
          {accounts
            .filter((account) => account.isActive)
            .map((account) => (
              <FilterChip
                key={account.id}
                label={account.name}
                selected={accountId === account.id}
                onPress={() => setAccountId(account.id)}
              />
            ))}
        </View>

        <SectionTitle title="Situação" />
        <View style={styles.chips}>
          <FilterChip
            label="Efetivado"
            selected={status === 'paid'}
            onPress={() => setStatus('paid')}
          />
          <FilterChip
            label="Pendente"
            selected={status === 'pending'}
            onPress={() => setStatus('pending')}
          />
        </View>

        <FormTextInput
          label="Observação (opcional)"
          maxLength={250}
          multiline
          numberOfLines={3}
          onChangeText={setNotes}
          style={styles.notes}
          value={notes}
        />

        <View style={styles.actions}>
          <AppButton title="Salvar alterações" onPress={save} fullWidth />
          <AppButton
            title="Cancelar"
            variant="ghost"
            onPress={onRequestClose}
            fullWidth
          />
        </View>
      </ScrollView>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 10,
    paddingBottom: 4,
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
  notes: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  title: {
    marginBottom: 6,
  },
});
