import React, { createContext, useContext, useEffect, useState } from 'react';
import { themes, ThemeName, getThemeClass } from '../themes/themeConfig';

interface ThemeContextType {
  currentTheme: ThemeName;
  changeTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('friendly');
  const [isInitialized, setIsInitialized] = useState(false);

  // Apply theme immediately on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('petmate-theme') as ThemeName;
    if (savedTheme && themes.find(t => t.name === savedTheme)) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('friendly');
    }
    setIsInitialized(true);
  }, []);

  const applyTheme = (themeName: ThemeName) => {
    // Add switching class to disable transitions
    document.documentElement.classList.add('theme-switching');

    // Remove all theme classes
    document.documentElement.classList.remove('theme-lavender', 'theme-friendly', 'theme-bold', 'theme-royal');

    // Add new theme class
    document.documentElement.classList.add(getThemeClass(themeName));

    // Remove switching class after a brief delay
    setTimeout(() => {
      document.documentElement.classList.remove('theme-switching');
    }, 50);
  };

  const changeTheme = (themeName: ThemeName) => {
    setCurrentTheme(themeName);
    applyTheme(themeName);
    localStorage.setItem('petmate-theme', themeName);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme }}>
      {/* Block rendering until the theme class is applied to prevent FOUC */}
      {isInitialized ? children : <div style={{ minHeight: '100vh', background: '#F8F5FC' }} />}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
