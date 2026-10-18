
const API_URL = 'http://localhost:3000/api/tasks'

export type Status = 'todo' | 'doing' | 'done'

export interface Task {
  id: number
  title: string
  status: Status
}

// Obtener todas las tareas
export async function getTasks(): Promise<Task[]> {
  const response = await fetch(API_URL, {
  credentials: 'include',
})

  if (!response.ok) {
    throw new Error('Could not load tasks')
  }

  return response.json() as Promise<Task[]>
}

// Crear una tarea
export async function createTask(title: string): Promise<Task> {
  const response = await fetch(API_URL, {
    method: 'POST',
     credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })

  if (!response.ok) {
    throw new Error('Could not create task')
  }

  return response.json() as Promise<Task>
}

// Cambiar el estado de una tarea
export async function updateTask(
  id: number,
  status: Status,
): Promise<Task> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    throw new Error('Could not update task')
  }

  return response.json() as Promise<Task>
}

// Eliminar una tarea
export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Could not delete task')
  }
}
export interface AuthUser {
  id: number
  email: string
}

// Registrar una cuenta
export async function register(
  email: string,
  password: string,
): Promise<AuthUser> {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message ?? 'Could not register')
  }

  return data as AuthUser
}

// Iniciar sesión
export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message ?? 'Could not log in')
  }

  return data as AuthUser
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch('http://localhost:3000/api/auth/me', {
    credentials: 'include',
  })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error('Could not check the current session')
  }

  return response.json() as Promise<AuthUser>
}
export async function logout(): Promise<void> {
  const response = await fetch('http://localhost:3000/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Could not log out')
  }
}