import { format, parseISO, formatDistanceToNow, isValid } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// Arabic-Indic numerals mapping
const arabicNumerals: { [key: string]: string } = {
  '0': '٠',
  '1': '١',
  '2': '٢',
  '3': '٣',
  '4': '٤',
  '5': '٥',
  '6': '٦',
  '7': '٧',
  '8': '٨',
  '9': '٩',
};

// Convert Arabic-Indic to Western numerals
const westernNumerals: { [key: string]: string } = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
};

/**
 * Convert Western numerals to Arabic-Indic numerals
 */
export function toArabicNumerals(text: string): string {
  return text.replace(/[0-9]/g, (digit) => arabicNumerals[digit] || digit);
}

/**
 * Convert Arabic-Indic numerals to Western numerals
 */
export function toWesternNumerals(text: string): string {
  return text.replace(/[٠-٩]/g, (digit) => westernNumerals[digit] || digit);
}

/**
 * Format number with proper locale-specific numerals
 */
export function formatNumber(
  value: number,
  language: 'ar' | 'en',
  options?: Intl.NumberFormatOptions
): string {
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';

  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    ...options,
  }).format(value);

  // For Arabic, optionally use Arabic-Indic numerals
  if (language === 'ar' && options?.useArabicNumerals) {
    return toArabicNumerals(formatted);
  }

  return formatted;
}

/**
 * Format currency with proper locale
 */
export function formatCurrency(
  value: number,
  language: 'ar' | 'en',
  currency: string = 'SAR',
  useArabicNumerals: boolean = false
): string {
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';

  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  // For Arabic, optionally use Arabic-Indic numerals
  if (language === 'ar' && useArabicNumerals) {
    return toArabicNumerals(formatted);
  }

  return formatted;
}

/**
 * Format percentage with proper locale
 */
export function formatPercentage(
  value: number,
  language: 'ar' | 'en',
  useArabicNumerals: boolean = false
): string {
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';

  const formatted = new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100);

  if (language === 'ar' && useArabicNumerals) {
    return toArabicNumerals(formatted);
  }

  return formatted;
}

/**
 * Format date with DD/MM/YYYY format for Arabic and MM/DD/YYYY for English
 */
export function formatDate(
  date: Date | string,
  language: 'ar' | 'en',
  formatPattern?: string
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (!isValid(dateObj)) {
    return '';
  }

  const locale = language === 'ar' ? ar : enUS;
  const defaultPattern = language === 'ar' ? 'dd/MM/yyyy' : 'MM/dd/yyyy';

  const formatted = format(dateObj, formatPattern || defaultPattern, { locale });

  // For Arabic, optionally use Arabic-Indic numerals
  if (language === 'ar') {
    return toArabicNumerals(formatted);
  }

  return formatted;
}

/**
 * Format date and time together
 */
export function formatDateTime(
  date: Date | string,
  language: 'ar' | 'en',
  includeSeconds: boolean = false
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (!isValid(dateObj)) {
    return '';
  }

  const locale = language === 'ar' ? ar : enUS;
  const timePattern = includeSeconds ? 'HH:mm:ss' : 'HH:mm';
  const datePattern = language === 'ar' ? 'dd/MM/yyyy' : 'MM/dd/yyyy';

  const formatted = format(dateObj, `${datePattern} ${timePattern}`, { locale });

  if (language === 'ar') {
    return toArabicNumerals(formatted);
  }

  return formatted;
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: Date | string,
  language: 'ar' | 'en'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (!isValid(dateObj)) {
    return '';
  }

  const locale = language === 'ar' ? ar : enUS;
  const formatted = formatDistanceToNow(dateObj, {
    addSuffix: true,
    locale,
  });

  if (language === 'ar') {
    return toArabicNumerals(formatted);
  }

  return formatted;
}

/**
 * Format time only
 */
export function formatTime(
  date: Date | string,
  language: 'ar' | 'en',
  includeSeconds: boolean = false
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (!isValid(dateObj)) {
    return '';
  }

  const locale = language === 'ar' ? ar : enUS;
  const pattern = includeSeconds ? 'HH:mm:ss' : 'HH:mm';

  const formatted = format(dateObj, pattern, { locale });

  if (language === 'ar') {
    return toArabicNumerals(formatted);
  }

  return formatted;
}

/**
 * Format month and year
 */
export function formatMonthYear(
  date: Date | string,
  language: 'ar' | 'en'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (!isValid(dateObj)) {
    return '';
  }

  const locale = language === 'ar' ? ar : enUS;
  const formatted = format(dateObj, 'MMMM yyyy', { locale });

  if (language === 'ar') {
    return toArabicNumerals(formatted);
  }

  return formatted;
}

/**
 * Parse date input that might contain Arabic-Indic numerals
 */
export function parseArabicDate(dateString: string): Date | null {
  const westernDateString = toWesternNumerals(dateString);
  const parsed = parseISO(westernDateString);
  return isValid(parsed) ? parsed : null;
}

/**
 * Custom format patterns for different use cases
 */
export const dateFormats = {
  short: {
    ar: 'dd/MM/yy',
    en: 'MM/dd/yy',
  },
  medium: {
    ar: 'dd/MM/yyyy',
    en: 'MM/dd/yyyy',
  },
  long: {
    ar: 'dd MMMM yyyy',
    en: 'MMMM dd, yyyy',
  },
  full: {
    ar: 'EEEE، dd MMMM yyyy',
    en: 'EEEE, MMMM dd, yyyy',
  },
  monthDay: {
    ar: 'dd MMMM',
    en: 'MMMM dd',
  },
  yearMonth: {
    ar: 'MMMM yyyy',
    en: 'MMMM yyyy',
  },
} as const;

/**
 * Format date with predefined pattern
 */
export function formatDateWithPattern(
  date: Date | string,
  pattern: keyof typeof dateFormats,
  language: 'ar' | 'en'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;

  if (!isValid(dateObj)) {
    return '';
  }

  const locale = language === 'ar' ? ar : enUS;
  const formatPattern = dateFormats[pattern][language];

  const formatted = format(dateObj, formatPattern, { locale });

  if (language === 'ar') {
    return toArabicNumerals(formatted);
  }

  return formatted;
}

/**
 * Number formatting with Arabic thousand separators
 */
export function formatLargeNumber(
  value: number,
  language: 'ar' | 'en',
  useArabicNumerals: boolean = false
): string {
  if (value >= 1_000_000_000) {
    const billions = value / 1_000_000_000;
    const suffix = language === 'ar' ? 'مليار' : 'B';
    const formatted = `${formatNumber(billions, language, { maximumFractionDigits: 1 })} ${suffix}`;
    return useArabicNumerals && language === 'ar' ? toArabicNumerals(formatted) : formatted;
  }

  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    const suffix = language === 'ar' ? 'مليون' : 'M';
    const formatted = `${formatNumber(millions, language, { maximumFractionDigits: 1 })} ${suffix}`;
    return useArabicNumerals && language === 'ar' ? toArabicNumerals(formatted) : formatted;
  }

  if (value >= 1_000) {
    const thousands = value / 1_000;
    const suffix = language === 'ar' ? 'ألف' : 'K';
    const formatted = `${formatNumber(thousands, language, { maximumFractionDigits: 1 })} ${suffix}`;
    return useArabicNumerals && language === 'ar' ? toArabicNumerals(formatted) : formatted;
  }

  return formatNumber(value, language, { useArabicNumerals });
}

// Extend the global Intl interface to include useArabicNumerals
declare global {
  namespace Intl {
    interface NumberFormatOptions {
      useArabicNumerals?: boolean;
    }
  }
}