import { useTheme } from '../../hooks/useTheme';
import './ThemeToggle.css';

type ThemeToggleProps = {
  className?: string;
  showLabel?: boolean;
};

const ThemeToggle = ({ className = '', showLabel = false }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      className={`theme-toggle ${className}`.trim()}
      type="button"
      aria-label={`Switch to ${nextTheme} mode`}
      aria-pressed={theme === 'dark'}
      data-theme={theme}
      onClick={toggleTheme}
    >
      <span className="theme-toggle-icons" aria-hidden="true">
        <svg
          className="theme-toggle-icon theme-toggle-icon-sun"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </svg>
        <svg
          className="theme-toggle-icon theme-toggle-icon-moon"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8 8.5 8.5 0 1 0 20.2 15.4Z" />
        </svg>
      </span>
      {showLabel && (
        <span className="theme-toggle-label">
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
