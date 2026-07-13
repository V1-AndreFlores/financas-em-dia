import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react';
import { useColorScheme } from 'react-native';

import { useAppSelector } from '../../application/store/hooks';
import { darkColors, lightColors } from './colors';

export type ResolvedThemeMode = 'light' | 'dark';

export interface AppTheme {
  colors: typeof lightColors | typeof darkColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
  };
}

interface AppThemeContextValue {
  theme: AppTheme;
  resolvedMode: ResolvedThemeMode;
}

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemMode = useColorScheme();
  const preference = useAppSelector((state) => state.settings.theme);

  const resolvedMode: ResolvedThemeMode =
    preference === 'system' ? (systemMode === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo<AppThemeContextValue>(
    () => ({
      resolvedMode,
      theme: {
        colors: resolvedMode === 'dark' ? darkColors : lightColors,
        spacing: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32,
        },
        radius: {
          sm: 8,
          md: 14,
          lg: 20,
        },
      },
    }),
    [resolvedMode],
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme(): AppThemeContextValue {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error('useAppTheme deve ser usado dentro de AppThemeProvider.');
  }

  return context;
}
