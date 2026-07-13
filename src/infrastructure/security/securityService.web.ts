import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

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
    return false;
  },

  async authenticateBiometric(): Promise<boolean> {
    return false;
  },

  async setPin(pin: string): Promise<void> {
    const salt = Crypto.randomUUID();
    const hash = await hashPin(pin, salt);
    await AsyncStorage.setItem(PIN_KEY, JSON.stringify({ salt, hash } satisfies StoredPin));
  },

  async hasPin(): Promise<boolean> {
    return (await AsyncStorage.getItem(PIN_KEY)) !== null;
  },

  async verifyPin(pin: string): Promise<boolean> {
    const value = await AsyncStorage.getItem(PIN_KEY);

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
    await AsyncStorage.removeItem(PIN_KEY);
  },
};
