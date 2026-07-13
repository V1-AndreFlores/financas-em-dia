import { StyleSheet, View } from 'react-native';

import { AppButton } from './AppButton';
import { AppModal } from './AppModal';
import { AppText } from './AppText';
import { useAppTheme } from '../theme/AppThemeProvider';

type DialogActionVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export interface AppDialogAction {
  title: string;
  onPress: () => void;
  variant?: DialogActionVariant;
  disabled?: boolean;
}

interface AppDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  actions: AppDialogAction[];
  onRequestClose: () => void;
  dismissOnBackdropPress?: boolean;
}

export function AppDialog({
  visible,
  title,
  message,
  actions,
  onRequestClose,
  dismissOnBackdropPress = false,
}: AppDialogProps) {
  const { theme } = useAppTheme();

  return (
    <AppModal
      visible={visible}
      onRequestClose={onRequestClose}
      dismissOnBackdropPress={dismissOnBackdropPress}
      contentStyle={{ padding: theme.spacing.lg }}
    >
      <AppText variant="title" style={styles.title}>
        {title}
      </AppText>

      {message ? (
        <AppText color="muted" style={styles.message}>
          {message}
        </AppText>
      ) : null}

      <View style={styles.actions}>
        {actions.map((action) => (
          <AppButton
            key={action.title}
            title={action.title}
            variant={action.variant ?? 'primary'}
            disabled={action.disabled}
            onPress={action.onPress}
            fullWidth
          />
        ))}
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 10,
  },
  message: {
    marginBottom: 22,
  },
  actions: {
    gap: 10,
  },
});
