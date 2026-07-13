import * as SQLite from 'expo-sqlite';

import type { AppSnapshot } from '../../domain/entities/AppSnapshot';
import type { IAppDataRepository } from '../../domain/repositories/IAppDataRepository';
import { SQLITE_DATABASE_NAME } from '../../shared/constants/storage';

interface SnapshotRow {
  json: string;
}

export class SQLiteAppDataRepository implements IAppDataRepository {
  private databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

  private async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!this.databasePromise) {
      this.databasePromise = SQLite.openDatabaseAsync(SQLITE_DATABASE_NAME);
    }

    const database = await this.databasePromise;

    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS app_snapshot (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    return database;
  }

  async load(): Promise<AppSnapshot | null> {
    const database = await this.getDatabase();
    const row = await database.getFirstAsync<SnapshotRow>(
      'SELECT json FROM app_snapshot WHERE id = 1;',
    );

    if (!row) {
      return null;
    }

    return JSON.parse(row.json) as AppSnapshot;
  }

  async save(snapshot: AppSnapshot): Promise<void> {
    const database = await this.getDatabase();

    await database.runAsync(
      `
        INSERT INTO app_snapshot (id, json, updated_at)
        VALUES (1, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          json = excluded.json,
          updated_at = excluded.updated_at;
      `,
      JSON.stringify(snapshot),
      new Date().toISOString(),
    );
  }

  async clear(): Promise<void> {
    const database = await this.getDatabase();
    await database.runAsync('DELETE FROM app_snapshot WHERE id = 1;');
  }
}
