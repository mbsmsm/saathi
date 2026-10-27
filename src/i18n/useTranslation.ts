import { useState, useEffect } from 'react';
import type { Language } from './translations';
import { translations } from './translations';

const LANG_KEY = 'saathi_language';

export function getLanguage(): Language {
  const stored = localStorage.getItem(LANG_KEY) as Language | null;
  if (stored && ['en', 'hi', 'ml'].includes(stored)) return stored;
  return 'en';
}

export function setLanguage(lang: Language) {
  localStorage.setItem(LANG_KEY, lang);
}

export function useTranslation() {
  const [language, setLang] = useState<Language>(getLanguage());

  useEffect(() => {
    const handler = () => setLang(getLanguage());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const t = (key: string) => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || entry.en;
  };

  return { language, t };
}

