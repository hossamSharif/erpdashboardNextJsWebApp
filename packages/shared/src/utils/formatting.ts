// Re-export formatting utilities for shared use across packages
export * from '../../../../apps/web/src/lib/formatting';

// Additional shared formatting types and constants
export interface FormattingPreferences {
  useArabicNumerals: boolean;
  dateFormat: 'dd/MM/yyyy' | 'MM/dd/yyyy';
  currencyPosition: 'before' | 'after';
  thousandsSeparator: ',' | '.' | ' ';
  decimalSeparator: '.' | ',';
}

export const DEFAULT_FORMATTING_PREFERENCES: FormattingPreferences = {
  useArabicNumerals: false,
  dateFormat: 'dd/MM/yyyy',
  currencyPosition: 'before',
  thousandsSeparator: ',',
  decimalSeparator: '.',
};

export const SUPPORTED_CURRENCIES = [
  { code: 'SAR', symbol: 'ر.س', nameAr: 'ريال سعودي', nameEn: 'Saudi Riyal' },
  { code: 'USD', symbol: '$', nameAr: 'دولار أمريكي', nameEn: 'US Dollar' },
  { code: 'EUR', symbol: '€', nameAr: 'يورو', nameEn: 'Euro' },
  { code: 'AED', symbol: 'د.إ', nameAr: 'درهم إماراتي', nameEn: 'UAE Dirham' },
] as const;