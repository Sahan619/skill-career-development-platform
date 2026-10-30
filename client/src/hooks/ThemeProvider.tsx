import {
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { ThemeContext, type Theme } from './ThemeContext';

function getStoredTheme(): Theme | null {
  try {
    const savedTheme = window.localStorage.getItem('theme');
    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : null;
  } catch {
    return null;
  }
}

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getInitialTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

function updateThemeColor(theme: Theme) {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#242238' : '#efeaff');
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [hasSavedChoice, setHasSavedChoice] = useState(
    () => getStoredTheme() !== null,
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.add('theme-ready');
    updateThemeColor(theme);
  }, [theme]);

  useEffect(() => {
    if (hasSavedChoice) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [hasSavedChoice]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setHasSavedChoice(true);

    try {
      window.localStorage.setItem('theme', nextTheme);
    } catch {
      // The current selection still applies for this session when storage is unavailable.
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
