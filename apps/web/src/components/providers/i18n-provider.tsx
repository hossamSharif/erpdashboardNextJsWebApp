'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { loadResources, isRTL } from '../../lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeI18n = async () => {
      await loadResources();
      setIsInitialized(true);
    };

    initializeI18n();
  }, []);

  useEffect(() => {
    // Update document direction when language changes
    const updateDirection = () => {
      const currentLang = i18n.language;
      const direction = isRTL(currentLang) ? 'rtl' : 'ltr';
      document.documentElement.dir = direction;
      document.documentElement.lang = currentLang;
    };

    // Set initial direction
    updateDirection();

    // Listen for language changes
    i18n.on('languageChanged', updateDirection);

    return () => {
      i18n.off('languageChanged', updateDirection);
    };
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}