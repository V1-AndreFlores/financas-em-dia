import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../application/store/hooks';
import type { Account } from '../../domain/entities/Account';
import type { CategoryType } from '../../domain/entities/Category';
import type { AppLockMode, ThemePreference } from '../../domain/entities/Settings';
import {
  accountAdded,
  accountArchived,
  accountsReplaced,
  accountUpdated,
} from '../../features/accounts/accountsSlice';
import {
  categoriesReplaced,
  categoryAdded,
  categoryArchived,
} from '../../features/categories/categoriesSlice';
import {
  appLockModeChanged,
  financialMonthStartDayChanged,
  notificationSettingsChanged,
  settingsReplaced,
  themeChanged,
} from '../../features/settings/settingsSlice';
import { transactionsReplaced } from '../../features/transactions/transactionsSlice';
import { notificationService } from '../../infrastructure/notifications/notificationService';
import { appDataRepository } from '../../infrastructure/persistence/appDataRepository';
import { securityService } from '../../infrastructure/security/securityService';
import { createInitialSnapshot } from '../../infrastructure/seed/createInitialSnapshot';
import { createId } from '../../shared/utils/createId';
import { formatCurrency } from '../../shared/utils/currency';
import { isoDateToBr } from '../../shared/utils/date';
import { AccountFormModal } from '../components/AccountFormModal';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { AppDialog } from '../components/AppDialog';
import { AppHeader } from '../components/AppHeader';
import { AppScreen } from '../components/AppScreen';
import { AppText } from '../components/AppText';
import { FilterChip } from '../components/FilterChip';
import { FormTextInput } from '../components/FormTextInput';
import { PinSetupModal } from '../components/PinSetupModal';
import { SectionTitle } from '../components/SectionTitle';

const MODAL_TRANSITION_DELAY = 190;

interface FeedbackDialogState {
  title: string;
  message: string;
  actionTitle?: string;
}

