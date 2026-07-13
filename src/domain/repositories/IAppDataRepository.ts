import type { AppSnapshot } from '../entities/AppSnapshot';

export interface IAppDataRepository {
  load(): Promise<AppSnapshot | null>;
  save(snapshot: AppSnapshot): Promise<void>;
  clear(): Promise<void>;
}
