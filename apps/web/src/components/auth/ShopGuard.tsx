'use client';

import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useShopContext, useShopAccess } from '../providers/ShopProvider';
import { useAuthStore } from '../../stores/auth-store';
import { useRTL } from '../layout/rtl-provider';
import { rtlClasses } from '../../lib/rtl-utils';

interface ShopGuardProps {
  children: ReactNode;
  requireShop?: boolean;
  requireOwnership?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ShopGuard({
  children,
  requireShop = true,
  requireOwnership = false,
  fallback,
  redirectTo
}: ShopGuardProps) {
  const { t } = useTranslation(['shop', 'common', 'auth']);
  const { isRTL } = useRTL();
  const { user } = useAuthStore();
  const { currentShop, isLoading, error } = useShopContext();
  const { hasAccess, isOwner } = useShopAccess();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isRTL ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      fallback || (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
            </div>
            <div className={`${isRTL ? 'mr-3' : 'ml-3'}`}>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                {isRTL ? 'خطأ في الوصول للمتجر' : 'Shop Access Error'}
              </h3>
              <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          </div>
        </div>
      )
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      fallback || (
        <div className="bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800 rounded-md p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className={`${isRTL ? 'mr-3' : 'ml-3'}`}>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {isRTL ? 'مطلوب تسجيل دخول' : 'Authentication Required'}
              </h3>
              <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                {isRTL ? 'يجب تسجيل الدخول للوصول لهذه الصفحة' : 'You must be logged in to access this page.'}
              </p>
            </div>
          </div>
        </div>
      )
    );
  }

  // Check if shop is required but not selected
  if (requireShop && !currentShop) {
    return (
      fallback || (
        <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-md p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className={`${isRTL ? 'mr-3' : 'ml-3'}`}>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {isRTL ? 'يجب اختيار متجر' : 'Shop Selection Required'}
              </h3>
              <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                {isRTL
                  ? 'يجب اختيار متجر للوصول لهذه الصفحة. يرجى اختيار متجر من القائمة.'
                  : 'You must select a shop to access this page. Please select a shop from the dropdown.'
                }
              </p>
            </div>
          </div>
        </div>
      )
    );
  }

  // Check if ownership is required but user is not owner
  if (requireOwnership && !isOwner) {
    return (
      fallback || (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className={`${isRTL ? 'mr-3' : 'ml-3'}`}>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                {isRTL ? 'وصول محظور' : 'Access Denied'}
              </h3>
              <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                {isRTL
                  ? 'تحتاج لصلاحيات مدير لالوصول لهذه الصفحة.'
                  : 'You need owner permissions to access this page.'}
              </p>
            </div>
          </div>
        </div>
      )
    );
  }

  // Check if user has access to current shop
  if (currentShop && !hasAccess) {
    return (
      fallback || (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className={`${isRTL ? 'mr-3' : 'ml-3'}`}>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                {isRTL ? 'وصول محظور للمتجر' : 'Shop Access Denied'}
              </h3>
              <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                {isRTL
                  ? 'لا تملك صلاحية للوصول لهذا المتجر.'
                  : 'You do not have permission to access this shop.'}
              </p>
            </div>
          </div>
        </div>
      )
    );
  }

  // All checks passed, render children
  return <>{children}</>;
}

// Higher-order component for wrapping components with shop guard
export function withShopGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardOptions?: Omit<ShopGuardProps, 'children'>
) {
  return function ShopGuardedComponent(props: P) {
    return (
      <ShopGuard {...guardOptions}>
        <Component {...props} />
      </ShopGuard>
    );
  };
}

// Hook for checking shop permissions in components
export function useShopPermissions() {
  const { user } = useAuthStore();
  const { currentShop } = useShopContext();
  const { hasAccess, isOwner } = useShopAccess();

  const canCreateShop = user?.role === 'ADMIN';
  const canEditShop = isOwner && currentShop;
  const canDeleteShop = isOwner && currentShop;
  const canManageUsers = isOwner && currentShop;
  const canViewReports = hasAccess && currentShop;
  const canManageTransactions = hasAccess && currentShop;

  return {
    canCreateShop,
    canEditShop,
    canDeleteShop,
    canManageUsers,
    canViewReports,
    canManageTransactions,
    hasShopAccess: hasAccess,
    isShopOwner: isOwner,
    currentShop,
    user
  };
}