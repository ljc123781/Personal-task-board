import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { seedTasks } from '../data/seedTasks';
import { STORAGE_KEY } from '../lib/storage';
import { THEME_STORAGE_KEY } from '../lib/theme';
import type { Task } from '../types';

const todoTask: Task = {
  id: 'task-todo',
  title: '整理测试清单',
  description: '先处理待办事项',
  status: 'todo',
  createdAt: '2026-10-20T09:00:00.000Z',
  updatedAt: '2026-10-20T09:00:00.000Z',
  completedAt: null,
};

function seedBoard(tasks: Task[]): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: 1, tasks }),
  );
}

function readStoredTasks(): Task[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw).tasks as Task[]) : [];
}

async function openCreateDialog(): Promise<HTMLDialogElement> {
  fireEvent.click(screen.getByRole('button', { name: /新建任务/ }));
  const heading = await screen.findByRole('heading', { name: '新建任务' });
  return heading.closest('dialog') as HTMLDialogElement;
}

function fillTaskForm(
  dialog: HTMLDialogElement,
  values: { title: string; description?: string; status?: string },
): void {
  fireEvent.change(within(dialog).getByLabelText(/标题/), {
    target: { value: values.title },
  });

  if (values.description !== undefined) {
    fireEvent.change(within(dialog).getByLabelText('描述'), {
      target: { value: values.description },
    });
  }

  if (values.status !== undefined) {
    fireEvent.change(within(dialog).getByLabelText('状态'), {
      target: { value: values.status },
    });
  }
}

async function submitCreate(dialog: HTMLDialogElement): Promise<void> {
  fireEvent.click(
    within(dialog).getByRole('button', { name: '创建任务' }),
  );
  await waitFor(() => {
    expect(
      screen.queryByRole('heading', { name: '新建任务' }),
    ).not.toBeInTheDocument();
  });
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  localStorage.clear();
});

describe('empty board and filters', () => {
  it('shows the empty state and filter-specific empty copy', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: '还没有任务' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /待处理/ }));

    expect(
      screen.getByRole('heading', { name: '暂无待处理任务' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /待处理/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('counts and filters seeded tasks', () => {
    seedBoard(seedTasks);
    render(<App />);

    expect(screen.getByRole('button', { name: /全部/ })).toHaveTextContent('6');
    expect(screen.getByRole('button', { name: /待处理/ })).toHaveTextContent(
      '2',
    );
    expect(screen.getByRole('button', { name: /进行中/ })).toHaveTextContent(
      '2',
    );
    expect(screen.getByRole('button', { name: /已完成/ })).toHaveTextContent(
      '2',
    );

    fireEvent.click(screen.getByRole('button', { name: /进行中/ }));

    const list = screen.getByRole('list', { name: '任务列表' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(
      screen.queryByRole('heading', { name: '整理本周阅读清单' }),
    ).not.toBeInTheDocument();
  });

  it('shows an empty state for a filter with no matches', () => {
    seedBoard([todoTask]);
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /已完成/ }));

    expect(
      screen.getByRole('heading', { name: '暂无已完成的任务' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('list', { name: '任务列表' }),
    ).not.toBeInTheDocument();
  });
});

describe('theme preference', () => {
  it('toggles between light and dark mode and persists the choice', async () => {
    render(<App />);

    const toggle = screen.getByRole('button', { name: '深色模式' });
    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('light');
    });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(toggle);

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('dark');
    });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

    fireEvent.click(toggle);

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('light');
    });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });
});

describe('create and edit', () => {
  it('creates a task, shows a toast, and persists after remount', async () => {
    const view = render(<App />);
    const dialog = await openCreateDialog();

    fillTaskForm(dialog, {
      title: '写组件测试',
      description: '覆盖新增和持久化',
    });
    await submitCreate(dialog);

    expect(
      screen.getByRole('heading', { name: '写组件测试' }),
    ).toBeInTheDocument();

    const toast = screen.getByRole('status');
    expect(toast).toHaveTextContent('任务已创建');
    expect(toast).toHaveAttribute('aria-live', 'polite');

    expect(readStoredTasks()).toHaveLength(1);
    expect(readStoredTasks()[0]).toMatchObject({
      title: '写组件测试',
      description: '覆盖新增和持久化',
      status: 'todo',
    });

    view.unmount();
    render(<App />);

    expect(
      screen.getByRole('heading', { name: '写组件测试' }),
    ).toBeInTheDocument();
  });

  it('blocks an empty title and keeps the dialog open', async () => {
    render(<App />);
    const dialog = await openCreateDialog();

    fireEvent.click(
      within(dialog).getByRole('button', { name: '创建任务' }),
    );

    expect(await screen.findByText('请输入任务标题。')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '新建任务' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(readStoredTasks()).toEqual([]);
  });

  it('edits a task and persists the new status', async () => {
    seedBoard([todoTask]);
    render(<App />);

    fireEvent.click(
      screen.getByRole('button', { name: /编辑任务：/ }),
    );
    const heading = await screen.findByRole('heading', { name: '编辑任务' });
    const dialog = heading.closest('dialog') as HTMLDialogElement;
    const titleInput = within(dialog).getByLabelText(/标题/);

    expect(titleInput).toHaveValue('整理测试清单');

    fireEvent.change(titleInput, {
      target: { value: '整理测试清单（已编辑）' },
    });
    fireEvent.change(within(dialog).getByLabelText('状态'), {
      target: { value: 'doing' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: '保存修改' }),
    );

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: '编辑任务' }),
      ).not.toBeInTheDocument();
    });

    expect(
      screen.getByRole('heading', { name: '整理测试清单（已编辑）' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('修改已保存');
    expect(readStoredTasks()[0]).toMatchObject({
      title: '整理测试清单（已编辑）',
      status: 'doing',
    });
  });
});

