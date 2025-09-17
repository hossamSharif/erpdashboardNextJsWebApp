'use client';

import { useTranslation } from 'react-i18next';
import { useCallback, useMemo } from 'react';
import type { Language } from '@multi-shop/shared/types/i18n';

/**
 * Enhanced translation hook with type safety and utilities
 */
export function useTranslations(namespace?: string) {
  const { t, i18n } = useTranslation(namespace);

  const currentLanguage = i18n.language as Language;
  const isArabic = currentLanguage === 'ar';
  const isRTL = isArabic;

  // Type-safe translation function with fallback
  const translate = useCallback((
    key: string,
    options?: {
      defaultValue?: string;
      count?: number;
      context?: string;
      [key: string]: any;
    }
  ): string => {
    try {
      const translation = t(key, options);

      // In development, warn about missing translations
      if (process.env.NODE_ENV === 'development' && translation === key && !options?.defaultValue) {
        console.warn(`Missing translation: ${namespace ? `${namespace}:` : ''}${key}`);
      }

      return translation;
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error);
      return options?.defaultValue || key;
    }
  }, [t, namespace]);

  // Pluralization helper
  const translatePlural = useCallback((
    key: string,
    count: number,
    options?: { [key: string]: any }
  ): string => {
    return translate(key, { ...options, count });
  }, [translate]);

  // Context-based translation
  const translateWithContext = useCallback((
    key: string,
    context: string,
    options?: { [key: string]: any }
  ): string => {
    return translate(`${key}_${context}`, {
      ...options,
      defaultValue: translate(key, options)
    });
  }, [translate]);

  // Language switching with persistence
  const switchLanguage = useCallback(async (language: Language) => {
    try {
      await i18n.changeLanguage(language);
      localStorage.setItem('i18nextLng', language);

      // Update document attributes
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';

      return true;
    } catch (error) {
      console.error('Failed to switch language:', error);
      return false;
    }
  }, [i18n]);

  // Get all available languages
  const availableLanguages = useMemo(() => [
    {
      code: 'ar' as const,
      name: 'العربية',
      englishName: 'Arabic',
      direction: 'rtl' as const,
      flag: '🇸🇦'
    },
    {
      code: 'en' as const,
      name: 'English',
      englishName: 'English',
      direction: 'ltr' as const,
      flag: '🇺🇸'
    }
  ], []);

  const currentLanguageInfo = availableLanguages.find(lang => lang.code === currentLanguage);

  return {
    // Translation functions
    t: translate,
    tp: translatePlural,
    tc: translateWithContext,

    // Language info
    language: currentLanguage,
    isArabic,
    isRTL,
    languageInfo: currentLanguageInfo,
    availableLanguages,

    // Language management
    switchLanguage,

    // Utilities
    formatMessage: (template: string, values: Record<string, any>) => {
      return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return values[key] || match;
      });
    },

    // Direction helpers
    getDirectionClass: (rtlClass: string, ltrClass: string = '') => {
      return isRTL ? rtlClass : ltrClass;
    },

    // Raw i18n instance for advanced usage
    i18n,
  };
}

/**
 * Hook for form translations with validation messages
 */
export function useFormTranslations() {
  const { t, language, isArabic } = useTranslations('common');

  return {
    // Common form labels
    labels: {
      name: t('labels.name'),
      description: t('labels.description'),
      email: t('labels.email', { defaultValue: 'Email' }),
      password: t('labels.password', { defaultValue: 'Password' }),
      confirmPassword: t('labels.confirmPassword', { defaultValue: 'Confirm Password' }),
      phone: t('labels.phone', { defaultValue: 'Phone' }),
      address: t('labels.address', { defaultValue: 'Address' }),
      city: t('labels.city', { defaultValue: 'City' }),
      country: t('labels.country', { defaultValue: 'Country' }),
    },

    // Common buttons
    buttons: {
      save: t('buttons.save'),
      cancel: t('buttons.cancel'),
      delete: t('buttons.delete'),
      edit: t('buttons.edit'),
      add: t('buttons.add'),
      submit: t('buttons.submit'),
      back: t('buttons.back'),
      next: t('buttons.next'),
      previous: t('buttons.previous'),
    },

    // Validation messages
    validation: {
      required: t('messages.required'),
      invalidEmail: t('messages.invalidEmail', { defaultValue: 'Invalid email format' }),
      invalidFormat: t('messages.invalidFormat'),
      passwordTooShort: t('messages.passwordTooShort', { defaultValue: 'Password too short' }),
      passwordMismatch: t('messages.passwordMismatch', { defaultValue: 'Passwords do not match' }),
    },

    // Status messages
    status: {
      loading: t('messages.loading'),
      success: t('messages.success'),
      error: t('messages.error'),
      warning: t('messages.warning'),
      info: t('messages.info'),
    },

    // Common statuses
    statuses: {
      active: t('status.active'),
      inactive: t('status.inactive'),
      pending: t('status.pending'),
      completed: t('status.completed'),
      cancelled: t('status.cancelled'),
      draft: t('status.draft'),
    },

    // Utilities
    language,
    isArabic,
    getFieldDirection: () => isArabic ? 'rtl' : 'ltr',
    getPlaceholderText: (label: string) => isArabic ? `أدخل ${label}` : `Enter ${label.toLowerCase()}`,
  };
}

/**
 * Hook for navigation translations
 */
export function useNavigationTranslations() {
  const { t, isArabic } = useTranslations('navigation');

  return {
    menu: {
      dashboard: t('menu.dashboard'),
      inventory: t('menu.inventory'),
      sales: t('menu.sales'),
      purchases: t('menu.purchases'),
      customers: t('menu.customers'),
      suppliers: t('menu.suppliers'),
      reports: t('menu.reports'),
      settings: t('menu.settings'),
      users: t('menu.users'),
      profile: t('menu.profile'),
      logout: t('menu.logout'),
    },

    breadcrumb: {
      home: t('breadcrumb.home'),
      dashboard: t('breadcrumb.dashboard'),
    },

    sections: {
      main: t('sections.main'),
      management: t('sections.management'),
      reports: t('sections.reports'),
      system: t('sections.system'),
    },

    isArabic,
  };
}

/**
 * Hook for authentication translations
 */
export function useAuthTranslations() {
  const { t, isArabic } = useTranslations('auth');

  return {
    login: {
      title: t('login.title'),
      subtitle: t('login.subtitle'),
      email: t('login.email'),
      password: t('login.password'),
      rememberMe: t('login.rememberMe'),
      forgotPassword: t('login.forgotPassword'),
      loginButton: t('login.loginButton'),
      noAccount: t('login.noAccount'),
      signUp: t('login.signUp'),
    },

    register: {
      title: t('register.title'),
      subtitle: t('register.subtitle'),
      firstName: t('register.firstName'),
      lastName: t('register.lastName'),
      email: t('register.email'),
      password: t('register.password'),
      confirmPassword: t('register.confirmPassword'),
      acceptTerms: t('register.acceptTerms'),
      registerButton: t('register.registerButton'),
      haveAccount: t('register.haveAccount'),
      signIn: t('register.signIn'),
    },

    errors: {
      invalidEmail: t('errors.invalidEmail'),
      passwordTooShort: t('errors.passwordTooShort'),
      passwordMismatch: t('errors.passwordMismatch'),
      loginFailed: t('errors.loginFailed'),
      emailExists: t('errors.emailExists'),
      requiredField: t('errors.requiredField'),
    },

    success: {
      loginSuccess: t('success.loginSuccess'),
      registerSuccess: t('success.registerSuccess'),
      resetSent: t('success.resetSent'),
    },

    isArabic,
  };
}