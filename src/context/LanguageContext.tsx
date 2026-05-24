import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { detectLocale, translate, type Locale } from '../i18n';
import type { ExpenseCategory } from '../types/finance';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  categoryLabel: (category: ExpenseCategory | 'All') => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = 'fintrack-locale';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved === 'es' || saved === 'en') return saved;
    } catch {
      /* ignore */
    }
    return detectLocale();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => setLocaleState(next), []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => (prev === 'es' ? 'en' : 'es'));
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(locale, key, params),
    [locale]
  );

  const categoryLabel = useCallback(
    (category: ExpenseCategory | 'All') => t(`categories.${category}`),
    [t]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale, t, categoryLabel }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
