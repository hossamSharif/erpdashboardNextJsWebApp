'use client';

import { useTranslation } from 'react-i18next';
import {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatTime,
  formatMonthYear,
  formatDateWithPattern,
  formatLargeNumber,
  dateFormats,
  toArabicNumerals,
  toWesternNumerals,
} from '../lib/formatting';

/**
 * Hook for number and date formatting with current language context
 */
export function useFormatting() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as 'ar' | 'en';

  return {
    // Number formatters
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
      formatNumber(value, currentLanguage, options),

    formatCurrency: (value: number, currency?: string, useArabicNumerals?: boolean) =>
      formatCurrency(value, currentLanguage, currency, useArabicNumerals),

    formatPercentage: (value: number, useArabicNumerals?: boolean) =>
      formatPercentage(value, currentLanguage, useArabicNumerals),

    formatLargeNumber: (value: number, useArabicNumerals?: boolean) =>
      formatLargeNumber(value, currentLanguage, useArabicNumerals),

    // Date formatters
    formatDate: (date: Date | string, pattern?: string) =>
      formatDate(date, currentLanguage, pattern),

    formatDateTime: (date: Date | string, includeSeconds?: boolean) =>
      formatDateTime(date, currentLanguage, includeSeconds),

    formatRelativeTime: (date: Date | string) =>
      formatRelativeTime(date, currentLanguage),

    formatTime: (date: Date | string, includeSeconds?: boolean) =>
      formatTime(date, currentLanguage, includeSeconds),

    formatMonthYear: (date: Date | string) =>
      formatMonthYear(date, currentLanguage),

    formatDateWithPattern: (date: Date | string, pattern: keyof typeof dateFormats) =>
      formatDateWithPattern(date, pattern, currentLanguage),

    // Numeral converters
    toArabicNumerals,
    toWesternNumerals,

    // Current language
    language: currentLanguage,
    isArabic: currentLanguage === 'ar',
  };
}

/**
 * Hook for currency formatting with predefined settings
 */
export function useCurrency(defaultCurrency: string = 'SAR') {
  const { formatCurrency, language } = useFormatting();

  return {
    formatPrice: (value: number, useArabicNumerals?: boolean) =>
      formatCurrency(value, defaultCurrency, useArabicNumerals),

    formatAmount: (value: number, currency?: string, useArabicNumerals?: boolean) =>
      formatCurrency(value, currency || defaultCurrency, useArabicNumerals),

    getCurrencySymbol: (currency?: string) => {
      const currencyCode = currency || defaultCurrency;
      const locale = language === 'ar' ? 'ar-SA' : 'en-US';

      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
      })
        .formatToParts(0)
        .find(part => part.type === 'currency')?.value || currencyCode;
    },
  };
}

/**
 * Hook for date formatting with common patterns
 */
export function useDateFormatting() {
  const { formatDateWithPattern, formatRelativeTime, language } = useFormatting();

  return {
    // Common date formats
    shortDate: (date: Date | string) => formatDateWithPattern(date, 'short'),
    mediumDate: (date: Date | string) => formatDateWithPattern(date, 'medium'),
    longDate: (date: Date | string) => formatDateWithPattern(date, 'long'),
    fullDate: (date: Date | string) => formatDateWithPattern(date, 'full'),

    // Relative time
    timeAgo: (date: Date | string) => formatRelativeTime(date),

    // Utility
    getDateSeparator: () => (language === 'ar' ? '/' : '/'),
    getDateOrder: () => (language === 'ar' ? 'dd/MM/yyyy' : 'MM/dd/yyyy'),
  };
}

/**
 * Hook for table and data display formatting
 */
export function useDisplayFormatting() {
  const { formatNumber, formatCurrency, formatPercentage, language } = useFormatting();

  return {
    // Table cell formatters
    displayNumber: (value: number | null | undefined, defaultValue: string = '-') =>
      value !== null && value !== undefined ? formatNumber(value) : defaultValue,

    displayCurrency: (
      value: number | null | undefined,
      currency?: string,
      defaultValue: string = '-'
    ) =>
      value !== null && value !== undefined
        ? formatCurrency(value, currency)
        : defaultValue,

    displayPercentage: (value: number | null | undefined, defaultValue: string = '-') =>
      value !== null && value !== undefined ? formatPercentage(value) : defaultValue,

    // Conditional formatting
    displayPositiveNegative: (
      value: number,
      options?: { showPlus?: boolean; currency?: string }
    ) => {
      const prefix = value > 0 && options?.showPlus ? '+' : '';
      const formatted = options?.currency
        ? formatCurrency(Math.abs(value), options.currency)
        : formatNumber(Math.abs(value));

      if (value < 0) {
        return language === 'ar' ? `- ${formatted}` : `-${formatted}`;
      }

      return `${prefix}${formatted}`;
    },

    // Status indicators
    getNumberColor: (value: number) => {
      if (value > 0) return 'text-green-600 dark:text-green-400';
      if (value < 0) return 'text-red-600 dark:text-red-400';
      return 'text-gray-600 dark:text-gray-400';
    },
  };
}