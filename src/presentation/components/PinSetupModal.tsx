import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from './AppButton';
import { AppModal } from './AppModal';
import { AppText } from './AppText';
import { FormTextInput } from './FormTextInput';
import { useAppTheme } from '../theme/AppThemeProvider';

interface PinSetupModalProps {
  visible: boolean;
  onRequestClose: () => void;
  onSave: (pin: string) => Promise<void>;
  onValidationError: (title: string, message: string) => void;
}

export function PinSetupModal({
  visible,
  onRequestClose,
  onSave,
  onValidationError,
}: PinSetupModalProps) {
  const { theme } = useAppTheme();
  const [pin, setPin] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setPin('');
      setConfirmation('');
    }
  }, [visible]);

  const save = async () => {
    if (!/^\d{4,6}$/.test(pin)) {
      onValidationError(
        'PIN inválido',
        'O PIN deve possuir entre 4 e 6 números.',
      );
      return;
    }

    if (pin !== confirmation) {
      onValidationError(
        'Confirmação diferente',
        'Os dois campos de PIN devem ser iguais.',
      );
      return;
    }

    setIsSaving(true);

    try {
      await onSave(pin);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppModal
      visible={visible}
      onRequestClose={onRequestClose}
      dismissOnBackdropPress={false}
      contentStyle={{ padding: theme.spacing.lg }}
    >
      <AppText variant="title" style={styles.title}>
        Configurar PIN
      </AppText>
      <AppText color="muted" style={styles.description}>
        Use de 4 a 6 números. O PIN será solicitado ao abrir ou retornar ao aplicativo.
      </AppText>

      <FormTextInput
        label="Novo PIN"
        keyboardType="number-pad"
        maxLength={6}
        onChangeText={(value) => setPin(value.replace(/\D/g, ''))}
        placeholder="••••"
        secureTextEntry
        value={pin}
      />
      <FormTextInput
        label="Confirmar PIN"
        keyboardType="number-pad"
        maxLength={6}
        onChangeText={(value) => setConfirmation(value.replace(/\D/g, ''))}
        onSubmitEditing={() => void save()}
        placeholder="••••"
        secureTextEntry
        value={confirmation}
      />

      <View style={styles.actions}>
        <AppButton
          title="Ativar PIN"
          isLoading={isSaving}
          onPress={() => void save()}
          fullWidth
        />
        <AppButton
          title="Cancelar"
          variant="ghost"
          onPress={onRequestClose}
          fullWidth
        />
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 10,
  },
  description: {
    marginBottom: 18,
  },
  title: {
    marginBottom: 8,
  },
});
