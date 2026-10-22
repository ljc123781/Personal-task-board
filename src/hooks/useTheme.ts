import { useCallback, useEffect, useState } from 'react';
import { getBrowserStorage } from '../lib/storage';
import type { StorageLike } from '../lib/storage';
import {
  applyTheme,
  loadTheme,
  saveTheme,
  type Theme,
} from '../lib/theme';

export function useTheme(storage: StorageLike | null = getBrowserStorage()) {
  const [theme, setTheme] = useState<Theme>(() => loadTheme(storage));

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback((): boolean => {
    const nextTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    return saveTheme(nextTheme, storage);
  }, [storage, theme]);

  return { theme, toggleTheme };
}
