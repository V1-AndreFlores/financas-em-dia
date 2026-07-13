import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppNavigator } from './src/application/navigation/AppNavigator';
import { appDataRepository } from './src/infrastructure/persistence/appDataRepository';
import { normalizeAppSnapshot } from './src/infrastructure/seed/normalizeAppSnapshot';
import { AppText } from './src/presentation/components/AppText';
import { AppSplashScreen } from './src/presentation/screens/AppSplashScreen';
import { AppThemeProvider, useAppTheme } from './src/presentation/theme/AppThemeProvider';
import { store } from './src/application/store';
import { useAppDispatch, useAppSelector } from './src/application/store/hooks';
import { accountsReplaced } from './src/features/accounts/accountsSlice';
import { appHydrated, appHydrationFailed } from './src/features/app/appSlice';
import { categoriesReplaced } from './src/features/categories/categoriesSlice';
import { settingsReplaced } from './src/features/settings/settingsSlice';
import { transactionsReplaced } from './src/features/transactions/transactionsSlice';

const SPLASH_DURATION_MS = 3_000;

function BootstrapContent() {
  const dispatch = useAppDispatch();
  const isHydrated = useAppSelector((state) => state.app.isHydrated);
  const hydrationError = useAppSelector((state) => state.app.hydrationError);
  const { theme, resolvedMode } = useAppTheme();
  const [hasSplashDurationElapsed, setHasSplashDurationElapsed] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setHasSplashDurationElapsed(true);
    }, SPLASH_DURATION_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      try {
        const snapshot = normalizeAppSnapshot(await appDataRepository.load());

        await appDataRepository.save(snapshot);

        if (!isMounted) {
          return;
        }

        dispatch(accountsReplaced(snapshot.accounts));
        dispatch(categoriesReplaced(snapshot.categories));
        dispatch(transactionsReplaced(snapshot.transactions));
        dispatch(settingsReplaced(snapshot.settings));
        dispatch(appHydrated());
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : 'Não foi possível carregar os dados locais.';
        dispatch(appHydrationFailed(message));
      }
    };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const hasFinishedBootstrap = isHydrated || hydrationError !== null;

  if (!hasSplashDurationElapsed || !hasFinishedBootstrap) {
    return <AppSplashScreen />;
  }

  if (!isHydrated) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <AppText variant="title" style={styles.loadingTitle}>
          Finanças em Dia
        </AppText>
        <AppText color="muted">
          {hydrationError ?? 'Preparando seus dados financeiros...'}
        </AppText>
      </View>
    );
  }

  return (
    <>
      <StatusBar style={resolvedMode === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppThemeProvider>
          <BootstrapContent />
        </AppThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  loadingTitle: {
    marginBottom: 8,
    marginTop: 20,
  },
});
