'use client';

import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { SystemStatus } from '@multi-shop/shared';
import { trpc } from '../../../utils/trpc';

interface HealthStatusProps {
  className?: string;
}

export function HealthStatus({ className = '' }: HealthStatusProps) {
  const { t, i18n } = useTranslation('common');
  const { data: session, status: authStatus } = useSession();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const {
    data: healthData,
    isLoading,
    refetch
  } = trpc.health.check.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
    onSuccess: () => {
      setLastRefresh(new Date());
    }
  });

  const handleRefresh = async () => {
    await refetch();
  };

  const getStatusColor = (isHealthy: boolean) => {
    return isHealthy ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (isHealthy: boolean) => {
    return isHealthy ? '✅' : '❌';
  };

  const formatResponseTime = (ms: number) => {
    return `${ms}${t('health.ms')}`;
  };

  const formatLastChecked = (date: Date) => {
    return new Intl.DateTimeFormat(i18n.language, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  if (isLoading && !healthData) {
    return (
      <div className={`p-6 border rounded-lg shadow-sm ${className}`}>
        <div className="animate-pulse">
          <h2 className="text-xl font-semibold mb-4">{t('health.checkingStatus')}</h2>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  const healthStatus = healthData?.system;
  const isSystemHealthy = healthStatus?.status === 'healthy';

  return (
    <div className={`p-6 border rounded-lg shadow-sm ${className}`} data-testid="health-status">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('health.systemStatus')}
        </h2>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? t('messages.loading') : t('health.refreshStatus')}
        </button>
      </div>

      {/* Main System Status */}
      <div className="mb-6">
        <div className={`text-3xl font-bold ${getStatusColor(isSystemHealthy)}`}>
          {getStatusIcon(isSystemHealthy)} {t(`health.${isSystemHealthy ? 'systemOperational' : 'unhealthy'}`)}
        </div>
      </div>

      {/* Detailed Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Database Status */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">{t('health.database')}</h3>
          <div className={`flex items-center ${getStatusColor(healthStatus?.database || false)}`}>
            {getStatusIcon(healthStatus?.database || false)}
            <span className="ml-2">
              {t(`health.${healthStatus?.database ? 'connected' : 'disconnected'}`)}
            </span>
          </div>
        </div>

        {/* Authentication Status */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">{t('health.authentication')}</h3>
          <div className={`flex items-center ${getStatusColor(healthStatus?.auth || false)}`}>
            {getStatusIcon(healthStatus?.auth || false)}
            <span className="ml-2">
              {t(`health.${healthStatus?.auth ? 'operational' : 'disconnected'}`)}
            </span>
          </div>
        </div>

        {/* Response Time */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">{t('health.responseTime')}</h3>
          <div className="text-blue-600 font-mono">
            {healthStatus?.responseTime ? formatResponseTime(healthStatus.responseTime) : '--'}
          </div>
        </div>

        {/* Current User Session */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">{t('health.authentication')}</h3>
          <div className={`flex items-center ${getStatusColor(!!session)}`}>
            {getStatusIcon(!!session)}
            <span className="ml-2">
              {session ? session.user.nameEn || session.user.email : t('auth.notLoggedIn')}
            </span>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="p-3 bg-gray-50 rounded">
          <span className="text-sm text-gray-500">{t('health.version')}: </span>
          <span className="font-mono text-sm">{healthData?.version || 'N/A'}</span>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <span className="text-sm text-gray-500">{t('health.environment')}: </span>
          <span className="font-mono text-sm">{healthData?.environment || 'N/A'}</span>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <span className="text-sm text-gray-500">{t('health.lastChecked')}: </span>
          <span className="font-mono text-sm">{formatLastChecked(lastRefresh)}</span>
        </div>
      </div>

      {/* Language and RTL Info */}
      <div className="p-3 bg-blue-50 rounded">
        <div className="text-sm">
          <span className="text-gray-600">Current Language: </span>
          <span className="font-semibold">{i18n.language === 'ar' ? 'العربية (Arabic)' : 'English'}</span>
          <span className="mx-2">•</span>
          <span className="text-gray-600">Direction: </span>
          <span className="font-semibold">{document.documentElement.dir.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}