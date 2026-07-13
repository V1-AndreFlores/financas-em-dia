import type { IAppDataRepository } from '../../domain/repositories/IAppDataRepository';
import { SQLiteAppDataRepository } from './SQLiteAppDataRepository';

export const appDataRepository: IAppDataRepository =
  new SQLiteAppDataRepository();
