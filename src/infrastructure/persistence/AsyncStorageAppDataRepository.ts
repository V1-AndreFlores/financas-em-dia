import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppSnapshot } from '../../domain/entities/AppSnapshot';
import type { IAppDataRepository } from '../../domain/repositories/IAppDataRepository';
import { STORAGE_KEYS } from '../../shared/constants/storage';

export class AsyncStorageAppDataRepository implements IAppDataRepository {
  async load(): Promise<AppSnapshot | null> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.appSnapshot);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as AppSnapshot;
  }

  async save(snapshot: AppSnapshot): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.appSnapshot, JSON.stringify(snapshot));
  }

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.appSnapshot);
  }
}
