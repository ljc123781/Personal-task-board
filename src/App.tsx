import { useEffect, useMemo, useRef, useState } from 'react';
import { AppHeader } from './components/AppHeader';
import { ConfirmDialog } from './components/ConfirmDialog';
import { FilterBar } from './components/FilterBar';
import { PreviewBanner } from './components/PreviewBanner';
import { TaskFormDialog } from './components/TaskFormDialog';
import { TaskList } from './components/TaskList';
import { ToastProvider } from './components/ToastProvider';
import { seedTasks } from './data/seedTasks';
import { useTasks } from './hooks/useTasks';
import { useToast } from './hooks/useToast';
import { filterTasks, getNextStatus, getTaskCounts, sortTasks } from './lib/tasks';
import type {
  Task,
  TaskDraft,
  TaskFilter,
  TaskMutationResult,
} from './types';

const isPreview =
  import.meta.env.DEV &&
  new URLSearchParams(window.location.search).get('preview') === '1';

function TaskBoard() {
  const {
    tasks: storedTasks,
    loadError,
    createTask,
    updateTask,
    deleteTask,
    changeStatus,
  } = useTasks();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const shownLoadError = useRef(false);

  const tasks = useMemo(
    () => (isPreview ? sortTasks(seedTasks) : storedTasks),
    [storedTasks],
  );
  const counts = useMemo(() => getTaskCounts(tasks), [tasks]);
  const visibleTasks = useMemo(
    () => filterTasks(tasks, filter),
    [filter, tasks],
  );

  useEffect(() => {
    if (loadError && !isPreview && !shownLoadError.current) {
      shownLoadError.current = true;
      showToast(loadError, 'error');
    }
  }, [loadError, showToast]);

  const openCreateDialog = () => {
    setEditingTask(null);
    setIsEditorOpen(true);
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = (draft: TaskDraft): TaskMutationResult => {
    if (
      editingTask &&
      !storedTasks.some((task) => task.id === editingTask.id)
    ) {
      closeEditor();
      showToast('任务不存在，可能已被删除。', 'error');
      return { ok: true, persisted: true };
    }

    const result = editingTask
      ? updateTask(editingTask.id, draft)
      : createTask(draft);

    if (!result.ok) {
      return result;
    }

    if (!result.persisted) {
      showToast(result.warning, 'error');
    } else if (editingTask) {
      showToast('修改已保存', 'success');
    } else {
      showToast('任务已创建', 'success');
    }

    if (!editingTask) {
      setFilter(draft.status);
    }

    setIsEditorOpen(false);
    setEditingTask(null);
    return result;
  };

  const openDeleteDialog = (task: Task) => {
    setTaskToDelete(task);
  };

  const closeDeleteDialog = () => {
    setTaskToDelete(null);
  };

  const handleConfirmDelete = (): TaskMutationResult => {
    if (!taskToDelete) {
      return {
        ok: false,
        error: '任务不存在，可能已被删除。',
      };
    }

    const result = deleteTask(taskToDelete.id);

    if (!result.ok) {
      return result;
    }

    setTaskToDelete(null);

    if (!result.persisted) {
      showToast(result.warning, 'error');
    } else {
      showToast('任务已删除', 'success');
    }

    return result;
  };

  const handleStatusChange = (task: Task) => {
    const result = changeStatus(task.id, getNextStatus(task.status));

    if (!result.ok) {
      showToast(result.error, 'error');
    } else if (!result.persisted) {
      showToast(result.warning, 'error');
    }
  };

  return (
    <div className="app-shell">
      <AppHeader
        total={tasks.length}
        counts={counts}
        onCreate={isPreview ? undefined : openCreateDialog}
        createDisabledReason={
          isPreview ? '预览模式中，操作按钮已禁用。' : undefined
        }
      />

      {isPreview && <PreviewBanner />}

      <main className="app-main">
        <FilterBar value={filter} counts={counts} onChange={setFilter} />

        <section className="task-section" aria-labelledby="task-list-heading">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Your tasks</p>
              <h2 id="task-list-heading" tabIndex={-1}>
                任务列表
              </h2>
            </div>
            <span className="section-count" aria-live="polite" aria-atomic="true">
              {visibleTasks.length} 项
            </span>
          </div>

          <TaskList
            tasks={visibleTasks}
            filter={filter}
            readOnly={isPreview}
            onStatusChange={isPreview ? undefined : handleStatusChange}
            onEdit={isPreview ? undefined : openEditDialog}
            onDelete={isPreview ? undefined : openDeleteDialog}
          />
        </section>
      </main>

      <footer className="app-footer">
        <p>数据只保存在当前浏览器 · 不上传云端</p>
      </footer>

      {isEditorOpen && (
        <TaskFormDialog
          key={editingTask?.id ?? 'create-task'}
          initialTask={editingTask}
          onClose={closeEditor}
          onSubmit={handleSubmit}
        />
      )}

      {taskToDelete && (
        <ConfirmDialog
          taskTitle={taskToDelete.title}
          onCancel={closeDeleteDialog}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <TaskBoard />
    </ToastProvider>
  );
}

export default App;
