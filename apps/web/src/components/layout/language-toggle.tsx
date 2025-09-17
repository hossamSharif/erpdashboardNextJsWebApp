'use client';

import { useTranslation } from 'react-i18next';
import { useRTL } from './rtl-provider';
import { useState, useRef, useEffect } from 'react';
import { rtlClasses } from '../../lib/rtl-utils';

interface LanguageOption {
  code: 'ar' | 'en';
  name: string;
  nativeName: string;
  flag: string;
  direction: 'rtl' | 'ltr';
}

const languages: LanguageOption[] = [
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
  },
];

interface LanguageToggleProps {
  variant?: 'simple' | 'dropdown';
  showLabel?: boolean;
  className?: string;
}

export function LanguageToggle({
  variant = 'simple',
  showLabel = true,
  className = ''
}: LanguageToggleProps) {
  const { i18n } = useTranslation();
  const { isRTL } = useRTL();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (variant === 'simple') {
    return (
      <button
        onClick={toggleLanguage}
        className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-all duration-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${rtlClasses.buttonWithIcon} ${className}`}
        aria-label={`Switch to ${i18n.language === 'ar' ? 'English' : 'Arabic'}`}
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        {showLabel && (
          <span className={`font-medium ${i18n.language === 'ar' ? 'font-arabic' : ''}`}>
            {currentLanguage.nativeName}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-all duration-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${rtlClasses.buttonWithIcon}`}
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        {showLabel && (
          <span className={`font-medium ${i18n.language === 'ar' ? 'font-arabic' : ''}`}>
            {currentLanguage.nativeName}
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${rtlClasses.buttonIcon}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 ${rtlClasses.dropdown}`}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  currentLanguage.code === language.code
                    ? 'bg-gray-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-200'
                } ${rtlClasses.sidebarItem}`}
                role="menuitem"
              >
                <span className="text-lg">{language.flag}</span>
                <div className={`flex flex-col items-start ${rtlClasses.formLabel}`}>
                  <span className={`font-medium ${language.code === 'ar' ? 'font-arabic' : ''}`}>
                    {language.nativeName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {language.name}
                  </span>
                </div>
                {currentLanguage.code === language.code && (
                  <svg
                    className={`w-4 h-4 text-blue-600 dark:text-blue-400 ${isRTL ? 'mr-auto' : 'ml-auto'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}