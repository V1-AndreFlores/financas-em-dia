import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../application/store/hooks';
import type { CategoryType } from '../../domain/entities/Category';
import type { ThemePreference } from '../../domain/entities/Settings';
import {
  accountAdded,
  accountArchived,
  accountsReplaced,
} from '../../features/accounts/accountsSlice';
import {
  categoriesReplaced,
  categoryAdded,
  categoryArchived,
} from '../../features/categories/categoriesSlice';
import {
  financialMonthStartDayChanged,
  settingsReplaced,
  themeChanged,
} from '../../features/settings/settingsSlice';
import { transactionsReplaced } from '../../features/transactions/transactionsSlice';
import { appDataRepository } from '../../infrastructure/persistence/appDataRepository';
import { createInitialSnapshot } from '../../infrastructure/seed/createInitialSnapshot';
import { createId } from '../../shared/utils/createId';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { AppHeader } from '../components/AppHeader';
import { AppScreen } from '../components/AppScreen';
import { AppText } from '../components/AppText';
import { FilterChip } from '../components/FilterChip';
import { FormTextInput } from '../components/FormTextInput';
import { SectionTitle } from '../components/SectionTitle';

export function SettingsScreen() {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((state) => state.accounts?.items ?? []);
  const categories = useAppSelector((state) => state.categories?.items ?? []);
  const settings = useAppSelector((state) => state.settings);

  const [financialDayInput, setFinancialDayInput] = useState(
    String(settings.financialMonthStartDay),
  );
  const [newAccountName, setNewAccountName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] =
    useState<Exclude<CategoryType, 'both'>>('expense');

  const saveFinancialDay = () => {
    const day = Number(financialDayInput);

    if (!Number.isInteger(day) || day < 1 || day > 28) {
      Alert.alert('Dia inválido', 'Informe um número inteiro entre 1 e 28.');
      return;
    }

    dispatch(financialMonthStartDayChanged(day));
    Alert.alert('Ciclo atualizado', `O ciclo financeiro começará no dia ${day}.`);
  };

  const addAccount = () => {
    const name = newAccountName.trim();

    if (!name) {
      Alert.alert('Nome obrigatório', 'Informe o nome da conta ou carteira.');
      return;
    }

    dispatch(
      accountAdded({
        id: createId('account'),
        name,
        type: 'digital',
        initialBalanceInCents: 0,
        isDefault: false,
        isActive: true,
        createdAt: new Date().toISOString(),
      }),
    );
    setNewAccountName('');
  };

  const addCategory = () => {
    const name = newCategoryName.trim();

    if (!name) {
      Alert.alert('Nome obrigatório', 'Informe o nome da categoria.');
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

  const resetAllData = () => {
    Alert.alert(
      'Apagar todos os dados?',
      'Lançamentos, contas personalizadas, categorias e ajustes serão redefinidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: () => {
            const snapshot = createInitialSnapshot();

            dispatch(accountsReplaced(snapshot.accounts));
            dispatch(categoriesReplaced(snapshot.categories));
            dispatch(transactionsReplaced(snapshot.transactions));
            dispatch(settingsReplaced(snapshot.settings));
            setFinancialDayInput(String(snapshot.settings.financialMonthStartDay));
            void appDataRepository.save(snapshot);
          },
        },
      ],
    );
  };

  const setTheme = (preference: ThemePreference) => {
    dispatch(themeChanged(preference));
  };

  return (
    <AppScreen>
      <AppHeader
        title="Ajustes"
        subtitle="Personalize o ciclo financeiro, aparência e cadastros."
      />

      <SectionTitle title="Aparência" />
      <AppCard style={styles.sectionCard}>
        <View style={styles.chips}>
          <FilterChip
            label="Sistema"
            selected={settings.theme === 'system'}
            onPress={() => setTheme('system')}
          />
          <FilterChip
            label="Claro"
            selected={settings.theme === 'light'}
            onPress={() => setTheme('light')}
          />
          <FilterChip
            label="Escuro"
            selected={settings.theme === 'dark'}
            onPress={() => setTheme('dark')}
          />
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
          Recomendação inicial: dia 1, equivalente ao mês-calendário. Você pode escolher um dia próximo ao recebimento principal.
        </AppText>
        <AppButton title="Salvar dia do ciclo" onPress={saveFinancialDay} fullWidth />
      </AppCard>

      <SectionTitle
        title="Contas e carteiras"
        description="Cadastre as origens e destinos dos lançamentos."
      />
      <AppCard style={styles.sectionCard}>
        <FormTextInput
          label="Nova conta"
          maxLength={60}
          onChangeText={setNewAccountName}
          placeholder="Ex.: Banco digital"
          value={newAccountName}
        />
        <AppButton title="Adicionar conta" variant="secondary" onPress={addAccount} fullWidth />
        <View style={styles.list}>
          {accounts
            .filter((account) => account.isActive)
            .map((account) => (
              <View key={account.id} style={styles.listRow}>
                <AppText style={styles.listLabel}>{account.name}</AppText>
                {!account.isDefault ? (
                  <AppButton
                    title="Arquivar"
                    variant="ghost"
                    onPress={() => dispatch(accountArchived(account.id))}
                  />
                ) : null}
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
                <View>
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
          Esta ação apaga os dados armazenados localmente e recria os cadastros padrão.
        </AppText>
        <AppButton
          title="Apagar todos os dados"
          variant="danger"
          onPress={resetAllData}
          fullWidth
        />
      </AppCard>
    </AppScreen>
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
  listLabel: {
    fontWeight: '600',
  },
  listRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
  },
  sectionCard: {
    marginBottom: 12,
  },
});
