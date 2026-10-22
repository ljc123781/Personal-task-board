import type { TaskFilter, TaskStatus } from './types';

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: '待处理',
  doing: '进行中',
  done: '已完成',
};

export const FILTERS: ReadonlyArray<{ value: TaskFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'todo', label: '待处理' },
  { value: 'doing', label: '进行中' },
  { value: 'done', label: '已完成' },
];

export const QUICK_ACTION_LABELS: Record<TaskStatus, string> = {
  todo: '开始',
  doing: '完成',
  done: '重新打开',
};

export const EMPTY_STATE_COPY: Record<
  TaskFilter,
  { title: string; description: string }
> = {
  all: {
    title: '还没有任务',
    description: '新建的任务会出现在这里，先记下一件要做的事。',
  },
  todo: {
    title: '暂无待处理任务',
    description: '所有任务都已经开始或完成。',
  },
  doing: {
    title: '暂无进行中的任务',
    description: '从待处理任务里选一件，开始推进。',
  },
  done: {
    title: '暂无已完成的任务',
    description: '完成任务后，它会出现在这里。',
  },
};
