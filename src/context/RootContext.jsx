import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStickyState } from '../hooks';
import { getSystemLanguage } from '../utils';
import { TRANSLATIONS } from '../constants/translations';

const RootContext = createContext();

export const RootProvider = ({ children }) => {
  const [language, setLanguage] = useStickyState(getSystemLanguage(), "app_language_v1");
  const [themeMode, setThemeMode] = useStickyState("system", "app_theme_mode_v1");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const t = (key, params = {}) => {
    let str = TRANSLATIONS[language]?.[key] || key;
    Object.keys(params).forEach(k => {
        str = str.replace(`{{${k}}}`, params[k]);
    });
    return str;
  };

  useEffect(() => {
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => setIsDarkMode(e.matches);
      setIsDarkMode(mediaQuery.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setIsDarkMode(themeMode === 'dark');
    }
  }, [themeMode]);

  return (
    <RootContext.Provider value={{ 
      language, setLanguage, 
      themeMode, setThemeMode, 
      isDarkMode, t 
    }}>
      {children}
    </RootContext.Provider>
  );
};

export const useRootContext = () => useContext(RootContext);
