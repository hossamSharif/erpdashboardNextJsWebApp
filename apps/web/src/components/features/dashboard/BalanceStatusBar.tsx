'use client';

import { useSession } from 'next-auth/react';
import { useAuthStore } from '../../../stores/auth-store';
import { useDashboardStore } from '../../../stores/dashboard-store';
import { trpc } from '../../../utils/trpc';

export function BalanceStatusBar() {
  const { data: session } = useSession();
  const { language } = useAuthStore();
  const { selectedDate, updateBalances } = useDashboardStore();
  const isRTL = language === 'ar';

  const { data: dashboardData, isLoading } = trpc.shop.getDashboard.useQuery(
    {
      shopId: session?.user?.shopId || '',
      date: selectedDate,
    },
    {
      enabled: !!session?.user?.shopId,
      refetchInterval: 5000, // Real-time updates every 5 seconds
      onSuccess: (data) => {
        updateBalances(data.cashBalance, data.bankBalance);
      },
    }
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3">
            <div className="flex items-center justify-center space-x-6 rtl:space-x-reverse">
              <div className="animate-pulse">
                <div className="h-6 bg-blue-200 rounded w-32"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-6 bg-blue-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3">
          <div className="flex items-center justify-center space-x-8 rtl:space-x-reverse">
            {/* Cash Balance */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <svg
                  className="h-5 w-5 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isRTL ? 'نقد في الصندوق' : 'Cash in Hand'}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(dashboardData?.cashBalance || 0)}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>

            {/* Bank Balance */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <svg
                  className="h-5 w-5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isRTL ? 'رصيد البنك' : 'Bank Balance'}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(dashboardData?.bankBalance || 0)}
                </p>
              </div>
            </div>

            {/* Sync Status */}
            {dashboardData && (
              <>
                <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className={`p-2 rounded-full ${
                    dashboardData.pendingSyncCount > 0
                      ? 'bg-yellow-100 dark:bg-yellow-900/30'
                      : 'bg-green-100 dark:bg-green-900/30'
                  }`}>
                    <svg
                      className={`h-5 w-5 ${
                        dashboardData.pendingSyncCount > 0
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {isRTL ? 'حالة المزامنة' : 'Sync Status'}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {dashboardData.pendingSyncCount > 0
                        ? (isRTL ? `${dashboardData.pendingSyncCount} في الانتظار` : `${dashboardData.pendingSyncCount} pending`)
                        : (isRTL ? 'محدث' : 'Up to date')
                      }
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}