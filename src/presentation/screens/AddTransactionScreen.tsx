import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../application/store/hooks';
import type {
  TransactionStatus,
  TransactionType,
} from '../../domain/entities/Transaction';
import { transactionAdded } from '../../features/transactions/transactionsSlice';
import { createId } from '../../shared/utils/createId';
import {
  brDateToIso,
  isoDateToBr,
  todayIsoDate,
} from '../../shared/utils/date';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { AppDialog } from '../components/AppDialog';
import { AppHeader } from '../components/AppHeader';
import { AppScreen } from '../components/AppScreen';
import { AppText } from '../components/AppText';
import { FilterChip } from '../components/FilterChip';
import { FormTextInput } from '../components/FormTextInput';
import { MoneyInput } from '../components/MoneyInput';
import { SectionTitle } from '../components/SectionTitle';

interface FeedbackDialogState {
  title: string;
  message: string;
  actionTitle?: string;
}

export function AddTransactionScreen() {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((state) =>
    (state.accounts?.items ?? []).filter((account) => account.isActive),
  );
  const categories = useAppSelector((state) =>
    (state.categories?.items ?? []).filter((category) => category.isActive),
  );

  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amountInCents, setAmountInCents] = useState(0);
  const [date, setDate] = useState(isoDateToBr(todayIsoDate()));
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [status, setStatus] = useState<TransactionStatus>('paid');
  const [notes, setNotes] = useState('');
  const [feedbackDialog, setFeedbackDialog] =
    useState<FeedbackDialogState | null>(null);

  const availableCategories = useMemo(
    () =>
      categories.filter(
        (category) => category.type === type || category.type === 'both',
      ),
    [categories, type],
  );

  const changeType = (nextType: TransactionType) => {
    setType(nextType);
    setCategoryId('');
  };

  const resetForm = () => {
    setDescription('');
    setAmountInCents(0);
    setDate(isoDateToBr(todayIsoDate()));
    setCategoryId('');
    setAccountId(accounts[0]?.id ?? '');
    setStatus('paid');
    setNotes('');
  };

  const save = () => {
    const normalizedDescription = description.trim();
    const isoDate = brDateToIso(date);

    if (!normalizedDescription) {
      setFeedbackDialog({
        title: 'Descrição obrigatória',
        message: 'Informe uma descrição para o lançamento.',
        actionTitle: 'Corrigir',
      });
      return;
    }

    if (amountInCents <= 0) {
      setFeedbackDialog({
        title: 'Valor inválido',
        message: 'Informe um valor maior que zero.',
        actionTitle: 'Corrigir',
      });
      return;
    }

    if (!isoDate) {
      setFeedbackDialog({
        title: 'Data inválida',
        message: 'Use o formato dd/MM/aaaa.',
        actionTitle: 'Corrigir',
      });
      return;
    }

    if (!categoryId) {
      setFeedbackDialog({
        title: 'Categoria obrigatória',
        message: 'Selecione uma categoria.',
        actionTitle: 'Corrigir',
      });
      return;
    }

    if (!accountId) {
      setFeedbackDialog({
        title: 'Conta obrigatória',
        message: 'Selecione uma conta ou carteira.',
        actionTitle: 'Corrigir',
      });
      return;
    }

    const now = new Date().toISOString();

    dispatch(
      transactionAdded({
        id: createId('transaction'),
        type,
        description: normalizedDescription,
        amountInCents,
        date: isoDate,
        categoryId,
        accountId,
        status,
        notes: notes.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      }),
    );

    resetForm();
    setFeedbackDialog({
      title: 'Lançamento salvo',
      message: 'Os dados foram registrados no dispositivo.',
      actionTitle: 'Continuar',
    });
  };

  return (
    <>
      <AppScreen>
        <AppHeader
          title="Novo lançamento"
          subtitle="Registre uma receita ou despesa de forma rápida."
        />

        <AppCard>
          <SectionTitle title="Tipo" />
          <View style={styles.chips}>
            <FilterChip
              label="Despesa"
              selected={type === 'expense'}
              onPress={() => changeType('expense')}
            />
            <FilterChip
              label="Receita"
              selected={type === 'income'}
              onPress={() => changeType('income')}
            />
          </View>

          <FormTextInput
            label="Descrição"
            maxLength={80}
            onChangeText={setDescription}
            placeholder={type === 'expense' ? 'Ex.: Supermercado' : 'Ex.: Salário'}
            value={description}
          />

          <MoneyInput
            label="Valor"
            valueInCents={amountInCents}
            onChangeValue={setAmountInCents}
          />

          <FormTextInput
            label="Data"
            keyboardType="numeric"
            maxLength={10}
            onChangeText={setDate}
            placeholder="dd/MM/aaaa"
            value={date}
          />

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
            {accounts.map((account) => (
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
            placeholder="Informações adicionais"
            style={styles.notes}
            value={notes}
          />

          <AppText variant="caption" color="muted" style={styles.help}>
            Todos os dados ficam armazenados localmente. A sincronização em nuvem não faz parte desta versão.
          </AppText>

          <AppButton title="Salvar lançamento" onPress={save} fullWidth />
        </AppCard>
      </AppScreen>

      <AppDialog
        visible={feedbackDialog !== null}
        title={feedbackDialog?.title ?? ''}
        message={feedbackDialog?.message}
        onRequestClose={() => setFeedbackDialog(null)}
        actions={[
          {
            title: feedbackDialog?.actionTitle ?? 'Entendi',
            onPress: () => setFeedbackDialog(null),
          },
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  help: {
    marginBottom: 16,
  },
  notes: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
});
