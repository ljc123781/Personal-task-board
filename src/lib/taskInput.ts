import type { TaskDraft } from '../types';

export const TITLE_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 500;

export interface TaskDraftErrors {
  title?: string;
  description?: string;
}

export function validateTaskDraft(draft: TaskDraft): TaskDraftErrors {
  const errors: TaskDraftErrors = {};
  const title = draft.title.trim();

  if (!title) {
    errors.title = '请输入任务标题。';
  } else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `标题不能超过 ${TITLE_MAX_LENGTH} 个字符。`;
  }

  if (draft.description.length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `描述不能超过 ${DESCRIPTION_MAX_LENGTH} 个字符。`;
  }

  return errors;
}

export function normalizeTaskDraft(draft: TaskDraft): TaskDraft {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    status: draft.status,
  };
}
