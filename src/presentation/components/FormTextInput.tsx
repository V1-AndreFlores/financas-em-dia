import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from './AppText';
import { useAppTheme } from '../theme/AppThemeProvider';

interface FormTextInputProps extends TextInputProps {
  label: string;
}

export function FormTextInput({ label, style, ...props }: FormTextInputProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.container}>
      <AppText variant="caption" color="muted" style={styles.label}>
        {label}
      </AppText>
      <TextInput
        {...props}
        placeholderTextColor={theme.colors.muted}
        selectionColor={theme.colors.primary}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            color: theme.colors.text,
          },
          style,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
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
