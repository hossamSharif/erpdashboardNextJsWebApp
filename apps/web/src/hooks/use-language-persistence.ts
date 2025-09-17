'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGE_STORAGE_KEY = 'i18nextLng';
const DEFAULT_LANGUAGE = 'ar';

export function useLanguagePersistence() {
  const { i18n } = useTranslation();

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    } else if (!savedLanguage) {
      // Set default language if none is saved
      i18n.changeLanguage(DEFAULT_LANGUAGE);
      localStorage.setItem(LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE);
    }
  }, [i18n]);

  // Save language changes to localStorage
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);

      // Update document attributes
      document.documentElement.lang = lng;
      document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const setLanguage = (language: 'ar' | 'en') => {
    i18n.changeLanguage(language);
  };

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'ar' ? 'en' : 'ar';
    setLanguage(newLanguage);
  };

  return {
    currentLanguage: i18n.language as 'ar' | 'en',
    setLanguage,
    toggleLanguage,
    isRTL: i18n.language === 'ar',
  };
}