import { describe, expect, it } from 'vitest';
import { STORAGE_KEY, loadTasks, saveTasks } from './storage';
import type { StorageLike } from './storage';
import type { Task } from '../types';

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  raw(key: string): string | null {
    return this.values.get(key) ?? null;
  }
}

class ThrowingReadStorage implements StorageLike {
  setItem(): void {
    throw new Error('not implemented');
  }

  getItem(): string | null {
    throw new Error('storage blocked');
  }
}

class ThrowingWriteStorage implements StorageLike {
  getItem(): string | null {
    return null;
  }

  setItem(): void {
    throw { name: 'QuotaExceededError' };
  }
}

const task: Task = {
  id: 'task-1',
  title: '写项目 README',
  description: '补充安装步骤',
  status: 'todo',
  createdAt: '2026-10-20T09:00:00.000Z',
  updatedAt: '2026-10-20T09:00:00.000Z',
  completedAt: null,
};

describe('task storage', () => {
  it('starts with an empty board when no data exists', () => {
    expect(loadTasks(new MemoryStorage())).toEqual({
      tasks: [],
      error: null,
    });
  });

  it('round-trips tasks with the versioned envelope', () => {
    const storage = new MemoryStorage();

    expect(saveTasks([task], storage)).toEqual({ ok: true });
    expect(loadTasks(storage).tasks).toEqual([task]);

    const raw = storage.raw(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string)).toEqual({
      version: 1,
      tasks: [task],
    });
  });

  it('does not overwrite a corrupt value when reading', () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, '{broken json');

    const result = loadTasks(storage);
    expect(result.tasks).toEqual([]);
    expect(result.error).toContain('无法解析');
    expect(storage.raw(STORAGE_KEY)).toBe('{broken json');
  });

  it('rejects an unsupported board version', () => {
    const storage = new MemoryStorage();
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 2, tasks: [task] }),
    );

    const result = loadTasks(storage);
    expect(result.tasks).toEqual([]);
    expect(result.error).toContain('版本或结构不受支持');
  });

  it('keeps valid tasks and reports invalid records', () => {
    const storage = new MemoryStorage();
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        tasks: [task, { id: 'broken' }, null],
      }),
    );

    const result = loadTasks(storage);
    expect(result.tasks).toEqual([task]);
    expect(result.error).toContain('2 条');
  });

  it('reports a read failure without throwing', () => {
    const result = loadTasks(new ThrowingReadStorage());
    expect(result.tasks).toEqual([]);
    expect(result.error).toContain('读取本地任务失败');
  });

  it('reports quota errors when writing', () => {
    expect(saveTasks([task], new ThrowingWriteStorage())).toEqual({
      ok: false,
      error: '浏览器本地存储空间已满，任务未能保存。',
    });
  });

  it('reports unavailable storage', () => {
    expect(loadTasks(null).error).toContain('不可用');
    expect(saveTasks([task], null)).toEqual({
      ok: false,
      error: '浏览器本地存储不可用，任务未能保存。',
    });
  });
});
