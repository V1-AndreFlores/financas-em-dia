import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppText } from './AppText';
import { useAppTheme } from '../theme/AppThemeProvider';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const { theme } = useAppTheme();

  return (
    <LinearGradient
      colors={[theme.colors.primaryStrong, theme.colors.primary]}
      style={[styles.container, { borderRadius: theme.radius.lg }]}
    >
      <AppText variant="title" style={styles.title}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    overflow: 'hidden',
    padding: 22,
  },
  title: {
    color: '#FFFFFF',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.84)',
    marginTop: 6,
  },
});