describe('delete confirmation', () => {
  it('cancels deletion and restores focus to the trigger', async () => {
    seedBoard([todoTask]);
    render(<App />);

    const deleteButton = screen.getByRole('button', {
      name: /删除任务：/,
    });
    deleteButton.focus();
    fireEvent.click(deleteButton);

    const heading = await screen.findByRole('heading', { name: '删除任务' });
    const dialog = heading.closest('dialog') as HTMLDialogElement;
    expect(heading).toBeInTheDocument();
    expect(within(dialog).getByText(/整理测试清单/)).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: '取消' });
    await waitFor(() => {
      expect(cancelButton).toHaveFocus();
    });

    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: '删除任务' }),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole('heading', { name: '整理测试清单' }),
    ).toBeInTheDocument();
    expect(deleteButton).toHaveFocus();
    expect(readStoredTasks()).toHaveLength(1);
  });

  it('cancels deletion via a cancel event and restores focus', async () => {
    seedBoard([todoTask]);
    render(<App />);

    const deleteButton = screen.getByRole('button', {
      name: /删除任务：/,
    });
    deleteButton.focus();
    fireEvent.click(deleteButton);

    const heading = await screen.findByRole('heading', { name: '删除任务' });
    const dialog = heading.closest('dialog') as HTMLDialogElement;

    fireEvent(
      dialog,
      new Event('cancel', { bubbles: true, cancelable: true }),
    );

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: '删除任务' }),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole('heading', { name: '整理测试清单' }),
    ).toBeInTheDocument();
    expect(deleteButton).toHaveFocus();
  });

  it('confirms deletion, shows a toast, and removes persisted data', async () => {
    seedBoard([todoTask]);
    render(<App />);

    const deleteButton = screen.getByRole('button', {
      name: /删除任务：/,
    });
    deleteButton.focus();
    fireEvent.click(deleteButton);
    await screen.findByRole('heading', { name: '删除任务' });

    fireEvent.click(screen.getByRole('button', { name: '删除' }));

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: '整理测试清单' }),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByRole('status')).toHaveTextContent('任务已删除');
    expect(readStoredTasks()).toEqual([]);
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: '任务列表' }),
      ).toHaveFocus();
    });
  });
});

describe('status transitions and feedback', () => {
  it('cycles through todo, doing, and done, then reopens', async () => {
    seedBoard([todoTask]);
    render(<App />);

    expect(
      screen.getByText('待处理', { selector: '.status-badge' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /开始：/ }));
    await waitFor(() => {
      expect(
        screen.getByText('进行中', { selector: '.status-badge' }),
      ).toBeInTheDocument();
    });
    expect(readStoredTasks()[0]).toMatchObject({
      status: 'doing',
      completedAt: null,
    });

    fireEvent.click(screen.getByRole('button', { name: /完成：/ }));
    await waitFor(() => {
      expect(
        screen.getByText('已完成', { selector: '.status-badge' }),
      ).toBeInTheDocument();
    });
    expect(readStoredTasks()[0].status).toBe('done');
    expect(readStoredTasks()[0].completedAt).toEqual(expect.any(String));

    fireEvent.click(
      screen.getByRole('button', { name: /重新打开：/ }),
    );
    await waitFor(() => {
      expect(
        screen.getByText('待处理', { selector: '.status-badge' }),
      ).toBeInTheDocument();
    });
    expect(readStoredTasks()[0]).toMatchObject({
      status: 'todo',
      completedAt: null,
    });
  });

  it('keeps the task in memory and warns when storage fails', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw { name: 'QuotaExceededError' };
    });

    render(<App />);
    const dialog = await openCreateDialog();

    fillTaskForm(dialog, { title: '无法保存的任务' });
    fireEvent.click(
      within(dialog).getByRole('button', { name: '创建任务' }),
    );

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: '新建任务' }),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole('heading', { name: '无法保存的任务' }),
    ).toBeInTheDocument();

    const warning = screen.getByRole('alert');
    expect(warning).toHaveTextContent('浏览器本地存储空间已满');
    expect(warning).toHaveTextContent('刷新后可能丢失');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('closes a toast from its close button', async () => {
    render(<App />);
    const dialog = await openCreateDialog();
    fillTaskForm(dialog, { title: '可关闭的提示' });
    await submitCreate(dialog);

    const toast = screen.getByRole('status');
    fireEvent.click(
      within(toast).getByRole('button', { name: '关闭提示' }),
    );

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('does not make network requests during the create flow', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    render(<App />);
    const dialog = await openCreateDialog();
    fillTaskForm(dialog, { title: '不发网络请求' });
    await submitCreate(dialog);

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
