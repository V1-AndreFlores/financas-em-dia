import { Text, type TextProps, type TextStyle } from 'react-native';

import { useAppTheme } from '../theme/AppThemeProvider';

type AppTextVariant = 'body' | 'caption' | 'subtitle' | 'title' | 'hero';
type AppTextColor = 'default' | 'muted' | 'primary' | 'income' | 'expense';

interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
  color?: AppTextColor;
}

const variantStyles: Record<AppTextVariant, TextStyle> = {
  body: {
    fontSize: 16,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  hero: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
};

export function AppText({
  variant = 'body',
  color = 'default',
  style,
  ...props
}: AppTextProps) {
  const { theme } = useAppTheme();

  const colorMap = {
    default: theme.colors.text,
    muted: theme.colors.muted,
    primary: theme.colors.primary,
    income: theme.colors.income,
    expense: theme.colors.expense,
  };

  return (
    <Text
      {...props}
      style={[variantStyles[variant], { color: colorMap[color] }, style]}
    />
  );
}
