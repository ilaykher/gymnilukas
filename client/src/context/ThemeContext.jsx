
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const savedTheme = localStorage.getItem('theme');

      if (savedTheme) {
        return savedTheme === 'dark';
      }

      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle('dark', isDarkMode);

    try {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    } catch {
      // Continue using the selected theme if storage is unavailable.
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((previousMode) => !previousMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
