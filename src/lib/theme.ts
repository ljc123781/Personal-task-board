import type { StorageLike } from './storage';

export const THEME_STORAGE_KEY = 'personal-task-board.theme';

export type Theme = 'light' | 'dark';

export function getSystemTheme(): Theme {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }

  return 'light';
}

export function loadTheme(storage: StorageLike | null): Theme {
  if (!storage) {
    return getSystemTheme();
  }

  try {
    const stored = storage.getItem(THEME_STORAGE_KEY);

    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // Fall back to the system preference when storage is unavailable.
  }

  return getSystemTheme();
}

export function saveTheme(
  theme: Theme,
  storage: StorageLike | null,
): boolean {
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
    return true;
  } catch {
    return false;
  }
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}
