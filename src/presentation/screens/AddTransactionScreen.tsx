import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../application/store/hooks';
import type {
  RecurrenceFrequency,
  TransactionEntryMode,
  TransactionStatus,
  TransactionType,
} from '../../domain/entities/Transaction';
import { transactionsAdded } from '../../features/transactions/transactionsSlice';
import {
  brDateToIso,
  getBrDateValidationError,
  isoDateToBr,
  todayIsoDate,
} from '../../shared/utils/date';
import {
  createInstallmentTransactions,
  createOpenEndedRecurringTransactions,
  createRecurringTransactions,
  createSingleTransaction,
} from '../../shared/utils/transactionSeries';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { AppDialog } from '../components/AppDialog';
import { AppHeader } from '../components/AppHeader';
import { AppScreen } from '../components/AppScreen';
import { AppText } from '../components/AppText';
import { DateInput } from '../components/DateInput';
import { FilterChip } from '../components/FilterChip';
import { FormTextInput } from '../components/FormTextInput';
import { MoneyInput } from '../components/MoneyInput';
import { SectionTitle } from '../components/SectionTitle';

interface FeedbackDialogState {
  title: string;
  message: string;
  actionTitle?: string;
}

const frequencyLabels: Record<RecurrenceFrequency, string> = {
  weekly: 'Semanal',
  biweekly: 'Quinzenal',
  monthly: 'Mensal',
  yearly: 'Anual',
};

