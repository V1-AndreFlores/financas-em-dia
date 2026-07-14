import { useRef } from 'react';
import {
  findNodeHandle,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { AppText } from './AppText';
import { useKeyboardScrollIntoView } from './KeyboardAwareScrollView';
import { useAppTheme } from '../theme/AppThemeProvider';

export interface FormTextInputProps extends TextInputProps {
  label: string;
  errorMessage?: string;
}

export function FormTextInput({
  label,
  errorMessage,
  onFocus,
  style,
  ...props
}: FormTextInputProps) {
  const { theme } = useAppTheme();
  const inputRef = useRef<TextInput>(null);
  const scrollToInput = useKeyboardScrollIntoView();

  const handleFocus: NonNullable<TextInputProps['onFocus']> = (event) => {
    scrollToInput?.(findNodeHandle(inputRef.current));
    onFocus?.(event);
  };

  return (
    <View style={styles.container}>
      <AppText variant="caption" color="muted" style={styles.label}>
        {label}
      </AppText>
      <TextInput
        ref={inputRef}
        {...props}
        onFocus={handleFocus}
        placeholderTextColor={theme.colors.muted}
        selectionColor={theme.colors.primary}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            borderColor: errorMessage ? theme.colors.expense : theme.colors.border,
            color: theme.colors.text,
          },
          style,
        ]}
      />
      {errorMessage ? (
        <AppText
          variant="caption"
          style={[styles.error, { color: theme.colors.expense }]}
        >
          {errorMessage}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  error: {
    marginTop: 6,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  label: {
    marginBottom: 6,
  },
});
