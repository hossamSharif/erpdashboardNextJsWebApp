'use client';

import { useSession } from 'next-auth/react';
import { useAuthStore } from '../../stores/auth-store';
import { LogoutButton } from '../../components/features/auth/logout-button';
import { LanguageToggle } from '../../components/features/auth/language-toggle';
import { useSessionRefresh } from '../../hooks/use-session-refresh';

export default function DashboardPage() {
  const { data: session } = useSession();
  const { language, user } = useAuthStore();
  const { isExpired } = useSessionRefresh();
  const isRTL = language === 'ar';

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
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isRTL ? 'لوحة التحكم' : 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <LanguageToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="sm:flex sm:items-center sm:justify-between">
                <div className="sm:flex sm:items-center">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <svg
                        className="h-8 w-8 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className={`mt-4 sm:mt-0 ${isRTL ? 'sm:mr-6' : 'sm:ml-6'}`}>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {isRTL ? 'مرحباً،' : 'Welcome,'}
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {session?.user
                        ? (isRTL ? session.user.nameAr : session.user.nameEn)
                        : (isRTL ? 'المستخدم' : 'User')
                      }
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {session?.user?.role === 'ADMIN'
                        ? (isRTL ? 'مدير النظام' : 'System Administrator')
                        : (isRTL ? 'مستخدم' : 'User')
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                {isRTL ? 'معلومات المستخدم' : 'User Information'}
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {isRTL ? 'البريد الإلكتروني' : 'Email'}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {session?.user?.email || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {isRTL ? 'الدور' : 'Role'}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      session?.user?.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {session?.user?.role === 'ADMIN'
                        ? (isRTL ? 'مدير' : 'Admin')
                        : (isRTL ? 'مستخدم' : 'User')
                      }
                    </span>
                  </dd>
                </div>
                {session?.user?.shopId && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {isRTL ? 'معرف المتجر' : 'Shop ID'}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {session.user.shopId}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {isRTL ? 'حالة الحساب' : 'Account Status'}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      session?.user?.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {session?.user?.isActive
                        ? (isRTL ? 'نشط' : 'Active')
                        : (isRTL ? 'غير نشط' : 'Inactive')
                      }
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Session Information */}
          <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                {isRTL ? 'معلومات الجلسة' : 'Session Information'}
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {isRTL ? 'انتهاء الصلاحية' : 'Session Expires'}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {session?.expires
                      ? new Date(session.expires).toLocaleString(isRTL ? 'ar-SA' : 'en-US')
                      : 'N/A'
                    }
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {isRTL ? 'اللغة' : 'Language'}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {isRTL ? 'العربية 🇸🇦' : 'English 🇺🇸'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}