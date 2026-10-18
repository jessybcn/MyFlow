import { afterEach, describe, it, expect, vi } from 'vitest'
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../services/api'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('MyFlow tests', () => {
  it('should confirm that a task has a title', () => {
    const task = {
      id: 1,
      title: 'My first task',
      status: 'todo',
    }

    expect(task.title).toBe('My first task')
  })

  it('should start a new task in To Do', () => {
    const task = {
      id: 2,
      title: 'Buy groceries',
      status: 'todo',
    }

    expect(task.status).toBe('todo')
  })

  it('should load tasks from the API', async () => {
    const mockTasks = [
      {
        id: 1,
        title: 'Test MyFlow',
        status: 'todo',
      },
    ]

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTasks,

      
    })

    vi.stubGlobal('fetch', mockFetch)

    const tasks = await getTasks()

    expect(tasks).toEqual(mockTasks)
   expect(mockFetch).toHaveBeenCalledWith(
  'http://localhost:3000/api/tasks',
  {
    credentials: 'include',
  },
)
  })

   it('should throw an error when the API request fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
    })

    vi.stubGlobal('fetch', mockFetch)

    await expect(getTasks()).rejects.toThrow(
      'Could not load tasks',
    )
  })
 
  it('should create a new task through the API', async () => {
    const mockTask = {
      id: 3,
      title: 'Learn testing',
      status: 'todo',
    }

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTask,
    })

    vi.stubGlobal('fetch', mockFetch)

    const task = await createTask('Learn testing')

    expect(task).toEqual(mockTask)
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/tasks',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Learn testing' }),
        credentials: 'include',
      },
    )
  })

   it('should update a task status through the API', async () => {
    const updatedTask = {
      id: 3,
      title: 'Learn testing',
      status: 'doing',
    }

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => updatedTask,
    })

    vi.stubGlobal('fetch', mockFetch)

    const task = await updateTask(3, 'doing')

    expect(task).toEqual(updatedTask)
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/tasks/3',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'doing' }),
        credentials: 'include',
      },
    )
  })
 it('should delete a task through the API', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
    })

    vi.stubGlobal('fetch', mockFetch)

    await deleteTask(3)

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/tasks/3',
      {
        method: 'DELETE',
        credentials: 'include',
      },
    )
  })
})

