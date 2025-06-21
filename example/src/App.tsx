import { useStorage, useIndexedDB } from 'react-omni-store';
import './App.css';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

function App() {
  // To-do list using localStorage
  const [todos, setTodos] = useStorage<Todo[]>('todos', []);
  const [newTodo, setNewTodo] = useStorage('new-todo', ''); // Persist in-progress new todo

  // User name using sessionStorage
  const [name, setName] = useStorage('name', 'Guest', 'sessionStorage');

  // Theme preference using IndexedDB
  const [theme, setTheme] = useIndexedDB<'light' | 'dark'>('theme', 'light');

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
      <p>A better example: A To-Do List!</p>

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
        <h2>Theme Preference (IndexedDB)</h2>
        <p>Current theme: <strong>{theme}</strong></p>
        <button onClick={toggleTheme}>
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </div>

       <p className="read-the-docs">
        The greeting is in sessionStorage, todos are in localStorage, and the theme is in IndexedDB.
      </p>
    </div>
  );
}

export default App;
