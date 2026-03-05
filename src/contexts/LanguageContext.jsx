import { createContext, useContext, useMemo, useState } from 'react';
import { translations } from '../i18n/translations';

const LANGUAGE_STORAGE_KEY = 'site-language';
const LanguageContext = createContext(null);

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en');

  const changeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  };

  const t = (key) => {
    const selected = getNestedValue(translations[language], key);
    if (selected !== undefined) return selected;

    const fallback = getNestedValue(translations.en, key);
    return fallback !== undefined ? fallback : key;
  };

  const value = useMemo(() => ({ language, changeLanguage, t }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }

  return ctx;
}
