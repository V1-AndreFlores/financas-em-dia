import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppNavigator } from './src/application/navigation/AppNavigator';
import { appDataRepository } from './src/infrastructure/persistence/appDataRepository';
import { notificationService } from './src/infrastructure/notifications/notificationService';
import { securityService } from './src/infrastructure/security/securityService';
import { normalizeAppSnapshot } from './src/infrastructure/seed/normalizeAppSnapshot';
import { AppText } from './src/presentation/components/AppText';
import { AppLockScreen } from './src/presentation/screens/AppLockScreen';
import { AppSplashScreen } from './src/presentation/screens/AppSplashScreen';
import { AppThemeProvider, useAppTheme } from './src/presentation/theme/AppThemeProvider';
import { store } from './src/application/store';
import { useAppDispatch, useAppSelector } from './src/application/store/hooks';
import { accountsReplaced } from './src/features/accounts/accountsSlice';
import { appHydrated, appHydrationFailed } from './src/features/app/appSlice';
import { categoriesReplaced } from './src/features/categories/categoriesSlice';
import {
  appLockModeChanged,
  settingsReplaced,
} from './src/features/settings/settingsSlice';
import { transactionsReplaced } from './src/features/transactions/transactionsSlice';

const SPLASH_DURATION_MS = 3_000;

function BootstrapContent() {
  const dispatch = useAppDispatch();
  const isHydrated = useAppSelector((state) => state.app.isHydrated);
  const hydrationError = useAppSelector((state) => state.app.hydrationError);
  const lockMode = useAppSelector((state) => state.settings.appLockMode);
  const transactions = useAppSelector((state) => state.transactions?.items ?? []);
  const settings = useAppSelector((state) => state.settings);
  const { theme, resolvedMode } = useAppTheme();
  const [hasSplashDurationElapsed, setHasSplashDurationElapsed] = useState(false);
  const [isSecurityReady, setIsSecurityReady] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const appState = useRef(AppState.currentState);

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

        try {
          await notificationService.sync(snapshot.transactions, snapshot.settings);
        } catch {
          // Falhas do serviço do sistema não interrompem o acesso aos dados financeiros.
        }
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

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    let isMounted = true;

    const prepareSecurity = async () => {
      if (lockMode === 'pin' && !(await securityService.hasPin())) {
        dispatch(appLockModeChanged('none'));

        if (isMounted) {
          setIsUnlocked(true);
          setIsSecurityReady(true);
        }
        return;
      }

      if (isMounted) {
        setIsUnlocked(lockMode === 'none');
        setIsSecurityReady(true);
      }
    };

    void prepareSecurity();

    return () => {
      isMounted = false;
    };
  }, [dispatch, isHydrated, lockMode]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasActive = appState.current === 'active';
      appState.current = nextState;

      if (wasActive && nextState !== 'active' && lockMode !== 'none') {
        setIsUnlocked(false);
      }
    });

    return () => subscription.remove();
  }, [lockMode]);

  const hasFinishedBootstrap = isHydrated || hydrationError !== null;

  if (!hasSplashDurationElapsed || !hasFinishedBootstrap || (isHydrated && !isSecurityReady)) {
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

  if (lockMode !== 'none' && !isUnlocked) {
    return (
      <>
        <StatusBar style={resolvedMode === 'dark' ? 'light' : 'dark'} />
        <AppLockScreen mode={lockMode} onUnlocked={() => setIsUnlocked(true)} />
      </>
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
