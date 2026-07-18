'use client';

import { useI18nStore } from '@/stores/i18n-store';
import { LOCALES, isRTL, formatDate, formatTime, formatNumber, formatBytes, type Locale } from '@/lib/i18n';

export function useLocale() {
  const { locale, setLocale, t, loadTranslations, translations } = useI18nStore();

  const localeInfo = LOCALES[locale];
  const dir = isRTL(locale) ? 'rtl' as const : 'ltr' as const;

  return {
    locale,
    setLocale,
    t,
    dir,
    localeInfo,
    isRTL: isRTL(locale),
    formatDate: (date: Date) => formatDate(date, locale),
    formatTime: (date: Date) => formatTime(date, locale),
    formatNumber: (num: number) => formatNumber(num, locale),
    formatBytes: (bytes: number) => formatBytes(bytes, locale),
    loadTranslations,
    translations,
  };
}
