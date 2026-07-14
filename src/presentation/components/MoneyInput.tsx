import { useRef } from 'react';
import { findNodeHandle, StyleSheet, TextInput, View } from 'react-native';

import { currencyInputToCents, formatCurrencyInput } from '../../shared/utils/currency';
import { AppText } from './AppText';
import { useKeyboardScrollIntoView } from './KeyboardAwareScrollView';
import { useAppTheme } from '../theme/AppThemeProvider';

interface MoneyInputProps {
  label: string;
  valueInCents: number;
  onChangeValue: (valueInCents: number) => void;
}

export function MoneyInput({ label, valueInCents, onChangeValue }: MoneyInputProps) {
  const { theme } = useAppTheme();
  const inputRef = useRef<TextInput>(null);
  const scrollToInput = useKeyboardScrollIntoView();

  return (
    <View style={styles.container}>
      <AppText variant="caption" color="muted" style={styles.label}>
        {label}
      </AppText>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <AppText style={styles.prefix}>R$</AppText>
        <TextInput
          ref={inputRef}
          accessibilityLabel={label}
          keyboardType="numeric"
          onChangeText={(value) => onChangeValue(currencyInputToCents(value))}
          onFocus={() => scrollToInput?.(findNodeHandle(inputRef.current))}
          placeholder="0,00"
          placeholderTextColor={theme.colors.muted}
          selectionColor={theme.colors.primary}
          style={[styles.input, { color: theme.colors.text }]}
          value={valueInCents > 0 ? formatCurrencyInput(valueInCents) : ''}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    minHeight: 54,
  },
  inputContainer: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 14,
  },
  label: {
    marginBottom: 6,
  },
  prefix: {
    fontWeight: '700',
    marginRight: 8,
  },
});
