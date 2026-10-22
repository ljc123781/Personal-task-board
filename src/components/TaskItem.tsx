import { QUICK_ACTION_LABELS, STATUS_LABELS } from '../constants';
import { formatUpdatedAt } from '../lib/date';
import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  readOnly?: boolean;
  onStatusChange?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

const previewHint = '预览模式中，操作已禁用';

export function TaskItem({
  task,
  readOnly = false,
  onStatusChange,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const titleId = `task-title-${task.id}`;
  const quickAction = QUICK_ACTION_LABELS[task.status];
  const quickHint = readOnly
    ? previewHint
    : '快捷状态流转将在下一步接入';
  const editHint = readOnly ? previewHint : '编辑功能暂不可用';
  const deleteHint = readOnly ? previewHint : '删除确认将在下一步接入';

  return (
    <li className={`task-card task-card--${task.status}`} aria-labelledby={titleId}>
      <div className="task-card__main">
        <div className="task-card__heading">
          <h3 id={titleId}>{task.title}</h3>
          <span className={`status-badge status-badge--${task.status}`}>
            {STATUS_LABELS[task.status]}
          </span>
        </div>

        {task.description && (
          <p className="task-card__description">{task.description}</p>
        )}

        <p className="task-card__meta">
          更新于{' '}
          <time dateTime={task.updatedAt}>{formatUpdatedAt(task.updatedAt)}</time>
        </p>
      </div>

      <div className="task-card__actions">
        <button
          type="button"
          className="button button--quick"
          onClick={() => onStatusChange?.(task)}
          disabled={readOnly || !onStatusChange}
          title={readOnly || !onStatusChange ? quickHint : undefined}
          aria-label={`${quickAction}：${task.title}`}
        >
          {quickAction}
        </button>
        <button
          type="button"
          className="button button--ghost"
          onClick={() => onEdit?.(task)}
          disabled={readOnly || !onEdit}
          title={readOnly || !onEdit ? editHint : undefined}
          aria-label={`编辑任务：${task.title}`}
        >
          编辑
        </button>
        <button
          type="button"
          className="button button--danger"
          onClick={() => onDelete?.(task)}
          disabled={readOnly || !onDelete}
          title={readOnly || !onDelete ? deleteHint : undefined}
          aria-label={`删除任务：${task.title}`}
        >
          删除
        </button>
      </div>
    </li>
  );
}
