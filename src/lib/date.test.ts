import { describe, expect, it } from 'vitest';
import { formatUpdatedAt } from './date';

describe('formatUpdatedAt', () => {
  it('returns a readable value for a valid ISO timestamp', () => {
    const formatted = formatUpdatedAt('2026-10-20T09:20:00+08:00');

    expect(formatted).not.toBe('时间未知');
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('returns a safe fallback for an invalid timestamp', () => {
    expect(formatUpdatedAt('not-a-date')).toBe('时间未知');
  });
});
