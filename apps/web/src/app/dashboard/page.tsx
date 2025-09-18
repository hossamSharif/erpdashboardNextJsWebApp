'use client';

import { useSession } from 'next-auth/react';
import { useAuthStore } from '../../stores/auth-store';
import { LogoutButton } from '../../components/features/auth/logout-button';
import { LanguageToggle } from '../../components/features/auth/language-toggle';
import { useSessionRefresh } from '../../hooks/use-session-refresh';
import { BalanceStatusBar } from '../../components/features/dashboard/BalanceStatusBar';
import { DailyStatsWidget } from '../../components/features/dashboard/DailyStatsWidget';
import { TransactionList } from '../../components/features/dashboard/TransactionList';
import { useDashboardStore } from '../../stores/dashboard-store';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const { language } = useAuthStore();
  const { isExpired } = useSessionRefresh();
  const { setSelectedDate } = useDashboardStore();
  const isRTL = language === 'ar';

  useEffect(() => {
    setSelectedDate(new Date());
  }, [setSelectedDate]);

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {isRTL ? 'انتهت صلاحية الجلسة' : 'Session Expired'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isRTL ? 'يرجى تسجيل الدخول مرة أخرى' : 'Please log in again'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isRTL ? 'الإدخالات اليومية' : 'Daily Entries'}
              </h1>
            </div>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <LanguageToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Balance Status Bar */}
      <BalanceStatusBar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Daily Stats Widget */}
          <DailyStatsWidget />

          {/* Transactions List */}
          <div className="mt-6">
            <TransactionList />
          </div>
        </div>
      </main>
    </div>
  );
}