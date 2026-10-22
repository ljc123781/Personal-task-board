import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  THEME_STORAGE_KEY,
  applyTheme,
  loadTheme,
  saveTheme,
} from './theme';
import type { StorageLike } from './storage';

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.style.colorScheme = '';
});

describe('theme preference', () => {
  it('loads a saved theme', () => {
    const storage = new MemoryStorage();
    storage.setItem(THEME_STORAGE_KEY, 'dark');

    expect(loadTheme(storage)).toBe('dark');
  });

  it('falls back to light when storage is empty and system is unavailable', () => {
    expect(loadTheme(new MemoryStorage())).toBe('light');
  });

  it('uses the system dark preference when no value is saved', () => {
    const originalMatchMedia = window.matchMedia;
    const matchMedia = vi
      .fn()
      .mockReturnValue({ matches: true } as MediaQueryList);

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: matchMedia,
    });

    expect(loadTheme(new MemoryStorage())).toBe('dark');

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: originalMatchMedia,
    });
  });

  it('ignores invalid stored values', () => {
    const storage = new MemoryStorage();
    storage.setItem(THEME_STORAGE_KEY, 'sepia');

    expect(loadTheme(storage)).toBe('light');
  });

  it('saves the selected theme', () => {
    const storage = new MemoryStorage();

    expect(saveTheme('dark', storage)).toBe(true);
    expect(storage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(saveTheme('light', null)).toBe(false);
  });

  it('applies the theme to the document', () => {
    applyTheme('dark');

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');

    applyTheme('light');

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });
});
