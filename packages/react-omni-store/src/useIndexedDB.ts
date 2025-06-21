import { useState, useEffect } from 'react';

// A simple key-value store using IndexedDB
const DB_NAME = 'react-omni-store-db';
const STORE_NAME = 'keyval';

interface IDBRequestWithResult<T> extends IDBRequest {
    result: T
}

function openDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
}

function get<T>(db: IDBDatabase, key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key) as IDBRequestWithResult<T>;
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
}

function set<T>(db: IDBDatabase, key: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(value, key);
        request.onsuccess = () => {
            resolve();
        };
        request.onerror = () => {
            reject(request.error);
        };
    });
}


export function useIndexedDB<T>(key: string, initialValue: T) {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    openDB().then(setDb).catch(console.error);
  }, []);

  useEffect(() => {
    if (db) {
      get<T>(db, key).then(value => {
        if (value !== undefined) {
          setStoredValue(value);
        } else {
          // If the value is not in the DB, set it with the initial value.
          set(db, key, initialValue).catch(console.error);
        }
      }).catch(console.error);
    }
  }, [db, key, initialValue]);

  const setValue = (value: T | ((val: T) => T)) => {
    if (db) {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      set(db, key, valueToStore).catch(console.error);
    }
  };

  return [storedValue, setValue] as const;
} 