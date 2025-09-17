'use client';

import { useTranslation } from 'react-i18next';
import { LanguageToggle } from './language-toggle';
import { rtlClasses } from '../../lib/rtl-utils';
import { useRTL } from './rtl-provider';

interface HeaderProps {
  title?: string;
  showLanguageToggle?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function Header({
  title,
  showLanguageToggle = true,
  className = '',
  children
}: HeaderProps) {
  const { t } = useTranslation('navigation');
  const { isRTL } = useRTL();

  return (
    <header className={`bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center h-16 ${rtlClasses.navbar}`}>
          {/* Left side - Title */}
          <div className={`flex items-center ${rtlClasses.cardHeader}`}>
            {title && (
              <h1 className={`text-xl font-semibold text-gray-900 dark:text-white ${isRTL ? 'font-arabic-display' : ''}`}>
                {title}
              </h1>
            )}
          </div>

          {/* Center - Children */}
          {children && (
            <div className="flex-1 flex justify-center">
              {children}
            </div>
          )}

          {/* Right side - Controls */}
          <div className={`flex items-center gap-4 ${rtlClasses.navbar}`}>
            {showLanguageToggle && (
              <LanguageToggle variant="simple" showLabel={false} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}