export function AddTransactionScreen() {
  const dispatch = useAppDispatch();
  const accountItems = useAppSelector((state) => state.accounts.items);
  const categoryItems = useAppSelector((state) => state.categories.items);

  const accounts = useMemo(
    () => accountItems.filter((account) => account.isActive),
    [accountItems],
  );

  const [entryMode, setEntryMode] = useState<TransactionEntryMode>('single');
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amountInCents, setAmountInCents] = useState(0);
  const [date, setDate] = useState(isoDateToBr(todayIsoDate()));
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [status, setStatus] = useState<TransactionStatus>('paid');
  const [notes, setNotes] = useState('');
  const [recurrenceFrequency, setRecurrenceFrequency] =
    useState<RecurrenceFrequency>('monthly');
  const [recurrenceEndMode, setRecurrenceEndMode] = useState<'unlimited' | 'limited'>(
    'unlimited',
  );
  const [occurrenceCount, setOccurrenceCount] = useState('12');
  const [totalInstallments, setTotalInstallments] = useState('10');
  const [startingInstallment, setStartingInstallment] = useState('1');
  const [feedbackDialog, setFeedbackDialog] =
    useState<FeedbackDialogState | null>(null);

  const availableCategories = useMemo(
    () =>
      categoryItems.filter(
        (category) =>
          category.isActive &&
          (category.type === type || category.type === 'both'),
      ),
    [categoryItems, type],
  );

  useEffect(() => {
    setAccountId((currentAccountId) =>
      accounts.some((account) => account.id === currentAccountId)
        ? currentAccountId
        : (accounts[0]?.id ?? ''),
    );
  }, [accounts]);

  useEffect(() => {
    setCategoryId((currentCategoryId) =>
      availableCategories.some((category) => category.id === currentCategoryId)
        ? currentCategoryId
        : (availableCategories[0]?.id ?? ''),
    );
  }, [availableCategories]);

  const changeType = (nextType: TransactionType) => {
    setType(nextType);
    setCategoryId('');
  };

  const resetForm = () => {
    const nextCategoryId = availableCategories.some(
      (category) => category.id === categoryId,
    )
      ? categoryId
      : (availableCategories[0]?.id ?? '');
    const nextAccountId = accounts.some((account) => account.id === accountId)
      ? accountId
      : (accounts[0]?.id ?? '');

    setEntryMode('single');
    setDescription('');
    setAmountInCents(0);
    setDate(isoDateToBr(todayIsoDate()));
    setCategoryId(nextCategoryId);
    setAccountId(nextAccountId);
    setStatus('paid');
    setNotes('');
    setRecurrenceFrequency('monthly');
    setRecurrenceEndMode('unlimited');
    setOccurrenceCount('12');
    setTotalInstallments('10');
    setStartingInstallment('1');
  };

  const save = () => {
    const normalizedDescription = description.trim();
    const dateValidationError = getBrDateValidationError(date);
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

    if (dateValidationError || !isoDate) {
      setFeedbackDialog({
        title: 'Data inválida',
        message: dateValidationError ?? 'Informe uma data válida.',
        actionTitle: 'Corrigir',
      });
      return;
    }

    if (!categoryId || !accountId) {
      setFeedbackDialog({
        title: 'Dados incompletos',
        message: 'Selecione uma categoria e uma conta ou carteira.',
        actionTitle: 'Corrigir',
      });
      return;
    }

    const baseInput = {
      type,
      description: normalizedDescription,
      amountInCents,
      date: isoDate,
      categoryId,
      accountId,
      status,
      notes: notes.trim() || undefined,
    };

    let generated;

    if (entryMode === 'recurring') {
      if (recurrenceEndMode === 'unlimited') {
        generated = createOpenEndedRecurringTransactions(
          baseInput,
          recurrenceFrequency,
        );
      } else {
        const count = Number(occurrenceCount);

        if (!Number.isInteger(count) || count < 2 || count > 60) {
          setFeedbackDialog({
            title: 'Quantidade inválida',
            message: 'Informe de 2 a 60 ocorrências para o lançamento recorrente.',
            actionTitle: 'Corrigir',
          });
          return;
        }

        generated = createRecurringTransactions(
          baseInput,
          recurrenceFrequency,
          count,
        );
      }
    } else if (entryMode === 'installment') {
      const total = Number(totalInstallments);
      const start = Number(startingInstallment);

      if (!Number.isInteger(total) || total < 2 || total > 120) {
        setFeedbackDialog({
          title: 'Parcelamento inválido',
          message: 'Informe um total entre 2 e 120 parcelas.',
          actionTitle: 'Corrigir',
        });
        return;
      }

      if (!Number.isInteger(start) || start < 1 || start > total) {
        setFeedbackDialog({
          title: 'Parcela inicial inválida',
          message: 'A parcela inicial deve estar entre 1 e o total do parcelamento.',
          actionTitle: 'Corrigir',
        });
        return;
      }

      generated = createInstallmentTransactions(baseInput, total, start);
    } else {
      generated = [createSingleTransaction(baseInput)];
    }

    dispatch(transactionsAdded(generated));
    resetForm();

    const message =
      entryMode === 'single'
        ? 'O lançamento foi registrado no dispositivo.'
        : entryMode === 'recurring'
          ? recurrenceEndMode === 'unlimited'
            ? `${generated.length} ocorrências iniciais foram criadas. Novas ocorrências serão geradas automaticamente ao avançar para ciclos futuros.`
            : `${generated.length} ocorrências foram criadas. Cada uma pode ser editada separadamente.`
          : `${generated.length} parcelas foram criadas a partir da parcela ${startingInstallment}/${totalInstallments}.`;

    setFeedbackDialog({
      title: 'Lançamento salvo',
      message,
      actionTitle: 'Continuar',
    });
  };

  return (
    <>
      <AppScreen>
        <AppHeader
          title="Novo lançamento"
          subtitle="Registre uma movimentação única, recorrente ou parcelada."
        />

        <AppCard>
          <SectionTitle title="Forma de lançamento" />
          <View style={styles.chips}>
            <FilterChip
              label="Único"
              selected={entryMode === 'single'}
              onPress={() => setEntryMode('single')}
            />
            <FilterChip
              label="Recorrente"
              selected={entryMode === 'recurring'}
              onPress={() => setEntryMode('recurring')}
            />
            <FilterChip
              label="Parcelado"
              selected={entryMode === 'installment'}
              onPress={() => setEntryMode('installment')}
            />
          </View>

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
            placeholder={type === 'expense' ? 'Ex.: Conta de energia' : 'Ex.: Salário'}
            value={description}
          />

          <MoneyInput
            label={entryMode === 'installment' ? 'Valor de cada parcela' : 'Valor'}
            valueInCents={amountInCents}
            onChangeValue={setAmountInCents}
          />

          <DateInput
            label={entryMode === 'installment' ? 'Data da parcela inicial' : 'Data inicial'}
            onChangeText={setDate}
            value={date}
          />

          {entryMode === 'recurring' ? (
            <>
              <SectionTitle
                title="Periodicidade"
                description="Os valores futuros podem ser alterados individualmente depois da criação."
              />
              <View style={styles.chips}>
                {(Object.keys(frequencyLabels) as RecurrenceFrequency[]).map((frequency) => (
                  <FilterChip
                    key={frequency}
                    label={frequencyLabels[frequency]}
                    selected={recurrenceFrequency === frequency}
                    onPress={() => setRecurrenceFrequency(frequency)}
                  />
                ))}
              </View>
              <SectionTitle
                title="Término da recorrência"
                description="Use sem limite para contas contínuas, como energia, aluguel ou condomínio."
              />
              <View style={styles.chips}>
                <FilterChip
                  label="Sem limite"
                  selected={recurrenceEndMode === 'unlimited'}
                  onPress={() => setRecurrenceEndMode('unlimited')}
                />
                <FilterChip
                  label="Quantidade definida"
                  selected={recurrenceEndMode === 'limited'}
                  onPress={() => setRecurrenceEndMode('limited')}
                />
              </View>
              {recurrenceEndMode === 'limited' ? (
                <FormTextInput
                  label="Quantidade de ocorrências"
                  keyboardType="number-pad"
                  maxLength={2}
                  onChangeText={(value) =>
                    setOccurrenceCount(value.replace(/\D/g, ''))
                  }
                  placeholder="12"
                  value={occurrenceCount}
                />
              ) : (
                <AppText variant="caption" color="muted" style={styles.help}>
                  O aplicativo cria as próximas 12 ocorrências e amplia a série automaticamente quando você consultar ciclos futuros.
                </AppText>
              )}
            </>
          ) : null}

          {entryMode === 'installment' ? (
            <>
              <View style={styles.twoColumns}>
                <View style={styles.column}>
                  <FormTextInput
                    label="Total de parcelas"
                    keyboardType="number-pad"
                    maxLength={3}
                    onChangeText={(value) => setTotalInstallments(value.replace(/\D/g, ''))}
                    placeholder="10"
                    value={totalInstallments}
                  />
                </View>
                <View style={styles.column}>
                  <FormTextInput
                    label="Começar na parcela"
                    keyboardType="number-pad"
                    maxLength={3}
                    onChangeText={(value) => setStartingInstallment(value.replace(/\D/g, ''))}
                    placeholder="1"
                    value={startingInstallment}
                  />
                </View>
              </View>
              <AppText variant="caption" color="muted" style={styles.help}>
                Exemplo: em uma compra de 10 vezes já na terceira parcela, informe total 10 e início 3. Serão criadas as parcelas 3/10 até 10/10.
              </AppText>
            </>
          ) : null}

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

          <SectionTitle title="Situação da primeira ocorrência" />
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
            Ocorrências futuras são criadas como pendentes e podem ter valor, data, categoria, conta e situação editados separadamente.
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
  column: {
    flex: 1,
    minWidth: 140,
  },
  help: {
    marginBottom: 16,
  },
  notes: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  twoColumns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
