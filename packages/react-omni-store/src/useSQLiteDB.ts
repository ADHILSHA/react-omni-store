import { useState, useEffect, useRef } from 'react';
import initSqlJs, { type Database } from 'sql.js';

const DB_NAME_IN_INDEXEDDB = 'react-omni-store-sqlite.db';

// Helper to save DB to IndexedDB
async function saveDatabaseToIndexedDB(db: Database) {
  const dbFile = db.export();
  localStorage.setItem(DB_NAME_IN_INDEXEDDB, JSON.stringify(Array.from(dbFile)));
}

// Helper to load DB from IndexedDB
async function loadDatabaseFromIndexedDB(): Promise<Uint8Array | null> {
  const dbFile = localStorage.getItem(DB_NAME_IN_INDEXEDDB);
  if (dbFile) {
    return new Uint8Array(JSON.parse(dbFile));
  }
  return null;
}

export function useSQLiteDB() {
  const [db, setDb] = useState<Database | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  const initDb = async () => {
    try {
      const SQL = await initSqlJs({
        locateFile: (file) => `/${file}`,
      });
      const savedDb = await loadDatabaseFromIndexedDB();
      const database = new SQL.Database(savedDb || undefined);
      setDb(database);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initDb();
  }, []);

  const execute = (sql: string, params?: (string | number | null)[]) => {
    if (!db) {
      throw new Error("Database not initialized");
    }
    return db.exec(sql, params);
  };

  const saveDatabase = async () => {
      if(db){
        await saveDatabaseToIndexedDB(db);
      }
  }

  return { db, loading, error, execute, saveDatabase };
} 