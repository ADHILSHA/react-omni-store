import { useStorage, useIndexedDB } from 'react-omni-store';
import './App.css';

function App() {
  const [count, setCount] = useStorage('count', 0);
  const [name, setName] = useStorage('name', 'Guest', 'sessionStorage');
  const [indexedDBCount, setIndexedDBCount] = useIndexedDB('indexedDBCount', 0);

  return (
    <>
      <h1>Vite + React + react-omni-store</h1>
      <div className="card">
        <button onClick={() => setCount((count: number) => count + 1)}>
          count is {count}
        </button>
        <p>This count is stored in localStorage.</p>
      </div>

      <div className="card">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <p>Hello, {name}.</p>
        <p>This name is stored in sessionStorage.</p>
      </div>

      <div className="card">
        <button onClick={() => setIndexedDBCount((count: number) => count + 1)}>
          IndexedDB count is {indexedDBCount}
        </button>
        <p>This count is stored in IndexedDB.</p>
        <p>
          Note: IndexedDB is asynchronous, so the value might take a moment to
          load.
        </p>
      </div>

      <p className="read-the-docs">
        Check your browser's dev tools to see the values in localStorage,
        sessionStorage, and IndexedDB.
      </p>
    </>
  );
}

export default App;
