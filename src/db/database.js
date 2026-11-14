import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { acquireBrowserDatabaseAccess } from './browserAccess';
import { migrateDatabase } from './migrations';

export const DATABASE_NAME = 'sportfinder.db';

let databaseInstance;
let initializationPromise;

export function initializeDatabase() {
  if (databaseInstance) {
    return Promise.resolve(databaseInstance);
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    let db;

    try {
      if (Platform.OS === 'web') {
        await acquireBrowserDatabaseAccess();
      }
      db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await db.execAsync('PRAGMA foreign_keys = ON');

      const foreignKeys = await db.getFirstAsync('PRAGMA foreign_keys');
      if (foreignKeys?.foreign_keys !== 1) {
        throw new Error('SQLite foreign key enforcement could not be enabled.');
      }

      await migrateDatabase(db);
      databaseInstance = db;
      return db;
    } catch (error) {
      if (db) {
        await db.closeAsync().catch(() => {});
      }
      throw error;
    } finally {
      initializationPromise = undefined;
    }
  })();

  return initializationPromise;
}
