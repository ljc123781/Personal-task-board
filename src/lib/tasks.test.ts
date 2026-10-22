import { describe, expect, it } from 'vitest';
import { seedTasks } from '../data/seedTasks';
import {
  applyStatusChange,
  filterTasks,
  getNextStatus,
  getTaskCounts,
  removeTask,
  sortTasks,
} from './tasks';
import type { Task } from '../types';

const now = '2026-10-21T12:00:00.000Z';

describe('task selectors', () => {
  it('counts tasks across all statuses', () => {
    expect(getTaskCounts(seedTasks)).toEqual({
      all: 6,
      todo: 2,
      doing: 2,
      done: 2,
    });
  });

  it('returns an all-zero count for an empty board', () => {
    expect(getTaskCounts([])).toEqual({
      all: 0,
      todo: 0,
      doing: 0,
      done: 0,
    });
  });

  it('filters tasks by status while preserving order', () => {
    expect(filterTasks(seedTasks, 'doing').map((task) => task.id)).toEqual([
      'seed-project-readme',
      'seed-empty-state',
    ]);
  });

  it('returns every task for the all filter', () => {
    expect(filterTasks(seedTasks, 'all')).toHaveLength(seedTasks.length);
  });

  it('sorts tasks by createdAt descending', () => {
    const reversed = [...seedTasks].reverse();

    expect(sortTasks(reversed).map((task) => task.id)).toEqual(
      seedTasks.map((task) => task.id),
    );
  });
});

describe('task transitions', () => {
  it('cycles through todo -> doing -> done -> todo', () => {
    expect(getNextStatus('todo')).toBe('doing');
    expect(getNextStatus('doing')).toBe('done');
    expect(getNextStatus('done')).toBe('todo');
  });

  it('sets completedAt when a task becomes done', () => {
    const next = applyStatusChange(seedTasks[1], 'done', now);

    expect(next.status).toBe('done');
    expect(next.completedAt).toBe(now);
    expect(next.updatedAt).toBe(now);
  });

  it('clears completedAt when a done task is reopened', () => {
    const doneTask = seedTasks.find((task) => task.status === 'done');
    const next = applyStatusChange(doneTask as Task, 'todo', now);

    expect(next.status).toBe('todo');
    expect(next.completedAt).toBeNull();
    expect(next.updatedAt).toBe(now);
  });

  it('preserves the original completion time when staying done', () => {
    const doneTask = seedTasks.find((task) => task.status === 'done') as Task;
    const next = applyStatusChange(doneTask, 'done', now);

    expect(next.completedAt).toBe(doneTask.completedAt);
  });

  it('removes only the matching task', () => {
    const removed = removeTask(seedTasks, 'seed-project-readme');

    expect(removed).toHaveLength(seedTasks.length - 1);
    expect(
      removed.some((task) => task.id === 'seed-project-readme'),
    ).toBe(false);
  });
});
