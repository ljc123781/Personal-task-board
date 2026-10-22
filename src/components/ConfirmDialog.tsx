import { useEffect, useId, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, SyntheticEvent } from 'react';
import type { TaskMutationResult } from '../types';

interface ConfirmDialogProps {
  taskTitle: string;
  onCancel: () => void;
  onConfirm: () => TaskMutationResult;
}

export function ConfirmDialog({
  taskTitle,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const submittingRef = useRef(false);
  const headingId = useId();
  const messageId = useId();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    if (!dialog.open) {
      dialog.showModal();
    }

    const frame = window.requestAnimationFrame(() => {
      cancelButtonRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);

      if (dialog.open) {
        dialog.close();
      }

      const previousFocus = previousFocusRef.current;

      if (previousFocus?.isConnected) {
        previousFocus.focus();
      } else {
        document.getElementById('task-list-heading')?.focus();
      }
    };
  }, []);

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    onCancel();
  };

  const handleBackdropClick = (event: ReactMouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  };

  const handleConfirm = () => {
    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    const result = onConfirm();

    if (!result.ok) {
      submittingRef.current = false;
      setError(result.error);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="task-dialog confirm-dialog"
      role="alertdialog"
      aria-labelledby={headingId}
      aria-describedby={messageId}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
    >
      <div className="confirm-dialog__body">
        <div className="dialog-header">
          <div>
            <p className="section-kicker">Delete task</p>
            <h2 id={headingId}>删除任务</h2>
          </div>
          <button
            type="button"
            className="dialog-close"
            onClick={onCancel}
            aria-label="关闭删除确认"
          >
            ×
          </button>
        </div>

        <p id={messageId} className="confirm-dialog__message">
          确定删除「<strong>{taskTitle}</strong>」吗？删除后无法恢复。
        </p>

        {error && (
          <p className="form-alert" role="alert">
            {error}
          </p>
        )}

        <div className="form-footer confirm-dialog__actions">
          <button
            ref={cancelButtonRef}
            type="button"
            className="button button--ghost"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            type="button"
            className="button button--danger-solid"
            onClick={handleConfirm}
          >
            删除
          </button>
        </div>
      </div>
    </dialog>
  );
}
