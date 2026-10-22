export type TaskStatus = 'todo' | 'doing' | 'done';

export type TaskFilter = 'all' | TaskStatus;

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface TaskDraft {
  title: string;
  description: string;
  status: TaskStatus;
}

export type TaskMutationResult =
  | { ok: true; persisted: true }
  | { ok: true; persisted: false; warning: string }
  | { ok: false; error: string };
