import type { Task, TaskFilter } from '../types';
import { EmptyState } from './EmptyState';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  filter: TaskFilter;
  readOnly?: boolean;
  onStatusChange?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export function TaskList({
  tasks,
  filter,
  readOnly = false,
  onStatusChange,
  onEdit,
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    return <EmptyState filter={filter} />;
  }

  return (
    <ul className="task-list" aria-label="任务列表">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          readOnly={readOnly}
          onStatusChange={onStatusChange}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
