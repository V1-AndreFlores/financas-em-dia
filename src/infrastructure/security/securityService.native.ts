import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const PIN_KEY = 'financas-em-dia.pin.v1';

interface StoredPin {
  salt: string;
  hash: string;
}

async function hashPin(pin: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${pin}`,
  );
}

export const securityService = {
  async isBiometricAvailable(): Promise<boolean> {
    const [hasHardware, isEnrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);

    return hasHardware && isEnrolled;
  },

  async authenticateBiometric(): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Desbloquear Finanças em Dia',
      promptSubtitle: 'Confirme sua identidade para acessar seus dados financeiros.',
      cancelLabel: 'Cancelar',
      fallbackLabel: '',
      disableDeviceFallback: true,
      biometricsSecurityLevel: 'strong',
    });

    return result.success;
  },

  async setPin(pin: string): Promise<void> {
    const salt = Crypto.randomUUID();
    const hash = await hashPin(pin, salt);
    const value: StoredPin = { salt, hash };
    await SecureStore.setItemAsync(PIN_KEY, JSON.stringify(value));
  },

  async hasPin(): Promise<boolean> {
    return (await SecureStore.getItemAsync(PIN_KEY)) !== null;
  },

  async verifyPin(pin: string): Promise<boolean> {
    const value = await SecureStore.getItemAsync(PIN_KEY);

    if (!value) {
      return false;
    }

    try {
      const stored = JSON.parse(value) as StoredPin;
      return (await hashPin(pin, stored.salt)) === stored.hash;
    } catch {
      return false;
    }
  },

  async clearPin(): Promise<void> {
    await SecureStore.deleteItemAsync(PIN_KEY);
  },
};
