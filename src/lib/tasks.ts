import type { Task, TaskFilter, TaskStatus } from '../types';

export const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  todo: 'doing',
  doing: 'done',
  done: 'todo',
};

export function getNextStatus(status: TaskStatus): TaskStatus {
  return NEXT_STATUS[status];
}

export function applyStatusChange(
  task: Task,
  status: TaskStatus,
  now: string,
): Task {
  return {
    ...task,
    status,
    updatedAt: now,
    completedAt:
      status === 'done' ? (task.completedAt ?? now) : null,
  };
}

export function removeTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((task) => task.id !== id);
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}

export function getTaskCounts(tasks: Task[]): Record<TaskFilter, number> {
  const counts: Record<TaskFilter, number> = {
    all: tasks.length,
    todo: 0,
    doing: 0,
    done: 0,
  };

  for (const task of tasks) {
    counts[task.status] += 1;
  }

  return counts;
}

export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  return filter === 'all'
    ? tasks
    : tasks.filter((task) => task.status === filter);
}
