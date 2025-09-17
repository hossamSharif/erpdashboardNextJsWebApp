import { useTranslation } from 'react-i18next';
import type {
  Language,
  TranslationFile,
  ValidationResult,
  LanguageDetectionResult,
  TranslationMetadata
} from '@multi-shop/shared/types/i18n';

/**
 * Translation utility functions
 */

// Get all translation keys from a nested object
export function getAllTranslationKeys(obj: TranslationFile, prefix = ''): string[] {
  const keys: string[] = [];

  Object.keys(obj).forEach(key => {
    const currentPath = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...getAllTranslationKeys(obj[key], currentPath));
    } else {
      keys.push(currentPath);
    }
  });

  return keys;
}

// Validate translation completeness
export function validateTranslations(
  sourceTranslations: TranslationFile,
  targetTranslations: TranslationFile
): ValidationResult {
  const sourceKeys = getAllTranslationKeys(sourceTranslations);
  const targetKeys = getAllTranslationKeys(targetTranslations);

  const missingKeys = sourceKeys.filter(key => !targetKeys.includes(key));
  const extraKeys = targetKeys.filter(key => !sourceKeys.includes(key));

  const errors: string[] = [];

  // Check for empty values
  const checkEmptyValues = (obj: TranslationFile, prefix = '') => {
    Object.keys(obj).forEach(key => {
      const currentPath = prefix ? `${prefix}.${key}` : key;

      if (typeof obj[key] === 'object' && obj[key] !== null) {
        checkEmptyValues(obj[key], currentPath);
      } else if (!obj[key] || obj[key].toString().trim() === '') {
        errors.push(`Empty value for key: ${currentPath}`);
      }
    });
  };

  checkEmptyValues(targetTranslations);

  return {
    isValid: missingKeys.length === 0 && errors.length === 0,
    missingKeys,
    extraKeys,
    errors,
  };
}

// Calculate translation completeness percentage
export function calculateCompleteness(
  sourceTranslations: TranslationFile,
  targetTranslations: TranslationFile
): number {
  const sourceKeys = getAllTranslationKeys(sourceTranslations);
  const targetKeys = getAllTranslationKeys(targetTranslations);

  if (sourceKeys.length === 0) return 100;

  const completedKeys = sourceKeys.filter(key => targetKeys.includes(key));
  return Math.round((completedKeys.length / sourceKeys.length) * 100);
}

// Get value from nested translation object using dot notation
export function getNestedValue(obj: TranslationFile, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? current[key] : undefined;
  }, obj);
}

// Set value in nested translation object using dot notation
export function setNestedValue(obj: TranslationFile, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;

  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    return current[key];
  }, obj);

  target[lastKey] = value;
}

// Detect language from browser/localStorage
export function detectLanguage(): LanguageDetectionResult {
  const savedLanguage = localStorage.getItem('i18nextLng') as Language;
  const browserLanguage = navigator.language.toLowerCase();

  let detectedLanguage: Language = 'ar'; // Default to Arabic
  let confidence = 0.5;

  if (savedLanguage && ['ar', 'en'].includes(savedLanguage)) {
    detectedLanguage = savedLanguage;
    confidence = 1.0;
  } else if (browserLanguage.startsWith('ar')) {
    detectedLanguage = 'ar';
    confidence = 0.9;
  } else if (browserLanguage.startsWith('en')) {
    detectedLanguage = 'en';
    confidence = 0.8;
  }

  return {
    detectedLanguage,
    confidence,
    browserLanguage,
    savedLanguage,
  };
}

// Generate translation metadata
export function generateTranslationMetadata(
  language: Language,
  translations: Record<string, TranslationFile>,
  referenceTranslations?: Record<string, TranslationFile>
): TranslationMetadata {
  let totalCompleteness = 100;

  if (referenceTranslations) {
    const namespaces = Object.keys(translations);
    const completenessScores = namespaces.map(ns => {
      if (!referenceTranslations[ns]) return 100;
      return calculateCompleteness(referenceTranslations[ns], translations[ns]);
    });

    totalCompleteness = Math.round(
      completenessScores.reduce((sum, score) => sum + score, 0) / completenessScores.length
    );
  }

  return {
    language,
    locale: language === 'ar' ? 'ar-SA' : 'en-US',
    direction: language === 'ar' ? 'rtl' : 'ltr',
    completeness: totalCompleteness,
    lastUpdated: new Date().toISOString(),
    version: '1.0.0',
  };
}

// Export translations to downloadable JSON
export function exportTranslations(
  translations: Record<string, TranslationFile>,
  language: Language
): void {
  const dataStr = JSON.stringify(translations, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `translations-${language}.json`;
  link.click();
}

// Import translations from file
export function importTranslations(file: File): Promise<Record<string, TranslationFile>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const translations = JSON.parse(content);
        resolve(translations);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Translation hook with enhanced functionality
export function useTranslationHelpers() {
  const { t, i18n } = useTranslation();

  const translate = (key: string, options?: any): string => {
    const translation = t(key, options);

    // Return key if translation is missing (for development)
    if (translation === key && process.env.NODE_ENV === 'development') {
      console.warn(`Missing translation for key: ${key}`);
    }

    return translation;
  };

  const translateWithFallback = (key: string, fallback: string, options?: any): string => {
    const translation = t(key, { ...options, defaultValue: fallback });
    return translation;
  };

  const getCurrentLanguage = (): Language => {
    return i18n.language as Language;
  };

  const isRTL = (): boolean => {
    return getCurrentLanguage() === 'ar';
  };

  const switchLanguage = (language: Language): Promise<any> => {
    return i18n.changeLanguage(language);
  };

  return {
    t: translate,
    tf: translateWithFallback,
    language: getCurrentLanguage(),
    isRTL: isRTL(),
    switchLanguage,
    i18n,
  };
}

// Translation key validator for development
export function validateTranslationKey(key: string, namespace?: string): boolean {
  // Check if key follows the correct pattern
  const keyPattern = /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)*$/;

  if (!keyPattern.test(key)) {
    console.warn(`Invalid translation key format: ${key}`);
    return false;
  }

  // Check namespace if provided
  if (namespace && !key.startsWith(`${namespace}.`)) {
    console.warn(`Translation key ${key} doesn't match namespace ${namespace}`);
    return false;
  }

  return true;
}

// Generate TypeScript types from translation files
export function generateTypesFromTranslations(
  translations: Record<string, TranslationFile>
): string {
  const generateInterface = (obj: TranslationFile, interfaceName: string): string => {
    let interfaceStr = `export interface ${interfaceName} {\n`;

    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        const nestedInterfaceName = `${interfaceName}${key.charAt(0).toUpperCase() + key.slice(1)}`;
        interfaceStr += `  ${key}: ${nestedInterfaceName};\n`;
      } else {
        interfaceStr += `  ${key}: string;\n`;
      }
    });

    interfaceStr += '}\n\n';
    return interfaceStr;
  };

  let typesStr = '// Auto-generated translation types\n\n';

  Object.keys(translations).forEach(namespace => {
    const interfaceName = `${namespace.charAt(0).toUpperCase() + namespace.slice(1)}Translations`;
    typesStr += generateInterface(translations[namespace], interfaceName);
  });

  return typesStr;
}