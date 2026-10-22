import type { Task } from '../types';

export const STORAGE_KEY = 'personal-task-board.v1';
export const BOARD_VERSION = 1;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface LoadTasksResult {
  tasks: Task[];
  error: string | null;
}

export type SaveTasksResult =
  | { ok: true }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isTaskStatus(value: unknown): value is Task['status'] {
  return value === 'todo' || value === 'doing' || value === 'done';
}

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function isTask(value: unknown): value is Task {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    typeof value.title === 'string' &&
    value.title.trim().length > 0 &&
    typeof value.description === 'string' &&
    isTaskStatus(value.status) &&
    isIsoTimestamp(value.createdAt) &&
    isIsoTimestamp(value.updatedAt) &&
    (value.completedAt === null || isIsoTimestamp(value.completedAt))
  );
}

function storageErrorMessage(error: unknown): string {
  if (
    isRecord(error) &&
    (error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  ) {
    return '浏览器本地存储空间已满，任务未能保存。';
  }

  return '浏览器本地存储不可用，任务未能保存。';
}

export function loadTasks(storage: StorageLike | null): LoadTasksResult {
  if (!storage) {
    return {
      tasks: [],
      error: '浏览器本地存储不可用，任务将无法保存。',
    };
  }

  let raw: string | null;

  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return {
      tasks: [],
      error: '读取本地任务失败，请检查浏览器的站点存储权限。',
    };
  }

  if (raw === null) {
    return { tasks: [], error: null };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      tasks: [],
      error: '本地任务数据无法解析，已从空看板开始。',
    };
  }

  if (
    !isRecord(parsed) ||
    parsed.version !== BOARD_VERSION ||
    !Array.isArray(parsed.tasks)
  ) {
    return {
      tasks: [],
      error: '本地任务数据版本或结构不受支持，已从空看板开始。',
    };
  }

  const tasks = parsed.tasks.filter(isTask);
  const droppedCount = parsed.tasks.length - tasks.length;

  return {
    tasks,
    error:
      droppedCount > 0
        ? `有 ${droppedCount} 条本地任务数据无法读取，已跳过。`
        : null,
  };
}

export function saveTasks(
  tasks: Task[],
  storage: StorageLike | null,
): SaveTasksResult {
  if (!storage) {
    return {
      ok: false,
      error: '浏览器本地存储不可用，任务未能保存。',
    };
  }

  try {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: BOARD_VERSION, tasks }),
    );
    return { ok: true };
  } catch (error) {
    return { ok: false, error: storageErrorMessage(error) };
  }
}
