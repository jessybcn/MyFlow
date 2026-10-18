import { readFile } from 'node:fs/promises'
import path from 'node:path'
import db from './database'

type Status = 'todo' | 'doing' | 'done'

interface OldTask {
  id: number
  title: string
  status: Status
}

async function migrateTasks() {
  const user = db
    .prepare('SELECT id FROM users WHERE email = ?')
    .get('prueba@example.com') as { id: number } | undefined

  if (!user) {
    throw new Error('User prueba@example.com was not found')
  }

  const filePath = path.join(__dirname, 'tasks.json')
  const content = await readFile(filePath, 'utf-8')
  const tasks = JSON.parse(content) as OldTask[]

  const insertTask = db.prepare(`
    INSERT OR IGNORE INTO tasks (id, title, status, user_id)
    VALUES (?, ?, ?, ?)
  `)

  const migrate = db.transaction(() => {
    for (const task of tasks) {
      if (!['todo', 'doing', 'done'].includes(task.status)) {
        throw new Error(`Invalid status for task ${task.id}`)
      }

      insertTask.run(
        task.id,
        task.title,
        task.status,
        user.id,
      )
    }
  })

  migrate()

  console.log(`Migration finished. Processed ${tasks.length} tasks.`)
}

migrateTasks()
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exitCode = 1
  })