import { describe, expect, it } from 'vitest';
import {
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  normalizeTaskDraft,
  validateTaskDraft,
} from './taskInput';
import type { TaskDraft } from '../types';

const validDraft: TaskDraft = {
  title: '写项目 README',
  description: '补充安装步骤',
  status: 'todo',
};

describe('task draft validation', () => {
  it('accepts a valid draft', () => {
    expect(validateTaskDraft(validDraft)).toEqual({});
  });

  it('rejects an empty or whitespace-only title', () => {
    expect(validateTaskDraft({ ...validDraft, title: '   ' }).title).toBe(
      '请输入任务标题。',
    );
  });

  it('accepts titles at the limit and rejects longer titles', () => {
    expect(
      validateTaskDraft({
        ...validDraft,
        title: 'a'.repeat(TITLE_MAX_LENGTH),
      }),
    ).toEqual({});

    expect(
      validateTaskDraft({
        ...validDraft,
        title: 'a'.repeat(TITLE_MAX_LENGTH + 1),
      }).title,
    ).toBe(`标题不能超过 ${TITLE_MAX_LENGTH} 个字符。`);
  });

  it('accepts descriptions at the limit and rejects longer descriptions', () => {
    expect(
      validateTaskDraft({
        ...validDraft,
        description: 'a'.repeat(DESCRIPTION_MAX_LENGTH),
      }),
    ).toEqual({});

    expect(
      validateTaskDraft({
        ...validDraft,
        description: 'a'.repeat(DESCRIPTION_MAX_LENGTH + 1),
      }).description,
    ).toBe(`描述不能超过 ${DESCRIPTION_MAX_LENGTH} 个字符。`);
  });

  it('trims title and description while preserving status', () => {
    expect(
      normalizeTaskDraft({
        title: '  写 README  ',
        description: '  补充说明  ',
        status: 'doing',
      }),
    ).toEqual({
      title: '写 README',
      description: '补充说明',
      status: 'doing',
    });
  });
});
