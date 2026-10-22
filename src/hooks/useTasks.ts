import { useCallback, useState } from 'react';
import { createTaskId } from '../lib/id';
import { getBrowserStorage, loadTasks, saveTasks } from '../lib/storage';
import type { StorageLike } from '../lib/storage';
import {
  normalizeTaskDraft,
  validateTaskDraft,
} from '../lib/taskInput';
import { applyStatusChange, removeTask, sortTasks } from '../lib/tasks';
import type {
  Task,
  TaskDraft,
  TaskMutationResult,
  TaskStatus,
} from '../types';

export function useTasks(storage: StorageLike | null = getBrowserStorage()) {
  const [initial] = useState(() => {
    const loaded = loadTasks(storage);

    return {
      ...loaded,
      tasks: sortTasks(loaded.tasks),
    };
  });
  const [tasks, setTasks] = useState<Task[]>(initial.tasks);

  const persist = useCallback(
    (nextTasks: Task[]): TaskMutationResult => {
      const result = saveTasks(nextTasks, storage);
      setTasks(nextTasks);

      if (!result.ok) {
        return {
          ok: true,
          persisted: false,
          warning: `${result.error} 更改仅在当前会话有效，刷新后可能丢失。`,
        };
      }

      return { ok: true, persisted: true };
    },
    [storage],
  );

  const createTask = useCallback(
    (draft: TaskDraft): TaskMutationResult => {
      const errors = validateTaskDraft(draft);
      const firstError = errors.title ?? errors.description;

      if (firstError) {
        return { ok: false, error: firstError };
      }

      const normalized = normalizeTaskDraft(draft);
      const now = new Date().toISOString();
      const task: Task = {
        id: createTaskId(),
        ...normalized,
        createdAt: now,
        updatedAt: now,
        completedAt: normalized.status === 'done' ? now : null,
      };

      return persist([task, ...tasks]);
    },
    [persist, tasks],
  );

  const updateTask = useCallback(
    (id: string, draft: TaskDraft): TaskMutationResult => {
      const existing = tasks.find((task) => task.id === id);

      if (!existing) {
        return {
          ok: false,
          error: '任务不存在，可能已被删除。',
        };
      }

      const errors = validateTaskDraft(draft);
      const firstError = errors.title ?? errors.description;

      if (firstError) {
        return { ok: false, error: firstError };
      }

      const normalized = normalizeTaskDraft(draft);
      const now = new Date().toISOString();
      const completedAt =
        normalized.status === 'done'
          ? existing.status === 'done' && existing.completedAt
            ? existing.completedAt
            : now
          : null;

      const nextTasks = tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              ...normalized,
              updatedAt: now,
              completedAt,
            }
          : task,
      );

      return persist(nextTasks);
    },
    [persist, tasks],
  );

  const deleteTask = useCallback(
    (id: string): TaskMutationResult => {
      if (!tasks.some((task) => task.id === id)) {
        return {
          ok: false,
          error: '任务不存在，可能已被删除。',
        };
      }

      return persist(removeTask(tasks, id));
    },
    [persist, tasks],
  );

  const changeStatus = useCallback(
    (id: string, status: TaskStatus): TaskMutationResult => {
      const existing = tasks.find((task) => task.id === id);

      if (!existing) {
        return {
          ok: false,
          error: '任务不存在，可能已被删除。',
        };
      }

      if (existing.status === status) {
        return { ok: true, persisted: true };
      }

      const now = new Date().toISOString();
      const nextTasks = tasks.map((task) =>
        task.id === id ? applyStatusChange(task, status, now) : task,
      );

      return persist(nextTasks);
    },
    [persist, tasks],
  );

  return {
    tasks,
    loadError: initial.error,
    createTask,
    updateTask,
    deleteTask,
    changeStatus,
  };
}
