import type { Task, Status } from '../services/api'

interface TaskCardProps {
  task: Task
  onMove: (id: number, status: Status) => void
  onDelete: (id: number) => void
}

function TaskCard({ task, onMove, onDelete }: TaskCardProps) {
  return (
    <article className="task-card">
      <p>{task.title}</p>

      <label htmlFor={`status-${task.id}`}>Move task</label>

      <select
        id={`status-${task.id}`}
        value={task.status}
        onChange={(event) =>
          onMove(task.id, event.target.value as Status)
        }
      >
        <option value="todo">To Do</option>
        <option value="doing">In Progress</option>
        <option value="done">Done</option>
      </select>

      <button
        className="delete-task"
        type="button"
        onClick={() => onDelete(task.id)}
      >
        Delete
      </button>
    </article>
  )
}

export default TaskCard