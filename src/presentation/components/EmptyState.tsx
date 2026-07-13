import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from './AppText';
import { useAppTheme } from '../theme/AppThemeProvider';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  const { theme } = useAppTheme();

  return (
    <View style={styles.container}>
      <Ionicons name="wallet-outline" size={44} color={theme.colors.muted} />
      <AppText variant="subtitle" style={styles.title}>
        {title}
      </AppText>
      <AppText color="muted" style={styles.description}>
        {description}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  description: {
    marginTop: 6,
    textAlign: 'center',
  },
  title: {
    marginTop: 14,
  },
});
