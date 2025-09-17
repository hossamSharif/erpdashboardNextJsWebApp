'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../lib/i18n';

interface RTLContextType {
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
  toggleDirection: () => void;
}

const RTLContext = createContext<RTLContextType | undefined>(undefined);

interface RTLProviderProps {
  children: React.ReactNode;
}

export function RTLProvider({ children }: RTLProviderProps) {
  const { i18n } = useTranslation();
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('rtl');

  useEffect(() => {
    // Update direction when language changes
    const updateDirection = () => {
      const currentDirection = isRTL(i18n.language) ? 'rtl' : 'ltr';
      setDirection(currentDirection);

      // Update document attributes
      document.documentElement.dir = currentDirection;
      document.documentElement.lang = i18n.language;

      // Update body class for Tailwind RTL utilities
      document.body.classList.remove('rtl', 'ltr');
      document.body.classList.add(currentDirection);
    };

    // Set initial direction
    updateDirection();

    // Listen for language changes
    i18n.on('languageChanged', updateDirection);

    return () => {
      i18n.off('languageChanged', updateDirection);
    };
  }, [i18n]);

  const toggleDirection = () => {
    const newDirection = direction === 'rtl' ? 'ltr' : 'rtl';
    const newLanguage = newDirection === 'rtl' ? 'ar' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  const contextValue: RTLContextType = {
    isRTL: direction === 'rtl',
    direction,
    toggleDirection,
  };

  return (
    <RTLContext.Provider value={contextValue}>
      {children}
    </RTLContext.Provider>
  );
}

export function useRTL() {
  const context = useContext(RTLContext);
  if (context === undefined) {
    throw new Error('useRTL must be used within an RTLProvider');
  }
  return context;
}