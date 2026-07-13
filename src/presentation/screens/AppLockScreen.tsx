import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import type { AppLockMode } from '../../domain/entities/Settings';
import { securityService } from '../../infrastructure/security/securityService';
import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { FormTextInput } from '../components/FormTextInput';
import { useAppTheme } from '../theme/AppThemeProvider';

interface AppLockScreenProps {
  mode: Exclude<AppLockMode, 'none'>;
  onUnlocked: () => void;
}

export function AppLockScreen({ mode, onUnlocked }: AppLockScreenProps) {
  const { theme } = useAppTheme();
  const [pin, setPin] = useState('');
  const [message, setMessage] = useState(
    mode === 'biometric'
      ? 'Use a biometria configurada no aparelho.'
      : 'Informe seu PIN para continuar.',
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const authenticateBiometric = async () => {
    setIsProcessing(true);
    setMessage('Aguardando autenticação do aparelho...');

    try {
      const success = await securityService.authenticateBiometric();

      if (success) {
        onUnlocked();
        return;
      }

      setMessage('Não foi possível confirmar sua identidade. Tente novamente.');
    } catch {
      setMessage('A biometria não está disponível neste momento.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (mode === 'biometric') {
      void authenticateBiometric();
    }
    // Executar apenas quando a tela de bloqueio for apresentada para este modo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const verifyPin = async () => {
    if (!/^\d{4,6}$/.test(pin)) {
      setMessage('O PIN deve possuir entre 4 e 6 números.');
      return;
    }

    setIsProcessing(true);

    try {
      if (await securityService.verifyPin(pin)) {
        setPin('');
        onUnlocked();
        return;
      }

      setPin('');
      setMessage('PIN incorreto. Verifique e tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            shadowColor: theme.colors.shadow,
          },
        ]}
      >
        <AppText variant="title" style={styles.title}>
          Finanças em Dia
        </AppText>
        <AppText color="muted" style={styles.message}>
          {message}
        </AppText>

        {mode === 'pin' ? (
          <FormTextInput
            label="PIN"
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={(value) => setPin(value.replace(/\D/g, ''))}
            onSubmitEditing={() => void verifyPin()}
            placeholder="••••"
            secureTextEntry
            value={pin}
          />
        ) : null}

        <AppButton
          title={mode === 'biometric' ? 'Usar biometria' : 'Desbloquear'}
          isLoading={isProcessing}
          onPress={() =>
            mode === 'biometric' ? void authenticateBiometric() : void verifyPin()
          }
          fullWidth
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    elevation: 10,
    maxWidth: 420,
    padding: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    width: '100%',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  message: {
    marginBottom: 22,
  },
  title: {
    marginBottom: 8,
  },
});
