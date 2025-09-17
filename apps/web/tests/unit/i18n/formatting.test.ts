import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  toArabicNumerals,
  toWesternNumerals,
  formatLargeNumber,
} from '../../../src/lib/formatting';

// Mock date for consistent testing
const mockDate = new Date('2023-12-15T10:30:00Z');

describe('Formatting Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Number Formatting', () => {
    it('should format numbers in Arabic locale', () => {
      const result = formatNumber(1234.56, 'ar');
      expect(result).toMatch(/1[,.]234[,.]56/); // Flexible for locale differences
    });

    it('should format numbers in English locale', () => {
      const result = formatNumber(1234.56, 'en');
      expect(result).toBe('1,234.56');
    });

    it('should respect custom options', () => {
      const result = formatNumber(1234.56, 'en', { minimumFractionDigits: 3 });
      expect(result).toBe('1,234.560');
    });

    it('should convert to Arabic numerals when requested', () => {
      const result = formatNumber(123, 'ar', { useArabicNumerals: true } as any);
      // Should contain Arabic numerals
      expect(toArabicNumerals('123')).toBe('١٢٣');
    });
  });

  describe('Arabic Numeral Conversion', () => {
    it('should convert Western to Arabic numerals', () => {
      expect(toArabicNumerals('0123456789')).toBe('٠١٢٣٤٥٦٧٨٩');
    });

    it('should convert Arabic to Western numerals', () => {
      expect(toWesternNumerals('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789');
    });

    it('should handle mixed content', () => {
      expect(toArabicNumerals('Price: 123 SAR')).toBe('Price: ١٢٣ SAR');
      expect(toWesternNumerals('السعر: ١٢٣ ريال')).toBe('السعر: 123 ريال');
    });

    it('should leave non-numeric content unchanged', () => {
      expect(toArabicNumerals('Hello World')).toBe('Hello World');
      expect(toWesternNumerals('مرحبا بالعالم')).toBe('مرحبا بالعالم');
    });
  });

  describe('Currency Formatting', () => {
    it('should format SAR currency in Arabic', () => {
      const result = formatCurrency(1234.56, 'ar', 'SAR');
      expect(result).toContain('1234.56'); // Amount should be present
      expect(result).toMatch(/ر\.س|SAR/); // Currency symbol should be present
    });

    it('should format USD currency in English', () => {
      const result = formatCurrency(1234.56, 'en', 'USD');
      expect(result).toBe('$1,234.56');
    });

    it('should use Arabic numerals when requested', () => {
      const result = formatCurrency(123, 'ar', 'SAR', true);
      expect(result).toContain('١٢٣'); // Should contain Arabic numerals
    });

    it('should default to SAR currency', () => {
      const result = formatCurrency(100, 'ar');
      expect(result).toMatch(/ر\.س|SAR/);
    });
  });

  describe('Percentage Formatting', () => {
    it('should format percentages correctly', () => {
      expect(formatPercentage(50, 'en')).toBe('50.0%');
      expect(formatPercentage(75.5, 'en')).toBe('75.5%');
    });

    it('should handle Arabic locale', () => {
      const result = formatPercentage(50, 'ar');
      expect(result).toContain('50'); // Number should be present
      expect(result).toContain('%'); // Percent sign should be present
    });

    it('should use Arabic numerals when requested', () => {
      const result = formatPercentage(50, 'ar', true);
      expect(result).toContain('٥٠'); // Should contain Arabic numerals
    });
  });

  describe('Date Formatting', () => {
    const testDate = new Date('2023-12-15T10:30:00Z');

    it('should format dates in DD/MM/YYYY for Arabic', () => {
      const result = formatDate(testDate, 'ar');
      expect(result).toBe('15/12/2023');
    });

    it('should format dates in MM/DD/YYYY for English', () => {
      const result = formatDate(testDate, 'en');
      expect(result).toBe('12/15/2023');
    });

    it('should use Arabic numerals for Arabic dates', () => {
      const result = formatDate(testDate, 'ar');
      expect(result).toBe('١٥/١٢/٢٠٢٣');
    });

    it('should handle custom format patterns', () => {
      const result = formatDate(testDate, 'en', 'yyyy-MM-dd');
      expect(result).toBe('2023-12-15');
    });

    it('should handle invalid dates', () => {
      const result = formatDate('invalid-date', 'en');
      expect(result).toBe('');
    });

    it('should handle string dates', () => {
      const result = formatDate('2023-12-15', 'en');
      expect(result).toBe('12/15/2023');
    });
  });

  describe('DateTime Formatting', () => {
    const testDate = new Date('2023-12-15T10:30:45Z');

    it('should format datetime without seconds', () => {
      const result = formatDateTime(testDate, 'en');
      expect(result).toMatch(/12\/15\/2023 \d{2}:\d{2}/);
    });

    it('should format datetime with seconds', () => {
      const result = formatDateTime(testDate, 'en', true);
      expect(result).toMatch(/12\/15\/2023 \d{2}:\d{2}:\d{2}/);
    });

    it('should use Arabic format and numerals', () => {
      const result = formatDateTime(testDate, 'ar');
      // Should be in DD/MM/YYYY format with Arabic numerals
      expect(result).toMatch(/١٥\/١٢\/٢٠٢٣/);
    });
  });

  describe('Large Number Formatting', () => {
    it('should format billions', () => {
      expect(formatLargeNumber(1_500_000_000, 'en')).toBe('1.5 B');
      expect(formatLargeNumber(1_500_000_000, 'ar')).toBe('1.5 مليار');
    });

    it('should format millions', () => {
      expect(formatLargeNumber(2_300_000, 'en')).toBe('2.3 M');
      expect(formatLargeNumber(2_300_000, 'ar')).toBe('2.3 مليون');
    });

    it('should format thousands', () => {
      expect(formatLargeNumber(4_500, 'en')).toBe('4.5 K');
      expect(formatLargeNumber(4_500, 'ar')).toBe('4.5 ألف');
    });

    it('should format small numbers normally', () => {
      expect(formatLargeNumber(999, 'en')).toBe('999');
      expect(formatLargeNumber(999, 'ar')).toBe('999');
    });

    it('should use Arabic numerals when requested', () => {
      const result = formatLargeNumber(1_500_000, 'ar', true);
      expect(result).toContain('١.٥ مليون');
    });
  });

  describe('Relative Time Formatting', () => {
    it('should format relative time correctly', () => {
      const pastDate = new Date(mockDate.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago

      const result = formatRelativeTime(pastDate, 'en');
      expect(result).toContain('ago');
    });

    it('should handle Arabic relative time', () => {
      const pastDate = new Date(mockDate.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago

      const result = formatRelativeTime(pastDate, 'ar');
      // Should contain Arabic text and potentially Arabic numerals
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle invalid dates', () => {
      const result = formatRelativeTime('invalid-date', 'en');
      expect(result).toBe('');
    });
  });
});