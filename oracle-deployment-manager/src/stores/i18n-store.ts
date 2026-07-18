import { create } from 'zustand';
import type { Locale } from '@/lib/i18n';

type TranslationMap = Record<string, any>;

interface I18nState {
  locale: Locale;
  translations: Record<string, TranslationMap>;
  loadedLocales: Set<string>;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  loadTranslations: (locale: Locale) => Promise<void>;
}

function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    current = current[key];
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(str: string, params: Record<string, string | number>): string {
  return str.replace(/\{(\w+)\}/g, (_, key) => {
    return key in params ? String(params[key]) : `{${key}}`;
  });
}

export const useI18nStore = create<I18nState>((set, get) => ({
  locale: 'ar',
  translations: {},
  loadedLocales: new Set(),

  setLocale: (locale: Locale) => {
    set({ locale });
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-locale', locale);
      document.cookie = `locale=${locale};path=/;max-age=31536000;SameSite=Lax`;
    }
  },

  t: (key: string, params?: Record<string, string | number>): string => {
    const { locale, translations } = get();
    const localeTranslations = translations[locale] || {};

    let value = getNestedValue(localeTranslations, key);
    if (value === undefined) {
      const enTranslations = translations['en'] || {};
      value = getNestedValue(enTranslations, key);
    }
    if (value === undefined) {
      return key;
    }
    if (params) {
      return interpolate(value, params);
    }
    return value;
  },

  loadTranslations: async (locale: Locale) => {
    const { loadedLocales } = get();
    if (loadedLocales.has(locale)) return;

    try {
      const [common, deployment, settings] = await Promise.all([
        fetch(`/locales/${locale}/common.json`).then((r) => r.json()),
        fetch(`/locales/${locale}/deployment.json`).then((r) => r.json()),
        fetch(`/locales/${locale}/settings.json`).then((r) => r.json()),
      ]);

      set((state) => ({
        translations: {
          ...state.translations,
          [locale]: { ...common, deployment, settings },
        },
        loadedLocales: new Set([...state.loadedLocales, locale]),
      }));
    } catch (error) {
      console.error(`Failed to load translations for ${locale}:`, error);
    }
  },
}));
