'use client';

import { useState } from 'react';
import { useAuthStore } from '../../../stores/auth-store';

interface Shop {
  id: string;
  nameAr: string;
  nameEn: string;
}

interface ShopSelectorProps {
  shops: Shop[];
  selectedShopId?: string;
  onChange: (shopId: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export function ShopSelector({
  shops,
  selectedShopId,
  onChange,
  disabled = false,
  required = false
}: ShopSelectorProps) {
  const { language } = useAuthStore();
  const isRTL = language === 'ar';

  return (
    <div className="space-y-2">
      <label
        htmlFor="shop-selector"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {isRTL ? 'اختر المتجر' : 'Select Shop'}
        {required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      <div className="relative">
        <select
          id="shop-selector"
          value={selectedShopId || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
            disabled ? 'bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-60' : ''
          } ${isRTL ? 'text-right' : 'text-left'}`}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <option value="" disabled>
            {isRTL ? 'اختر المتجر...' : 'Select a shop...'}
          </option>
          {shops.map((shop) => (
            <option key={shop.id} value={shop.id}>
              {isRTL ? shop.nameAr : shop.nameEn}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow for RTL support */}
        <div className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center pointer-events-none`}>
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Shop Info Display */}
      {selectedShopId && (
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
          {(() => {
            const selectedShop = shops.find(s => s.id === selectedShopId);
            return selectedShop ? (
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  {isRTL ? selectedShop.nameAr : selectedShop.nameEn}
                </p>
                <p className="text-blue-700 dark:text-blue-300 mt-1">
                  {isRTL ? `معرف المتجر: ${selectedShop.id}` : `Shop ID: ${selectedShop.id}`}
                </p>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
}