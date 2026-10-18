
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import db from './database'
import session from 'express-session'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const app = express()
const PORT = 3000
const DATA_FILE = path.join(__dirname, 'tasks.json')


app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5175'],
    credentials: true,
  }),
)
app.use(express.json())

app.use(
  session({
    secret: process.env.SESSION_SECRET ?? 'development-only-change-this-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
)
function requireLogin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  if (!req.session.userId) {
    res.status(401).json({ message: 'Please log in first' })
    return
  }

  next()
}

app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body as {
    email?: string
    password?: string
  }

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email.trim() ||
    password.length < 8 ||
    password.length > 72
  ) {
    res.status(400).json({
      message: 'Enter a valid email and a password of 8–72 characters',
    })
    return
  }

  const normalizedEmail = email.trim().toLowerCase()

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    res.status(400).json({ message: 'Enter a valid email address' })
    return
  }

  try {
    const existingUser = db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(normalizedEmail)

    if (existingUser) {
      res.status(409).json({ message: 'An account with this email already exists' })
      return
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const result = db
      .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
      .run(normalizedEmail, passwordHash)

    res.status(201).json({
      id: Number(result.lastInsertRowid),
      email: normalizedEmail,
    })
  } catch (error) {
    console.error('Registration failed:', error)
    res.status(500).json({ message: 'Could not register user' })
  }
})
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body as {
    email?: string
    password?: string
  }

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email.trim() ||
    !password
  ) {
    res.status(400).json({ message: 'Email and password are required' })
    return
  }

  try {
    const normalizedEmail = email.trim().toLowerCase()

    const user = db
      .prepare('SELECT id, email, password_hash FROM users WHERE email = ?')
      .get(normalizedEmail) as
      | { id: number; email: string; password_hash: string }
      | undefined

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      res.status(401).json({ message: 'Invalid email or password' })
      return
    }

    req.session.userId = user.id

    res.json({
      id: user.id,
      email: user.email,
    })
  } catch (error) {
    console.error('Login failed:', error)
    res.status(500).json({ message: 'Could not log in' })
  }
})
app.get('/api/auth/me', (req, res) => {
  const userId = req.session.userId

  if (typeof userId !== 'number') {
    res.status(401).json({ message: 'Not logged in' })
    return
  }

  const user = db
    .prepare('SELECT id, email FROM users WHERE id = ?')
    .get(userId) as { id: number; email: string } | undefined

  if (!user) {
    res.status(401).json({ message: 'User not found' })
    return
  }

  res.json(user)
})
app.post('/api/auth/logout', (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      res.status(500).json({ message: 'Could not log out' })
      return
    }

    res.clearCookie('connect.sid')
    res.json({ message: 'Logged out successfully' })
  })
})

type Status = 'todo' | 'doing' | 'done'

interface Task {
  id: number
  title: string
  status: Status
  user_id: number
}


function getUserId(req: express.Request): number {
  const userId = req.session.userId

  if (typeof userId !== 'number') {
    throw new Error('User is not logged in')
  }

  return userId
}

async function loadTasks(): Promise<Task[]> {
  try {
    const content = await readFile(DATA_FILE, 'utf-8')
    return JSON.parse(content) as Task[]
  } catch (error) {
    console.error('Could not read tasks.json:', error)
    throw error
  }
}

async function saveTasks(tasks: Task[]): Promise<void> {
  await writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8')
}


 // Get all tasks
app.get('/api/tasks', requireLogin, (req, res) => {
  try {
    const userId = getUserId(req)

    const tasks = db
      .prepare(
        'SELECT id, title, status, user_id FROM tasks WHERE user_id = ?',
      )
      .all(userId) as Task[]

    res.json(tasks)
  } catch (error) {
    console.error('Could not load tasks:', error)
    res.status(500).json({ message: 'Could not load tasks' })
  }
})

// Create a task
app.post('/api/tasks', requireLogin, (req, res) => {
  const { title } = req.body as { title?: string }

  if (typeof title !== 'string' || !title.trim()) {
    res.status(400).json({ message: 'Task title is required' })
    return
  }

  try {
    const userId = getUserId(req)

    const result = db
      .prepare(
        'INSERT INTO tasks (title, status, user_id) VALUES (?, ?, ?)',
      )
      .run(title.trim(), 'todo', userId)

    const newTask: Task = {
      id: Number(result.lastInsertRowid),
      title: title.trim(),
      status: 'todo',
      user_id: userId,
    }

    res.status(201).json(newTask)
  } catch (error) {
    console.error('Could not save task:', error)
    res.status(500).json({ message: 'Could not save task' })
  }
})

// Update task status
app.patch('/api/tasks/:id', requireLogin, (req, res) => {
  const id = Number(req.params.id)
  const { status } = req.body as { status?: Status }
  const validStatuses: Status[] = ['todo', 'doing', 'done']

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ message: 'Invalid task id' })
    return
  }

  if (!validStatuses.includes(status as Status)) {
    res.status(400).json({ message: 'Invalid task status' })
    return
  }

  try {
    const userId = getUserId(req)

    const result = db
      .prepare(
        'UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?',
      )
      .run(status, id, userId)

    if (result.changes === 0) {
      res.status(404).json({ message: 'Task not found' })
      return
    }

    const task = db
      .prepare(
        'SELECT id, title, status, user_id FROM tasks WHERE id = ? AND user_id = ?',
      )
      .get(id, userId) as Task

    res.json(task)
  } catch (error) {
    console.error('Could not update task:', error)
    res.status(500).json({ message: 'Could not update task' })
  }
})

// Delete a task
app.delete('/api/tasks/:id', requireLogin, (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ message: 'Invalid task id' })
    return
  }

  try {
    const userId = getUserId(req)

    const result = db
      .prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?')
      .run(id, userId)

    if (result.changes === 0) {
      res.status(404).json({ message: 'Task not found' })
      return
    }

    res.status(204).send()
  } catch (error) {
    console.error('Could not delete task:', error)
    res.status(500).json({ message: 'Could not delete task' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
