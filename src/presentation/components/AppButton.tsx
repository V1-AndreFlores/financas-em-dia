import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

import { AppText } from './AppText';
import { useAppTheme } from '../theme/AppThemeProvider';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface AppButtonProps extends PressableProps {
  title: string;
  variant?: ButtonVariant;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export function AppButton({
  title,
  variant = 'primary',
  isLoading = false,
  disabled,
  fullWidth = false,
  style,
  ...props
}: AppButtonProps) {
  const { theme } = useAppTheme();

  const backgroundMap: Record<ButtonVariant, string> = {
    primary: theme.colors.primary,
    secondary: theme.colors.surfaceSecondary,
    danger: theme.colors.expense,
    ghost: 'transparent',
  };

  const borderMap: Record<ButtonVariant, string> = {
    primary: theme.colors.primary,
    secondary: theme.colors.border,
    danger: theme.colors.expense,
    ghost: theme.colors.border,
  };

  const textColor =
    variant === 'secondary' || variant === 'ghost'
      ? theme.colors.text
      : theme.colors.white;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || isLoading}
      {...props}
      style={(pressableState) => [
        styles.button,
        {
          backgroundColor: backgroundMap[variant],
          borderColor: borderMap[variant],
          opacity: disabled ? 0.45 : pressableState.pressed ? 0.82 : 1,
        },
        fullWidth && styles.fullWidth,
        typeof style === 'function' ? style(pressableState) : (style as ViewStyle),
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <AppText style={[styles.label, { color: textColor }]}>{title}</AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontWeight: '700',
  },
});
