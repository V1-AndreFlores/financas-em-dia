import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Category, CategoryType } from '../../domain/entities/Category';
import { createId } from '../../shared/utils/createId';
import { AppButton } from './AppButton';
import { AppModal } from './AppModal';
import { AppText } from './AppText';
import { FilterChip } from './FilterChip';
import { FormTextInput } from './FormTextInput';
import { KeyboardAwareScrollView } from './KeyboardAwareScrollView';
import { SectionTitle } from './SectionTitle';
import { useAppTheme } from '../theme/AppThemeProvider';

interface CategoryFormModalProps {
  visible: boolean;
  category: Category | null;
  onRequestClose: () => void;
  onSave: (category: Category) => void;
  onValidationError: (title: string, message: string) => void;
}

export function CategoryFormModal({
  visible,
  category,
  onRequestClose,
  onSave,
  onValidationError,
}: CategoryFormModalProps) {
  const { theme } = useAppTheme();
  const [name, setName] = useState('');
  const [type, setType] = useState<Exclude<CategoryType, 'both'>>('expense');
  const isFallbackCategory = category?.id === 'category-other';

  useEffect(() => {
    if (!visible) {
      return;
    }

    setName(category?.name ?? '');
    setType(category?.type === 'income' ? 'income' : 'expense');
  }, [category, visible]);

  const save = () => {
    const normalizedName = name.trim();

    if (!normalizedName) {
      onValidationError('Nome obrigatório', 'Informe o nome da categoria.');
      return;
    }

    onSave({
      id: category?.id ?? createId('category'),
      name: normalizedName,
      type: isFallbackCategory ? 'both' : type,
      isDefault: category?.isDefault ?? false,
      isActive: category?.isActive ?? true,
      createdAt: category?.createdAt ?? new Date().toISOString(),
    });
  };

  return (
    <AppModal
      visible={visible}
      presentation="bottom"
      onRequestClose={onRequestClose}
      dismissOnBackdropPress={false}
      maxWidth={560}
      contentStyle={{
        maxHeight: '86%',
        paddingBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
      }}
    >
      <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
      <AppText variant="title" style={styles.title}>
        {category ? 'Editar categoria' : 'Nova categoria'}
      </AppText>
      <AppText color="muted" style={styles.description}>
        {isFallbackCategory
          ? 'Esta é a categoria de segurança usada quando outra categoria é excluída.'
          : 'Defina o nome e o tipo de lançamento em que ela ficará disponível.'}
      </AppText>

      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <FormTextInput
          label="Nome"
          maxLength={50}
          onChangeText={setName}
          placeholder="Ex.: Pets"
          value={name}
        />

        {!isFallbackCategory ? (
          <>
            <SectionTitle title="Tipo" />
            <View style={styles.chips}>
              <FilterChip
                label="Despesa"
                selected={type === 'expense'}
                onPress={() => setType('expense')}
              />
              <FilterChip
                label="Receita"
                selected={type === 'income'}
                onPress={() => setType('income')}
              />
            </View>
          </>
        ) : (
          <AppText variant="caption" color="muted" style={styles.fallbackNotice}>
            O tipo “Despesa e receita” é mantido para garantir a realocação segura dos lançamentos.
          </AppText>
        )}

        <View style={styles.actions}>
          <AppButton title="Salvar categoria" onPress={save} fullWidth />
          <AppButton
            title="Cancelar"
            variant="ghost"
            onPress={onRequestClose}
            fullWidth
          />
        </View>
      </KeyboardAwareScrollView>
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
  fallbackNotice: {
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
