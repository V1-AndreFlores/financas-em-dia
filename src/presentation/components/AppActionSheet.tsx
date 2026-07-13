import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from './AppButton';
import { AppModal } from './AppModal';
import { AppText } from './AppText';
import { useAppTheme } from '../theme/AppThemeProvider';

type ActionSheetVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export interface AppActionSheetAction {
  title: string;
  onPress: () => void;
  variant?: ActionSheetVariant;
  disabled?: boolean;
}

interface AppActionSheetProps {
  visible: boolean;
  title: string;
  description?: string;
  actions: AppActionSheetAction[];
  cancelTitle?: string;
  onRequestClose: () => void;
}

export function AppActionSheet({
  visible,
  title,
  description,
  actions,
  cancelTitle = 'Cancelar',
  onRequestClose,
}: AppActionSheetProps) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <AppModal
      visible={visible}
      presentation="bottom"
      onRequestClose={onRequestClose}
      dismissOnBackdropPress
      maxWidth={560}
      contentStyle={{
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
        paddingBottom: Math.max(insets.bottom, theme.spacing.md),
      }}
    >
      <View
        style={[
          styles.handle,
          { backgroundColor: theme.colors.border },
        ]}
      />

      <AppText variant="title" style={styles.title}>
        {title}
      </AppText>

      {description ? (
        <AppText color="muted" style={styles.description}>
          {description}
        </AppText>
      ) : null}

      <View style={styles.actions}>
        {actions.map((action) => (
          <AppButton
            key={action.title}
            title={action.title}
            variant={action.variant ?? 'secondary'}
            disabled={action.disabled}
            onPress={action.onPress}
            fullWidth
          />
        ))}
      </View>

      <View style={styles.cancelArea}>
        <AppButton
          title={cancelTitle}
          variant="ghost"
          onPress={onRequestClose}
          fullWidth
        />
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  handle: {
    alignSelf: 'center',
    borderRadius: 999,
    height: 4,
    marginBottom: 18,
    width: 46,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 22,
  },
  actions: {
    gap: 10,
  },
  cancelArea: {
    marginTop: 12,
  },
});
