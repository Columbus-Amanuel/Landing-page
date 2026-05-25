import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import enTranslations from '../i18n/en/translations.json';
import amTranslations from '../i18n/am/translations.json';

const LANGUAGE_STORAGE_KEY = 'site-language';
const LanguageContext = createContext(null);

const translations = {
  en: enTranslations,
  am: amTranslations,
};

const SUPPORTED_LANGUAGES = ['en', 'am'];

function getNestedValue(obj, path) {
  return path
    .split('.')
    .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === 'undefined') return 'en';
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return SUPPORTED_LANGUAGES.includes(stored) ? stored : 'en';
  });

  const changeLanguage = useCallback((nextLanguage) => {
    if (!SUPPORTED_LANGUAGES.includes(nextLanguage)) return;
    setLanguage(nextLanguage);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }, []);

  /** Resolve a dotted translation key, falling back: am → en → raw key. */
  const t = useCallback(
    (key) => {
      const selected = getNestedValue(translations[language], key);
      if (selected !== undefined) return selected;
      const fallback = getNestedValue(translations.en, key);
      return fallback !== undefined ? fallback : key;
    },
    [language],
  );

  /**
   * Read a bilingual field from a CMS document. Looks at `${field}Am` when
   * Amharic is active and falls back to `field` otherwise — the canonical
   * pattern used everywhere bilingual data exists.
   *
   * @example
   *   const title = pickLocalized(event, 'title')
   */
  const pickLocalized = useCallback(
    (obj, field) => {
      if (!obj || !field) return '';
      if (language === 'am' && obj[`${field}Am`]) return obj[`${field}Am`];
      return obj[field] ?? obj[`${field}En`] ?? '';
    },
    [language],
  );

  const value = useMemo(
    () => ({ language, changeLanguage, t, pickLocalized, isAmharic: language === 'am' }),
    [language, changeLanguage, t, pickLocalized],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return ctx;
}

/**
 * Convenience hook that returns just the bilingual picker. Useful when a
 * component doesn't need `t` or `language` directly.
 *
 * @example
 *   const localized = useLocalized()
 *   const title = localized(event, 'title')
 */
export function useLocalized() {
  return useLanguage().pickLocalized;
}
