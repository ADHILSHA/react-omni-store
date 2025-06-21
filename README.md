# React Omni Store

A single React library to rule all your browser storage needs. `react-omni-store` provides a set of simple, powerful hooks to manage data in `localStorage`, `sessionStorage`, `IndexedDB`, and even a full `SQLite` database via WebAssembly.

## Features

- **Unified API**: Simple hooks for complex storage mechanisms.
- **Type-Safe**: Written in TypeScript to ensure type safety.
- **Auto-Syncing**: `useStorage` syncs across tabs automatically.
- **Persistent SQLite**: `useSQLiteDB` leverages `sql.js` (WASM) and persists your database in IndexedDB.
- **Lightweight**: Small footprint with easy-to-use hooks.

## Installation

This project is set up as a monorepo. To use the library within this project, you can install dependencies at the root level:

```bash
npm install
```

## Available Hooks

1.  [useStorage](#usestorage)
2.  [useIndexedDB](#useindexeddb)
3.  [useSQLiteDB](#usesqlitedb)

---

### `useStorage`

A hook to manage state in `localStorage` or `sessionStorage`. It works just like `useState`, but persists the value.

**API**: `useStorage(key, initialValue, storageType)`

-   `key`: The key to store the value under.
-   `initialValue`: The default value to use if none is found.
-   `storageType`: (Optional) `'localStorage'` or `'sessionStorage'`. Defaults to `'localStorage'`.

**Usage:**

```tsx
import { useStorage } from 'react-omni-store';

function MyComponent() {
  // Stored in localStorage
  const [name, setName] = useStorage('username', 'Guest');
  
  // Stored in sessionStorage
  const [sessionNotes, setSessionNotes] = useStorage('notes', '', 'sessionStorage');

  return (
    <div>
      <input 
        type="text" 
        value={name} 
        onChange={(e) => setName(e.target.value)}
      />
      <p>Hello, {name}!</p>
    </div>
  );
}
```

---

### `useIndexedDB`

A simple key-value store hook that uses the browser's `IndexedDB`. It's great for storing larger amounts of data or more complex objects.

**API**: `useIndexedDB(key, initialValue)`

**Usage:**

```tsx
import { useIndexedDB } from 'react-omni-store';

function Settings() {
  const [theme, setTheme] = useIndexedDB('theme', 'light');

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

---

### `useSQLiteDB`

A powerful hook that provides a full SQLite database in the browser, powered by `sql.js` (WASM). The database is automatically persisted to `localStorage` to survive page reloads.

**Prerequisites**: You must make the `sql-wasm.wasm` file available in your `public` folder.

**API**: `useSQLiteDB()`

**Returns**: An object with:
-   `db`: The database instance.
-   `loading`: A boolean indicating if the database is initializing.
-   `error`: Any error that occurred during initialization.
-   `execute(sql, params)`: A function to execute SQL queries.
-   `saveDatabase()`: A function to manually trigger saving the DB to `localStorage`.

**Usage:**

```tsx
import { useSQLiteDB } from 'react-omni-store';
import { useEffect, useState } from 'react';

function NotesManager() {
  const { loading, error, execute, saveDatabase } = useSQLiteDB();
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (!loading) {
      execute("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, content TEXT);");
      refreshNotes();
    }
  }, [loading]);

  const refreshNotes = () => {
    const result = execute("SELECT * FROM notes");
    if (result && result.length > 0) {
      const loadedNotes = result[0].values.map(row => ({ id: row[0], content: row[1] }));
      setNotes(loadedNotes);
    }
  };

  const addNote = async (content) => {
    execute("INSERT INTO notes (content) VALUES (?)", [content]);
    refreshNotes();
    await saveDatabase();
  };

  if (loading) return <p>Loading database...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {/* UI to add and display notes */}
    </div>
  );
}
```
