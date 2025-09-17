'use client';

import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import { HealthStatus } from '../components/features/health/health-status';
import { LanguageToggle } from '../components/layout/language-toggle';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { t, i18n } = useTranslation('common');
  const { data: session, status } = useSession();
  const router = useRouter();

  // Update page title dynamically based on language
  useEffect(() => {
    document.title = `${t('health.systemOperational')} - Multi-Shop Accounting System`;
  }, [t, i18n.language]);

  const handleNavigateToLogin = () => {
    router.push('/login');
  };

  const handleNavigateToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                {t('health.systemOperational')}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageToggle variant="simple" />
              {session ? (
                <button
                  onClick={handleNavigateToDashboard}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={handleNavigateToLogin}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('health.systemOperational')}
          </h1>
          <p className="text-lg text-gray-600">
            Multi-Shop Accounting System - {t('health.systemStatus')}
          </p>
        </div>

        {/* Health Status Component */}
        <HealthStatus className="mb-8" />

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                System Information
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Multi-tenant Architecture</li>
                <li>Arabic/English Support</li>
                <li>Real-time Synchronization</li>
                <li>Offline-first Design</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Technology Stack
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Next.js 14 + App Router</li>
                <li>tRPC + TypeScript</li>
                <li>PostgreSQL + Prisma</li>
                <li>NextAuth.js</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Current Session
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Language: {i18n.language === 'ar' ? 'العربية (Arabic)' : 'English'}</li>
                <li>Direction: {document.documentElement.dir.toUpperCase()}</li>
                <li>Status: {session ? 'Authenticated' : 'Guest'}</li>
                {session && (
                  <li>User: {session.user.nameEn || session.user.email}</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}