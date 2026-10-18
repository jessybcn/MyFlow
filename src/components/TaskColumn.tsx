import type { Task, Status } from '../services/api'
import TaskCard from './TaskCard'

interface TaskColumnProps {
  title: string
  status: Status
  color: string
  tasks: Task[]
  onMove: (id: number, status: Status) => void
  onDelete: (id: number) => void
}

function TaskColumn({
  title,
  status,
  color,
  tasks,
  onMove,
  onDelete,
}: TaskColumnProps) {
  const columnTasks = tasks.filter((task) => task.status === status)

  return (
    <section className="column">
      <div className="column-heading">
        <span
          className="status-dot"
          style={{ backgroundColor: color }}
        />
        <h3>{title}</h3>
        <span className="task-count">{columnTasks.length}</span>
      </div>

      <div className="task-list">
        {columnTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onMove={onMove}
            onDelete={onDelete}
          />
        ))}

        {columnTasks.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">✳</span>
            <p>No tasks yet</p>
            <span>Your next step starts here.</span>
          </div>
        )}
      </div>
    </section>
  )
}

export default TaskColumn