import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask as deleteTaskFromApi,
  login,
  register,
  getCurrentUser,
  logout, 
} from "./services/api";
import type { AuthUser, Status, Task } from "./services/api";
import "./App.css";
import TaskColumn from "./components/TaskColumn";

const columns: { id: Status; title: string; color: string }[] = [
  { id: "todo", title: "To Do", color: "#8B9CF6" },
  { id: "doing", title: "In Progress", color: "#F2B66D" },
  { id: "done", title: "Done", color: "#72C6A1" },
];

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  async function handleLogout() {
  setError("");

  try {
    await logout();
    setUser(null);
    setTasks([]);
    setNewTask("");
    setPassword("");
    setEmail("");
  } catch {
    setError("Could not log out. Please try again.");
  }
}
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
   useEffect(() => {
    async function restoreSession() {
      try {
        const currentUser = await getCurrentUser();

        if (currentUser) {
          setUser(currentUser);
          const data = await getTasks();
          setTasks(data);
        }
      } catch (err) {
        console.error("Could not restore session:", err);
      } finally {
        setCheckingSession(false);
      }
    }

    void restoreSession();
  }, []);

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const authenticatedUser = isRegistering
        ? await register(email.trim(), password)
        : await login(email.trim(), password);

      setUser(authenticatedUser);
      setPassword("");

      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTask.trim();

    if (!title) return;

    setError("");

    try {
      const task = await createTask(title);
      setTasks((current) => [...current, task]);
      setNewTask("");
    } catch {
      setError("Could not create the task. Please try again.");
    }
  }

  async function moveTask(id: number, status: Status) {
    setError("");

    try {
      const updatedTask = await updateTask(id, status);
      setTasks((current) =>
        current.map((task) => (task.id === id ? updatedTask : task)),
      );
    } catch {
      setError("Could not update the task. Please try again.");
    }
  }

  async function deleteTask(id: number) {
    setError("");

    try {
      await deleteTaskFromApi(id);
      setTasks((current) => current.filter((task) => task.id !== id));
    } catch {
      setError("Could not delete the task. Please try again.");
    }
  }
if (checkingSession) {
  return <main className="app">Loading MyFlow...</main>;
}
  if (!user) {
    return (
      <main className="app auth-page">
        <header className="topbar">
          <a className="logo" href="#">
            <span className="logo-icon">✳</span>
            MyFlow
          </a>
        </header>

        <section className="dashboard auth-container">
          <div className="welcome">
            <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
            <h1>{isRegistering ? "Create your account" : "Welcome back!"}</h1>
            <p className="subtitle">
              {isRegistering
                ? "Start organizing your tasks with MyFlow."
                : "Log in to continue your flow."}
            </p>
          </div>

          <form className="task-form auth-form" onSubmit={handleAuthSubmit}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete={isRegistering ? "new-password" : "current-password"}
              minLength={8}
              required
            />

            {error && (
              <p role="alert" className="error-message">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : isRegistering
                  ? "Create account"
                  : "Log in"}
            </button>
          </form>

          <p>
            {isRegistering
              ? "Already have an account?"
              : "Don't have an account?"}{" "}
            <button
              type="button"
              className="auth-switch"
              onClick={() => {
                setIsRegistering((current) => !current);
                setError("");
              }}
            >
              {isRegistering ? "Log in" : "Create an account"}
            </button>
          </p>

          <footer className="footer">Small steps. Big progress.</footer>
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="topbar">
        <a className="logo" href="#">
          <span className="logo-icon">✳</span>
          MyFlow
        </a>
      <span className="workspace">{user.email}</span>
<button
  type="button"
  className="auth-switch"
  onClick={() => void handleLogout()}
>
  Log out
</button>
<button
  className="avatar"
  aria-label="User profile"
  title={user.email}
>
  {user.email.charAt(0).toUpperCase()}
</button>
      </header>

      <section className="dashboard">
        <div className="welcome">
          <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
          <p className="subtitle">Organize your tasks. Find your flow.</p>
        </div>

        <section className="task-form-section" aria-labelledby="add-task-title">
          <h2 id="add-task-title">Add a new task</h2>
          <form className="task-form" onSubmit={addTask}>
            <label className="sr-only" htmlFor="task-title">
              Task title
            </label>
            <input
              id="task-title"
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
              placeholder="What do you need to do?"
              maxLength={120}
            />
            <button type="submit" disabled={loading}>
              + Add task
            </button>
          </form>
        </section>

        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}

        <div className="board-heading">
          <h2>My board</h2>
          <span className="board-label">{tasks.length} tasks</span>
        </div>

        <div className="board">
          {columns.map((column) => (
            <TaskColumn
              key={column.id}
              title={column.title}
              status={column.id}
              color={column.color}
              tasks={tasks}
              onMove={(id, status) => void moveTask(id, status)}
              onDelete={(id) => void deleteTask(id)}
            />
          ))}
        </div>

        <footer className="footer">Small steps. Big progress.</footer>
      </section>
    </main>
  );
}

export default App;