export function SettingsScreen() {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((state) => state.accounts?.items ?? []);
  const categories = useAppSelector((state) => state.categories?.items ?? []);
  const transactions = useAppSelector((state) => state.transactions?.items ?? []);
  const settings = useAppSelector((state) => state.settings);

  const [financialDayInput, setFinancialDayInput] = useState(
    String(settings.financialMonthStartDay),
  );
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] =
    useState<Exclude<CategoryType, 'both'>>('expense');
  const [accountEditorVisible, setAccountEditorVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [pinSetupVisible, setPinSetupVisible] = useState(false);
  const [feedbackDialog, setFeedbackDialog] =
    useState<FeedbackDialogState | null>(null);
  const [resetConfirmationVisible, setResetConfirmationVisible] = useState(false);
  const feedbackTransitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (feedbackTransitionTimer.current) {
        clearTimeout(feedbackTransitionTimer.current);
      }
    },
    [],
  );

  const showFeedback = (title: string, message: string, actionTitle = 'Continuar') => {
    setFeedbackDialog({ title, message, actionTitle });
  };

  const saveFinancialDay = () => {
    const day = Number(financialDayInput);

    if (!Number.isInteger(day) || day < 1 || day > 28) {
      showFeedback('Dia inválido', 'Informe um número inteiro entre 1 e 28.', 'Corrigir');
      return;
    }

    dispatch(financialMonthStartDayChanged(day));
    showFeedback('Ciclo atualizado', `O ciclo financeiro começará no dia ${day}.`);
  };

  const saveAccount = (account: Account) => {
    if (editingAccount) {
      dispatch(accountUpdated(account));
    } else {
      dispatch(accountAdded(account));
    }

    setAccountEditorVisible(false);
    setEditingAccount(null);
    showFeedback(
      editingAccount ? 'Conta atualizada' : 'Conta adicionada',
      'O nome, o tipo e o saldo inicial foram salvos.',
    );
  };

  const addCategory = () => {
    const name = newCategoryName.trim();

    if (!name) {
      showFeedback('Nome obrigatório', 'Informe o nome da categoria.', 'Corrigir');
      return;
    }

    dispatch(
      categoryAdded({
        id: createId('category'),
        name,
        type: newCategoryType,
        isDefault: false,
        isActive: true,
        createdAt: new Date().toISOString(),
      }),
    );
    setNewCategoryName('');
  };

  const saveNotificationSettings = async (enabled: boolean) => {
    if (enabled) {
      const granted = await notificationService.requestPermission();

      if (!granted) {
        showFeedback(
          'Notificações não ativadas',
          Platform.OS === 'web'
            ? 'Os lembretes locais desta versão estão disponíveis no Android e iOS.'
            : 'A permissão foi negada. Você pode liberá-la nas configurações do aparelho.',
        );
        return;
      }
    }

    dispatch(
      notificationSettingsChanged({
        notificationsEnabled: enabled,
        notificationDaysBefore: settings.notificationDaysBefore,
        notificationHour: settings.notificationHour,
      }),
    );
  };

  const updateNotificationTiming = (daysBefore: number, hour: number) => {
    dispatch(
      notificationSettingsChanged({
        notificationsEnabled: settings.notificationsEnabled,
        notificationDaysBefore: daysBefore,
        notificationHour: hour,
      }),
    );
  };

  const enableBiometric = async () => {
    if (Platform.OS === 'web') {
      showFeedback(
        'Biometria indisponível',
        'A biometria é suportada apenas no aplicativo instalado no Android ou iOS.',
      );
      return;
    }

    if (!(await securityService.isBiometricAvailable())) {
      showFeedback(
        'Biometria não configurada',
        'Cadastre uma impressão digital ou reconhecimento facial nas configurações do aparelho.',
      );
      return;
    }

    if (!(await securityService.authenticateBiometric())) {
      showFeedback(
        'Autenticação cancelada',
        'A biometria não foi ativada porque a identidade não foi confirmada.',
      );
      return;
    }

    await securityService.clearPin();
    dispatch(appLockModeChanged('biometric'));
    showFeedback(
      'Biometria ativada',
      'O aplicativo será bloqueado ao abrir e quando retornar do segundo plano.',
    );
  };

  const disableAppLock = async () => {
    await securityService.clearPin();
    dispatch(appLockModeChanged('none'));
    showFeedback('Proteção desativada', 'O aplicativo não solicitará autenticação ao abrir.');
  };

  const savePin = async (pin: string) => {
    await securityService.setPin(pin);
    dispatch(appLockModeChanged('pin'));
    setPinSetupVisible(false);
    showFeedback(
      'PIN ativado',
      'O PIN será solicitado ao abrir ou retornar ao aplicativo.',
    );
  };

  const confirmResetAllData = async () => {
    const snapshot = createInitialSnapshot();

    dispatch(accountsReplaced(snapshot.accounts));
    dispatch(categoriesReplaced(snapshot.categories));
    dispatch(transactionsReplaced(snapshot.transactions));
    dispatch(settingsReplaced(snapshot.settings));
    setFinancialDayInput(String(snapshot.settings.financialMonthStartDay));
    setResetConfirmationVisible(false);
    await Promise.all([
      appDataRepository.save(snapshot),
      securityService.clearPin(),
      notificationService.clear(),
    ]);

    feedbackTransitionTimer.current = setTimeout(() => {
      showFeedback(
        'Dados redefinidos',
        'Os dados locais, o PIN e os lembretes foram apagados. Os cadastros padrão foram restaurados.',
      );
      feedbackTransitionTimer.current = null;
    }, MODAL_TRANSITION_DELAY);
  };

  const setTheme = (preference: ThemePreference) => {
    dispatch(themeChanged(preference));
  };

  const selectLockMode = (mode: AppLockMode) => {
    if (mode === 'none') {
      void disableAppLock();
    } else if (mode === 'biometric') {
      void enableBiometric();
    } else {
      setPinSetupVisible(true);
    }
  };

  return (
    <>
      <AppScreen>
        <AppHeader
          title="Ajustes"
          subtitle="Personalize o ciclo, lembretes, segurança e cadastros."
        />

        <SectionTitle title="Aparência" />
        <AppCard style={styles.sectionCard}>
          <View style={styles.chips}>
            {(['system', 'light', 'dark'] as ThemePreference[]).map((preference) => (
              <FilterChip
                key={preference}
                label={
                  preference === 'system'
                    ? 'Sistema'
                    : preference === 'light'
                      ? 'Claro'
                      : 'Escuro'
                }
                selected={settings.theme === preference}
                onPress={() => setTheme(preference)}
              />
            ))}
          </View>
        </AppCard>

        <SectionTitle
          title="Início do ciclo financeiro"
          description="Use um dia entre 1 e 28 para funcionar corretamente em todos os meses."
        />
        <AppCard style={styles.sectionCard}>
          <FormTextInput
            label="Dia do mês"
            keyboardType="number-pad"
            maxLength={2}
            onChangeText={(value) => setFinancialDayInput(value.replace(/\D/g, ''))}
            placeholder="1"
            value={financialDayInput}
          />
          <View style={styles.chips}>
            {[1, 5, 10, 15, 20, 25].map((day) => (
              <FilterChip
                key={day}
                label={`Dia ${day}`}
                selected={Number(financialDayInput) === day}
                onPress={() => setFinancialDayInput(String(day))}
              />
            ))}
          </View>
          <AppText variant="caption" color="muted" style={styles.explanation}>
            A navegação por ciclos permite consultar meses anteriores e futuros sem alterar esta configuração.
          </AppText>
          <AppButton title="Salvar dia do ciclo" onPress={saveFinancialDay} fullWidth />
        </AppCard>

        <SectionTitle
          title="Lembretes"
          description="Notificações locais para despesas pendentes próximas da data informada."
        />
        <AppCard style={styles.sectionCard}>
          <View style={styles.chips}>
            <FilterChip
              label="Desativados"
              selected={!settings.notificationsEnabled}
              onPress={() => void saveNotificationSettings(false)}
            />
            <FilterChip
              label="Ativados"
              selected={settings.notificationsEnabled}
              onPress={() => void saveNotificationSettings(true)}
            />
          </View>

          <AppText variant="caption" color="muted" style={styles.subLabel}>
            Avisar com antecedência
          </AppText>
          <View style={styles.chips}>
            {[0, 1, 2, 3, 5, 7].map((days) => (
              <FilterChip
                key={days}
                label={days === 0 ? 'No dia' : `${days} dia${days > 1 ? 's' : ''} antes`}
                selected={settings.notificationDaysBefore === days}
                onPress={() => updateNotificationTiming(days, settings.notificationHour)}
              />
            ))}
          </View>

          <AppText variant="caption" color="muted" style={styles.subLabel}>
            Horário
          </AppText>
          <View style={styles.chips}>
            {[8, 9, 12, 18, 20].map((hour) => (
              <FilterChip
                key={hour}
                label={`${String(hour).padStart(2, '0')}:00`}
                selected={settings.notificationHour === hour}
                onPress={() =>
                  updateNotificationTiming(settings.notificationDaysBefore, hour)
                }
              />
            ))}
          </View>
          <AppText variant="caption" color="muted">
            São agendados até 64 lembretes futuros. Alterações nos lançamentos reprogramam os avisos automaticamente.
          </AppText>
        </AppCard>

        <SectionTitle
          title="Proteção do aplicativo"
          description="A biometria ou o PIN bloqueiam a interface; os dados financeiros continuam armazenados localmente."
        />
        <AppCard style={styles.sectionCard}>
          <View style={styles.chips}>
            <FilterChip
              label="Sem bloqueio"
              selected={settings.appLockMode === 'none'}
              onPress={() => selectLockMode('none')}
            />
            <FilterChip
              label="Biometria"
              selected={settings.appLockMode === 'biometric'}
              onPress={() => selectLockMode('biometric')}
            />
            <FilterChip
              label="PIN"
              selected={settings.appLockMode === 'pin'}
              onPress={() => selectLockMode('pin')}
            />
          </View>
          {settings.appLockMode === 'pin' ? (
            <AppButton
              title="Alterar PIN"
              variant="secondary"
              onPress={() => setPinSetupVisible(true)}
              fullWidth
            />
          ) : null}
        </AppCard>

        <SectionTitle
          title="Contas e saldos iniciais"
          description="O saldo inicial entra no consolidado a partir da data definida."
        />
        <AppCard style={styles.sectionCard}>
          <AppButton
            title="Adicionar conta"
            variant="secondary"
            onPress={() => {
              setEditingAccount(null);
              setAccountEditorVisible(true);
            }}
            fullWidth
          />
          <View style={styles.list}>
            {accounts
              .filter((account) => account.isActive)
              .map((account) => (
                <View key={account.id} style={styles.listRow}>
                  <View style={styles.listContent}>
                    <AppText style={styles.listLabel}>{account.name}</AppText>
                    <AppText variant="caption" color="muted">
                      Saldo inicial {formatCurrency(account.initialBalanceInCents)} em {isoDateToBr(account.initialBalanceDate)}
                    </AppText>
                  </View>
                  <View style={styles.rowActions}>
                    <AppButton
                      title="Editar"
                      variant="ghost"
                      onPress={() => {
                        setEditingAccount(account);
                        setAccountEditorVisible(true);
                      }}
                    />
                    {!account.isDefault ? (
                      <AppButton
                        title="Arquivar"
                        variant="ghost"
                        onPress={() => dispatch(accountArchived(account.id))}
                      />
                    ) : null}
                  </View>
                </View>
              ))}
          </View>
        </AppCard>

        <SectionTitle
          title="Categorias"
          description="Categorias personalizadas ficam disponíveis nos novos lançamentos."
        />
        <AppCard style={styles.sectionCard}>
          <View style={styles.chips}>
            <FilterChip
              label="Despesa"
              selected={newCategoryType === 'expense'}
              onPress={() => setNewCategoryType('expense')}
            />
            <FilterChip
              label="Receita"
              selected={newCategoryType === 'income'}
              onPress={() => setNewCategoryType('income')}
            />
          </View>
          <FormTextInput
            label="Nova categoria"
            maxLength={50}
            onChangeText={setNewCategoryName}
            placeholder="Ex.: Pets"
            value={newCategoryName}
          />
          <AppButton
            title="Adicionar categoria"
            variant="secondary"
            onPress={addCategory}
            fullWidth
          />
          <View style={styles.list}>
            {categories
              .filter((category) => category.isActive && !category.isDefault)
              .map((category) => (
                <View key={category.id} style={styles.listRow}>
                  <View style={styles.listContent}>
                    <AppText style={styles.listLabel}>{category.name}</AppText>
                    <AppText variant="caption" color="muted">
                      {category.type === 'expense' ? 'Despesa' : 'Receita'}
                    </AppText>
                  </View>
                  <AppButton
                    title="Arquivar"
                    variant="ghost"
                    onPress={() => dispatch(categoryArchived(category.id))}
                  />
                </View>
              ))}
          </View>
        </AppCard>

        <SectionTitle title="Dados do aplicativo" />
        <AppCard style={styles.sectionCard}>
          <AppText color="muted" style={styles.explanation}>
            Esta ação apaga lançamentos, ajustes, PIN e lembretes locais, restaurando os cadastros padrão.
          </AppText>
          <AppButton
            title="Apagar todos os dados"
            variant="danger"
            onPress={() => setResetConfirmationVisible(true)}
            fullWidth
          />
        </AppCard>
      </AppScreen>

      <AccountFormModal
        visible={accountEditorVisible}
        account={editingAccount}
        onRequestClose={() => {
          setAccountEditorVisible(false);
          setEditingAccount(null);
        }}
        onSave={saveAccount}
        onValidationError={(title, message) => showFeedback(title, message, 'Corrigir')}
      />

      <PinSetupModal
        visible={pinSetupVisible}
        onRequestClose={() => setPinSetupVisible(false)}
        onSave={savePin}
        onValidationError={(title, message) => showFeedback(title, message, 'Corrigir')}
      />

      <AppDialog
        visible={resetConfirmationVisible}
        title="Apagar todos os dados?"
        message="Lançamentos, contas personalizadas, categorias, PIN, notificações e ajustes serão redefinidos. Esta ação não pode ser desfeita."
        onRequestClose={() => setResetConfirmationVisible(false)}
        actions={[
          {
            title: 'Apagar definitivamente',
            variant: 'danger',
            onPress: () => void confirmResetAllData(),
          },
          {
            title: 'Cancelar',
            variant: 'ghost',
            onPress: () => setResetConfirmationVisible(false),
          },
        ]}
      />

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
    marginBottom: 14,
  },
  explanation: {
    marginBottom: 16,
  },
  list: {
    marginTop: 16,
  },
  listContent: {
    flex: 1,
    marginRight: 8,
  },
  listLabel: {
    fontWeight: '600',
  },
  listRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 72,
    paddingVertical: 8,
  },
  rowActions: {
    alignItems: 'flex-end',
    gap: 4,
  },
  sectionCard: {
    marginBottom: 12,
  },
  subLabel: {
    marginBottom: 8,
  },
});
