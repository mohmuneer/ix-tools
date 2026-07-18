export type Locale = 'ar' | 'en' | 'fr' | 'de' | 'es' | 'tr';

export interface LocaleInfo {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
  dateFormat: string;
  timeFormat: string;
  numberFormat: Intl.NumberFormatOptions;
  currencyFormat: Intl.NumberFormatOptions;
}

export const LOCALES: Record<Locale, LocaleInfo> = {
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    dir: 'rtl',
    dateFormat: 'dd MMMM yyyy',
    timeFormat: 'HH:mm',
    numberFormat: { style: 'decimal', useGrouping: true },
    currencyFormat: { style: 'currency', currency: 'SAR' },
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    dir: 'ltr',
    dateFormat: 'MMMM dd, yyyy',
    timeFormat: 'hh:mm a',
    numberFormat: { style: 'decimal', useGrouping: true },
    currencyFormat: { style: 'currency', currency: 'USD' },
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    dir: 'ltr',
    dateFormat: 'dd MMMM yyyy',
    timeFormat: 'HH:mm',
    numberFormat: { style: 'decimal', useGrouping: true },
    currencyFormat: { style: 'currency', currency: 'EUR' },
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    dir: 'ltr',
    dateFormat: 'dd. MMMM yyyy',
    timeFormat: 'HH:mm',
    numberFormat: { style: 'decimal', useGrouping: true },
    currencyFormat: { style: 'currency', currency: 'EUR' },
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    dir: 'ltr',
    dateFormat: 'dd MMMM yyyy',
    timeFormat: 'HH:mm',
    numberFormat: { style: 'decimal', useGrouping: true },
    currencyFormat: { style: 'currency', currency: 'EUR' },
  },
  tr: {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    dir: 'ltr',
    dateFormat: 'dd MMMM yyyy',
    timeFormat: 'HH:mm',
    numberFormat: { style: 'decimal', useGrouping: true },
    currencyFormat: { style: 'currency', currency: 'TRY' },
  },
};

export const RTL_LOCALES: Locale[] = ['ar'];

export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

export function formatDate(date: Date, locale: Locale): string {
  const info = LOCALES[locale];
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

export function formatTime(date: Date, locale: Locale): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
}

export function formatNumber(num: number, locale: Locale): string {
  try {
    return new Intl.NumberFormat(locale).format(num);
  } catch {
    return num.toString();
  }
}

export function formatBytes(bytes: number, locale: Locale): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
