import { StyleSheet, View, type ViewProps } from 'react-native';

import { useAppTheme } from '../theme/AppThemeProvider';

export function AppCard({ style, ...props }: ViewProps) {
  const { theme } = useAppTheme();

  return (
    <View
      {...props}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 16,
  },
});
