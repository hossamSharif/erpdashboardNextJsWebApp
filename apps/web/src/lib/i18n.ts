import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources - dynamically loaded for App Router
const resources = {
  ar: {
    common: {},
    navigation: {},
    auth: {},
  },
  en: {
    common: {},
    navigation: {},
    auth: {},
  },
};

// Function to load translation resources
export const loadResources = async () => {
  try {
    // Load Arabic translations
    const [arCommon, arNavigation, arAuth] = await Promise.all([
      fetch('/locales/ar/common.json').then(res => res.json()),
      fetch('/locales/ar/navigation.json').then(res => res.json()),
      fetch('/locales/ar/auth.json').then(res => res.json()),
    ]);

    // Load English translations
    const [enCommon, enNavigation, enAuth] = await Promise.all([
      fetch('/locales/en/common.json').then(res => res.json()),
      fetch('/locales/en/navigation.json').then(res => res.json()),
      fetch('/locales/en/auth.json').then(res => res.json()),
    ]);

    resources.ar.common = arCommon;
    resources.ar.navigation = arNavigation;
    resources.ar.auth = arAuth;
    resources.en.common = enCommon;
    resources.en.navigation = enNavigation;
    resources.en.auth = enAuth;

    // Add resources to i18n
    Object.keys(resources).forEach(lng => {
      Object.keys(resources[lng as keyof typeof resources]).forEach(ns => {
        i18n.addResourceBundle(lng, ns, resources[lng as keyof typeof resources][ns as keyof typeof resources.ar]);
      });
    });
  } catch (error) {
    console.error('Failed to load translation resources:', error);
  }
};

// RTL languages list
export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

// Check if language is RTL
export const isRTL = (language: string): boolean => {
  return RTL_LANGUAGES.includes(language);
};

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar', // Arabic as default language
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'navigation', 'auth'],

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    // Language detection configuration
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    // React specific options
    react: {
      useSuspense: false,
    },
  });

export default i18n;