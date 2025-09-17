'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRTL } from '../../layout/rtl-provider';
import { rtlClasses } from '../../../lib/rtl-utils';

interface Shop {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  users: {
    id: string;
    name: string;
    email: string;
    role: string;
  }[];
}

interface ShopCardProps {
  shop: Shop;
  onEdit?: (shop: Shop) => void;
  onDelete?: (shop: Shop) => void;
  onToggleStatus?: (shop: Shop) => void;
  isToggling?: boolean;
  isDeleting?: boolean;
}

export function ShopCard({
  shop,
  onEdit,
  onDelete,
  onToggleStatus,
  isToggling = false,
  isDeleting = false
}: ShopCardProps) {
  const { t } = useTranslation(['shop', 'common']);
  const { isRTL } = useRTL();
  const [showUsers, setShowUsers] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return isRTL ? 'مدير' : 'Admin';
      case 'USER':
        return isRTL ? 'مستخدم' : 'User';
      default:
        return role;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden transition-shadow hover:shadow-xl ${
      !shop.isActive ? 'opacity-75' : ''
    }`}>
      {/* Card Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${rtlClasses.cardHeader}`}>
              {isRTL ? shop.nameAr : shop.nameEn}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isRTL ? shop.nameEn : shop.nameAr}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {/* Status Badge */}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              shop.isActive
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {shop.isActive
                ? (isRTL ? 'نشط' : 'Active')
                : (isRTL ? 'غير نشط' : 'Inactive')
              }
            </span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="px-6 py-4">
        {/* Shop Code */}
        <div className="mb-4">
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {isRTL ? 'رمز المتجر' : 'Shop Code'}
          </dt>
          <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
            {shop.code}
          </dd>
        </div>

        {/* Users Count */}
        <div className="mb-4">
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {isRTL ? 'عدد المستخدمين' : 'Users'}
          </dt>
          <dd className="mt-1">
            <button
              onClick={() => setShowUsers(!showUsers)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              {shop.users.length} {isRTL ? 'مستخدم' : 'users'}
              {shop.users.length > 0 && (
                <svg
                  className={`inline w-4 h-4 ${isRTL ? 'mr-1' : 'ml-1'} transition-transform ${
                    showUsers ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          </dd>
        </div>

        {/* Users List (Collapsible) */}
        {showUsers && shop.users.length > 0 && (
          <div className="mb-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              {shop.users.map((user) => (
                <div key={user.id} className="text-sm">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    {user.email} • {getUserRoleLabel(user.role)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Created Date */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {isRTL ? 'تم الإنشاء في' : 'Created on'} {formatDate(shop.createdAt)}
        </div>
      </div>

      {/* Card Actions */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className={`flex justify-between space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {/* Edit Button */}
          {onEdit && (
            <button
              onClick={() => onEdit(shop)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isRTL ? 'تعديل' : 'Edit'}
            </button>
          )}

          {/* Toggle Status Button */}
          {onToggleStatus && (
            <button
              onClick={() => onToggleStatus(shop)}
              disabled={isToggling}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                shop.isActive
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500'
                  : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
              }`}
            >
              {isToggling ? (
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {shop.isActive
                ? (isRTL ? 'إلغاء التنشيط' : 'Deactivate')
                : (isRTL ? 'تنشيط' : 'Activate')
              }
            </button>
          )}

          {/* Delete Button */}
          {onDelete && shop.isActive && (
            <button
              onClick={() => onDelete(shop)}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isRTL ? 'حذف' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}