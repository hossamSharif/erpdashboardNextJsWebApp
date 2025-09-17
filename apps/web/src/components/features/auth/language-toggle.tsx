'use client';

import { useTranslation } from 'react-i18next';
import { useRTL } from '../../layout/rtl-provider';
import { useState } from 'react';
import { rtlClasses } from '../../../lib/rtl-utils';

interface LanguageOption {
  code: 'ar' | 'en';
  name: string;
  nativeName: string;
  flag: string;
}

const languages: LanguageOption[] = [
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
];

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const { toggleDirection } = useRTL();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: 'ar' | 'en') => {
    i18n.changeLanguage(languageCode);

    // Save to localStorage for persistence
    localStorage.setItem('i18nextLng', languageCode);

    setIsOpen(false);
  };

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'ar' ? 'en' : 'ar';
    handleLanguageChange(newLanguage);
  };

  return (
    <div className="relative">
      {/* Simple Toggle Button */}
      <button
        onClick={toggleLanguage}
        className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-all duration-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${rtlClasses.buttonWithIcon}`}
        aria-label="Toggle language"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className={`font-medium ${i18n.language === 'ar' ? 'font-arabic' : ''}`}>
          {currentLanguage.nativeName}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${rtlClasses.buttonIcon}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
          />
        </svg>
      </button>
    </div>
  );
}