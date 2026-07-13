import type { IAppDataRepository } from '../../domain/repositories/IAppDataRepository';
import { AsyncStorageAppDataRepository } from './AsyncStorageAppDataRepository';

export const appDataRepository: IAppDataRepository =
  new AsyncStorageAppDataRepository();
