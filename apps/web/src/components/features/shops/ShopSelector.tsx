'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useShopContext } from '../../providers/ShopProvider';
import { useRTL } from '../../layout/rtl-provider';
import { rtlClasses } from '../../../lib/rtl-utils';
import { getShopDisplayName } from '../../../stores/shop.store';

interface ShopSelectorProps {
  compact?: boolean;
  showCreateOption?: boolean;
  onCreateShop?: () => void;
}

export function ShopSelector({
  compact = false,
  showCreateOption = false,
  onCreateShop
}: ShopSelectorProps) {
  const { t } = useTranslation(['shop', 'common']);
  const { isRTL } = useRTL();
  const {
    currentShop,
    availableShops,
    isLoading,
    error,
    switchShop
  } = useShopContext();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleShopSelect = (shopId: string) => {
    switchShop(shopId);
    setIsOpen(false);
  };

  const handleCreateShop = () => {
    setIsOpen(false);
    onCreateShop?.();
  };

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {isRTL ? 'جاري التحميل...' : 'Loading shops...'}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 dark:text-red-400">
        {isRTL ? 'خطأ في تحميل المتاجر' : 'Error loading shops'}
      </div>
    );
  }

  if (availableShops.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {isRTL ? 'لا توجد متاجر متاحة' : 'No shops available'}
        {showCreateOption && onCreateShop && (
          <button
            onClick={onCreateShop}
            className={`text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium ${isRTL ? 'mr-2' : 'ml-2'}`}
          >
            {isRTL ? 'إنشاء متجر' : 'Create shop'}
          </button>
        )}
      </div>
    );
  }

  // If only one shop is available, show it directly
  if (availableShops.length === 1 && !showCreateOption) {
    const shop = availableShops[0];
    return (
      <div className={`flex items-center ${compact ? 'text-sm' : ''} ${rtlClasses.card}`}>
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${shop.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {getShopDisplayName(shop, isRTL)}
            </div>
            {!compact && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {shop.code}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          compact ? 'min-w-0' : 'min-w-48'
        }`}
      >
        <div className={`flex items-center ${compact ? 'space-x-2' : 'space-x-3'} ${isRTL ? 'space-x-reverse' : ''}`}>
          {currentShop ? (
            <>
              <div className={`w-2 h-2 rounded-full ${currentShop.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div className="min-w-0 flex-1">
                <div className={`font-medium text-gray-900 dark:text-white truncate ${rtlClasses.cardHeader}`}>
                  {getShopDisplayName(currentShop, isRTL)}
                </div>
                {!compact && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {currentShop.code}
                  </div>
                )}
              </div>
            </>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">
              {isRTL ? 'اختر متجر' : 'Select shop'}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm ${
          isRTL ? 'right-0' : 'left-0'
        }`}>
          {availableShops.map((shop) => (
            <button
              key={shop.id}
              onClick={() => handleShopSelect(shop.id)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 ${
                currentShop?.id === shop.id ? 'bg-blue-50 dark:bg-blue-900/50' : ''
              } ${rtlClasses.formInput}`}
            >
              <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                <div className={`w-2 h-2 rounded-full ${shop.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div className="min-w-0 flex-1">
                  <div className={`font-medium text-gray-900 dark:text-white truncate ${rtlClasses.cardHeader}`}>
                    {getShopDisplayName(shop, isRTL)}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{shop.code}</span>
                    <span>•</span>
                    <span>
                      {shop.users.length} {isRTL ? 'مستخدم' : 'users'}
                    </span>
                  </div>
                </div>
                {currentShop?.id === shop.id && (
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          ))}

          {showCreateOption && onCreateShop && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
              <button
                onClick={handleCreateShop}
                className={`w-full text-left px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 ${rtlClasses.formInput}`}
              >
                <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-medium">
                    {isRTL ? 'إنشاء متجر جديد' : 'Create new shop'}
                  </span>
                </div>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}