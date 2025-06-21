import { useStorage, useIndexedDB, useSQLiteDB } from 'react-omni-store';
import './App.css';
import { useEffect, useState } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface Note {
  id: number;
  content: string;
}


function App() {
  // To-do list using localStorage
  const [todos, setTodos] = useStorage<Todo[]>('todos', []);
  const [newTodo, setNewTodo] = useStorage('new-todo', ''); // Persist in-progress new todo

  // User name using sessionStorage
  const [name, setName] = useStorage('name', 'Guest', 'sessionStorage');

  // Theme preference using IndexedDB
  const [theme, setTheme] = useIndexedDB<'light' | 'dark'>('theme', 'light');

  // SQLite DB Hook
  const { loading, error, execute, saveDatabase } = useSQLiteDB();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');


  // Initialize and query SQLite DB
  useEffect(() => {
    if (!loading) {
      // Create table if it doesn't exist
      execute(`
        CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content TEXT
        );
      `);
      // Load initial notes
      refreshNotes();
    }
  }, [loading]);

  const refreshNotes = () => {
    const result = execute("SELECT * FROM notes");
    if (result && result.length > 0) {
      const loadedNotes = result[0].values.map(row => ({
        id: row[0] as number,
        content: row[1] as string,
      }));
      setNotes(loadedNotes);
    }
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    execute("INSERT INTO notes (content) VALUES (?)", [newNote]);
    setNewNote('');
    refreshNotes();
    await saveDatabase(); // Persist DB to IndexedDB
  };
  
  const removeNote = async (id: number) => {
    execute("DELETE FROM notes WHERE id = ?", [id]);
    refreshNotes();
    await saveDatabase();
  }


  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setTodos([
      ...todos,
      { id: Date.now(), text: newTodo, completed: false },
    ]);
    setNewTodo('');
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };
  
  const removeTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`app ${theme}`}>
      <h1>React Omni Store</h1>
      <p>Showcasing different browser storage solutions!</p>

      <div className="card">
        <h2>Session Greeting (sessionStorage)</h2>
        <input
          type="text"
          value={name === 'Guest' ? '' : name}
          onChange={(e) => setName(e.target.value || 'Guest')}
          placeholder="Enter your name"
        />
        <p>Hello, <strong>{name}</strong>!</p>
        <p><small>This name is stored in sessionStorage and will be forgotten when you close the tab.</small></p>
      </div>

      <div className="card">
        <h2>To-Do List (localStorage)</h2>
        <form onSubmit={addTodo}>
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="What needs to be done?"
          />
          <button type="submit">Add</button>
        </form>
        <ul>
          {todos.map((todo) => (
            <li key={todo.id} className={todo.completed ? 'completed' : ''}>
              <span onClick={() => toggleTodo(todo.id)}>{todo.text}</span>
              <button onClick={() => removeTodo(todo.id)} className="remove-btn">X</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2>Notes (SQLite via WASM)</h2>
        {loading && <p>Loading SQLite database...</p>}
        {error && <p>Error loading database: {error.message}</p>}
        {!loading && !error && (
          <>
            <form onSubmit={addNote}>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a persistent note..."
              />
              <button type="submit">Add Note</button>
            </form>
            <ul>
              {notes.map((note) => (
                <li key={note.id}>
                  <span>{note.content}</span>
                   <button onClick={() => removeNote(note.id)} className="remove-btn">X</button>
                </li>
              ))}
            </ul>
             <p><small>These notes are stored in a full SQLite database, persisted in IndexedDB.</small></p>
          </>
        )}
      </div>

      <div className="card">
        <h2>Theme Preference (IndexedDB)</h2>
        <p>Current theme: <strong>{theme}</strong></p>
        <button onClick={toggleTheme}>
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </div>

       <p className="read-the-docs">
        Each card demonstrates a different storage type from the library.
      </p>
    </div>
  );
}

export default App;
