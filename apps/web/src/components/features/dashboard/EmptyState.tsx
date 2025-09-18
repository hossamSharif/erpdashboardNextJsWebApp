'use client';

import { useAuthStore } from '../../../stores/auth-store';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  onAddTransaction?: () => void;
}

export function EmptyState({ onAddTransaction }: EmptyStateProps) {
  const { language } = useAuthStore();
  const isRTL = language === 'ar';

  const handleAddClick = () => {
    if (onAddTransaction) {
      onAddTransaction();
    } else {
      // TODO: Open add transaction modal - placeholder for future implementation
      // console.log('Add new transaction');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isRTL ? 'المعاملات اليومية' : 'Daily Transactions'}
        </h2>
      </div>

      <div className="p-12 text-center">
        <div className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600">
          <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {isRTL ? 'لا توجد معاملات لهذا اليوم' : 'No transactions for this date'}
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {isRTL
              ? 'لم يتم تسجيل أي معاملات مالية في التاريخ المحدد. ابدأ بإضافة معاملة جديدة.'
              : 'No financial transactions have been recorded for the selected date. Start by adding a new transaction.'
            }
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={handleAddClick}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {isRTL ? 'إضافة معاملة' : 'Add Transaction'}
          </button>
        </div>

        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
            <p className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>{isRTL ? 'مبيعات - أخضر' : 'Sales - Green'}</span>
            </p>
            <p className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>{isRTL ? 'مشتريات - أحمر' : 'Purchases - Red'}</span>
            </p>
            <p className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <svg className="h-4 w-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{isRTL ? 'مصروفات - برتقالي' : 'Expenses - Orange'}</span>
            </p>
            <p className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>{isRTL ? 'تحويل - أزرق' : 'Transfer - Blue'}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}