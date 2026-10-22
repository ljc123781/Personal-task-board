import { useEffect, useId, useRef, useState } from 'react';
import type {
  FormEvent,
  MouseEvent as ReactMouseEvent,
  SyntheticEvent,
} from 'react';
import { STATUS_LABELS } from '../constants';
import {
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  normalizeTaskDraft,
  validateTaskDraft,
} from '../lib/taskInput';
import type {
  Task,
  TaskDraft,
  TaskMutationResult,
  TaskStatus,
} from '../types';

interface TaskFormDialogProps {
  initialTask: Task | null;
  onClose: () => void;
  onSubmit: (draft: TaskDraft) => TaskMutationResult;
}

export function TaskFormDialog({
  initialTask,
  onClose,
  onSubmit,
}: TaskFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);
  const headingId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const [title, setTitle] = useState(initialTask?.title ?? '');
  const [description, setDescription] = useState(
    initialTask?.description ?? '',
  );
  const [status, setStatus] = useState<TaskStatus>(
    initialTask?.status ?? 'todo',
  );
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const isEditing = initialTask !== null;

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (!dialog.open) {
      dialog.showModal();
    }

    const frame = window.requestAnimationFrame(() => {
      titleInputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);

      if (dialog.open) {
        dialog.close();
      }
    };
  }, []);

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    onClose();
  };

  const handleBackdropClick = (event: ReactMouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const draft: TaskDraft = { title, description, status };
    const nextErrors = validateTaskDraft(draft);

    if (nextErrors.title || nextErrors.description) {
      setErrors(nextErrors);
      setFormError(null);

      if (nextErrors.title) {
        titleInputRef.current?.focus();
      }

      return;
    }

    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    const result = onSubmit(normalizeTaskDraft(draft));

    if (!result.ok) {
      submittingRef.current = false;
      setFormError(result.error);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="task-dialog"
      aria-labelledby={headingId}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
    >
      <form className="task-dialog__form" onSubmit={handleSubmit} noValidate>
        <div className="dialog-header">
          <div>
            <p className="section-kicker">Task details</p>
            <h2 id={headingId}>{isEditing ? '编辑任务' : '新建任务'}</h2>
          </div>
          <button
            type="button"
            className="dialog-close"
            onClick={onClose}
            aria-label="关闭任务表单"
          >
            ×
          </button>
        </div>

        <div className="form-field">
          <label htmlFor={titleId}>
            标题
            <span className="required-mark" aria-hidden="true">
              *
            </span>
          </label>
          <input
            ref={titleInputRef}
            id={titleId}
            type="text"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (errors.title) {
                setErrors((current) => ({ ...current, title: undefined }));
              }
            }}
            maxLength={TITLE_MAX_LENGTH}
            placeholder="例如：写项目 README"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={
              errors.title ? `${titleId}-error` : `${titleId}-hint`
            }
            required
          />
          {errors.title ? (
            <p id={`${titleId}-error`} className="field-error" role="alert">
              {errors.title}
            </p>
          ) : (
            <p id={`${titleId}-hint`} className="field-hint">
              必填，最多 {TITLE_MAX_LENGTH} 个字符。
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor={descriptionId}>描述</label>
          <textarea
            id={descriptionId}
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              if (errors.description) {
                setErrors((current) => ({
                  ...current,
                  description: undefined,
                }));
              }
            }}
            maxLength={DESCRIPTION_MAX_LENGTH}
            rows={4}
            placeholder="补充背景、下一步或完成标准（可选）"
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description
                ? `${descriptionId}-error`
                : `${descriptionId}-hint`
            }
          />
          {errors.description ? (
            <p
              id={`${descriptionId}-error`}
              className="field-error"
              role="alert"
            >
              {errors.description}
            </p>
          ) : (
            <p id={`${descriptionId}-hint`} className="field-hint">
              可选，最多 {DESCRIPTION_MAX_LENGTH} 个字符。
            </p>
          )}
          <p className="char-count" aria-hidden="true">
            {description.length} / {DESCRIPTION_MAX_LENGTH}
          </p>
        </div>

        <div className="form-field">
          <label htmlFor={`${titleId}-status`}>状态</label>
          <select
            id={`${titleId}-status`}
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as TaskStatus);
            }}
          >
            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        {formError && (
          <p className="form-alert" role="alert">
            {formError}
          </p>
        )}

        <div className="form-footer">
          <button
            type="button"
            className="button button--ghost"
            onClick={onClose}
          >
            取消
          </button>
          <button type="submit" className="button button--primary">
            {isEditing ? '保存修改' : '创建任务'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
