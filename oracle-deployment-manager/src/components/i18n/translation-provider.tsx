'use client';

import { useEffect } from 'react';
import { useLocale } from '@/hooks/use-locale';
import type { Locale } from '@/lib/i18n';

const DEFAULT_LOCALE: Locale = 'ar';

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const { locale, setLocale, loadTranslations, dir } = useLocale();

  useEffect(() => {
    const saved = localStorage.getItem('app-locale') as Locale | null;
    if (saved && LOCALES_MAP[saved]) {
      setLocale(saved);
    }
    loadTranslations(DEFAULT_LOCALE);
  }, []);

  useEffect(() => {
    loadTranslations(locale);
  }, [locale, loadTranslations]);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
    document.cookie = `locale=${locale};path=/;max-age=31536000;SameSite=Lax`;
    if (dir === 'rtl') {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }
  }, [dir, locale]);

  return <>{children}</>;
}

const LOCALES_MAP: Record<string, boolean> = { ar: true, en: true, fr: true, de: true, es: true, tr: true };
