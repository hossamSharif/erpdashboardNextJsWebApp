'use client';

import { useSession } from 'next-auth/react';
import { useAuthStore } from '../../../stores/auth-store';
import { useDashboardStore } from '../../../stores/dashboard-store';
import { trpc } from '../../../utils/trpc';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { TransactionActions } from './TransactionActions';
import { EmptyState } from './EmptyState';

export function TransactionList() {
  const { data: session } = useSession();
  const { language } = useAuthStore();
  const { selectedDate } = useDashboardStore();
  const isRTL = language === 'ar';

  const { data: transactions, isLoading, refetch } = trpc.transaction.getDaily.useQuery(
    {
      shopId: session?.user?.shopId || '',
      date: selectedDate,
    },
    {
      enabled: !!session?.user?.shopId,
      refetchInterval: 5000,
    }
  );

  const getTransactionTypeInfo = (type: string) => {
    switch (type) {
      case 'SALE':
        return {
          label: isRTL ? 'مبيعات' : 'Sales',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          textColor: 'text-green-800 dark:text-green-200',
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          ),
        };
      case 'PURCHASE':
        return {
          label: isRTL ? 'مشتريات' : 'Purchase',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          textColor: 'text-red-800 dark:text-red-200',
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          ),
        };
      case 'PAYMENT':
        return {
          label: isRTL ? 'مصروفات' : 'Expense',
          bgColor: 'bg-orange-100 dark:bg-orange-900/30',
          textColor: 'text-orange-800 dark:text-orange-200',
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          ),
        };
      case 'TRANSFER':
        return {
          label: isRTL ? 'تحويل' : 'Transfer',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          textColor: 'text-blue-800 dark:text-blue-200',
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          ),
        };
      default:
        return {
          label: type,
          bgColor: 'bg-gray-100 dark:bg-gray-900/30',
          textColor: 'text-gray-800 dark:text-gray-200',
          icon: (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          ),
        };
    }
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatTime = (date: string | Date) => {
    return format(new Date(date), 'HH:mm', { locale: isRTL ? ar : enUS });
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="h-10 w-20 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isRTL ? 'المعاملات اليومية' : 'Daily Transactions'}
          </h2>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isRTL ? `${transactions.length} معاملة` : `${transactions.length} transactions`}
            </span>
            <button
              onClick={() => refetch()}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title={isRTL ? 'تحديث' : 'Refresh'}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {transactions.map((transaction) => {
          const typeInfo = getTransactionTypeInfo(transaction.transactionType);

          return (
            <div key={transaction.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 rtl:space-x-reverse flex-1 min-w-0">
                  {/* Transaction Type Badge */}
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${typeInfo.bgColor} ${typeInfo.textColor}`}>
                    {typeInfo.icon}
                    <span className={`${isRTL ? 'mr-1' : 'ml-1'}`}>{typeInfo.label}</span>
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {transaction.description || (isRTL ? 'بدون وصف' : 'No description')}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(transaction.createdAt)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center space-x-2 rtl:space-x-reverse text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        {isRTL ? 'من:' : 'From:'} {isRTL ? transaction.debitAccount.nameAr : transaction.debitAccount.nameEn}
                      </span>
                      <span>•</span>
                      <span>
                        {isRTL ? 'إلى:' : 'To:'} {isRTL ? transaction.creditAccount.nameAr : transaction.creditAccount.nameEn}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount and Actions */}
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="text-right rtl:text-left">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(transaction.amount)}
                    </p>
                    {transaction.amountPaid && parseFloat(transaction.amountPaid.toString()) !== parseFloat(transaction.amount.toString()) && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isRTL ? 'مدفوع:' : 'Paid:'} {formatCurrency(transaction.amountPaid)}
                      </p>
                    )}
                  </div>

                  <TransactionActions
                    transaction={transaction}
                    onUpdate={() => refetch()}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}