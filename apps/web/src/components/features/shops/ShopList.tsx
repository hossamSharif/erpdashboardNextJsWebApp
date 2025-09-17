'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../../utils/trpc';
import { useRTL } from '../../layout/rtl-provider';
import { rtlClasses } from '../../../lib/rtl-utils';
import { ShopCard } from './ShopCard';

interface ShopListProps {
  onEditShop?: (shop: any) => void;
  onDeleteShop?: (shop: any) => void;
  showCreateButton?: boolean;
  onCreateShop?: () => void;
}

export function ShopList({
  onEditShop,
  onDeleteShop,
  showCreateButton = true,
  onCreateShop
}: ShopListProps) {
  const { t } = useTranslation(['shop', 'common']);
  const { isRTL } = useRTL();
  const [searchTerm, setSearchTerm] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // Fetch shops with search and pagination
  const {
    data: shopsData,
    isLoading,
    error,
    refetch
  } = trpc.shop.list.useQuery({
    search: searchTerm,
    includeInactive,
    limit: itemsPerPage,
    offset: currentPage * itemsPerPage
  });

  const toggleShopStatus = trpc.shop.toggleStatus.useMutation({
    onSuccess: () => {
      refetch();
    }
  });

  const softDeleteShop = trpc.shop.softDelete.useMutation({
    onSuccess: () => {
      refetch();
    }
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Reset to first page when searching
  };

  const handleToggleInactive = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeInactive(e.target.checked);
    setCurrentPage(0); // Reset to first page when changing filter
  };

  const handleToggleStatus = async (shopId: string, currentStatus: boolean) => {
    try {
      await toggleShopStatus.mutateAsync({
        id: shopId,
        isActive: !currentStatus
      });
    } catch (error) {
      console.error('Failed to toggle shop status:', error);
    }
  };

  const handleSoftDelete = async (shopId: string) => {
    if (window.confirm(
      isRTL
        ? 'هل أنت متأكد من أنك تريد إلغاء تنشيط هذا المتجر؟'
        : 'Are you sure you want to deactivate this shop?'
    )) {
      try {
        await softDeleteShop.mutateAsync({ id: shopId });
      } catch (error) {
        console.error('Failed to deactivate shop:', error);
      }
    }
  };

  const totalPages = shopsData ? Math.ceil(shopsData.total / itemsPerPage) : 0;

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          </div>
          <div className={`${isRTL ? 'mr-3' : 'ml-3'}`}>
            <p className="text-sm text-red-800 dark:text-red-200">
              {isRTL ? 'فشل في تحميل المتاجر' : 'Failed to load shops'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <h1 className={`text-3xl font-bold text-gray-900 dark:text-white ${rtlClasses.cardHeader}`}>
          {isRTL ? 'إدارة المتاجر' : 'Shop Management'}
        </h1>
        {showCreateButton && onCreateShop && (
          <button
            onClick={onCreateShop}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isRTL ? 'إنشاء متجر جديد' : 'Create New Shop'}
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Input */}
          <div>
            <label
              htmlFor="search"
              className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${rtlClasses.formLabel}`}
            >
              {isRTL ? 'البحث' : 'Search'}
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={handleSearch}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${rtlClasses.formInput}`}
              placeholder={isRTL ? 'ابحث عن المتاجر...' : 'Search shops...'}
            />
          </div>

          {/* Include Inactive Filter */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeInactive"
              checked={includeInactive}
              onChange={handleToggleInactive}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="includeInactive"
              className={`text-sm text-gray-700 dark:text-gray-300 ${isRTL ? 'mr-3' : 'ml-3'}`}
            >
              {isRTL ? 'إظهار المتاجر غير النشطة' : 'Show inactive shops'}
            </label>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Shops Grid */}
      {shopsData && (
        <>
          {shopsData.shops.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {isRTL ? 'لا توجد متاجر' : 'No shops found'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? (isRTL ? 'لم يتم العثور على نتائج للبحث' : 'No results found for your search')
                  : (isRTL ? 'ابدأ بإنشاء متجر جديد' : 'Get started by creating a new shop')
                }
              </p>
              {showCreateButton && onCreateShop && !searchTerm && (
                <button
                  onClick={onCreateShop}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium transition-colors"
                >
                  {isRTL ? 'إنشاء متجر جديد' : 'Create New Shop'}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shopsData.shops.map((shop) => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  onEdit={onEditShop}
                  onDelete={() => handleSoftDelete(shop.id)}
                  onToggleStatus={() => handleToggleStatus(shop.id, shop.isActive)}
                  isToggling={toggleShopStatus.isLoading}
                  isDeleting={softDeleteShop.isLoading}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRTL ? 'السابق' : 'Previous'}
              </button>

              <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                {isRTL
                  ? `صفحة ${currentPage + 1} من ${totalPages}`
                  : `Page ${currentPage + 1} of ${totalPages}`
                }
              </span>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRTL ? 'التالي' : 'Next'}
              </button>
            </div>
          )}

          {/* Results Summary */}
          <div className={`text-sm text-gray-500 dark:text-gray-400 text-center ${rtlClasses.formHelp}`}>
            {isRTL
              ? `عرض ${shopsData.shops.length} من أصل ${shopsData.total} متجر`
              : `Showing ${shopsData.shops.length} of ${shopsData.total} shops`
            }
          </div>
        </>
      )}
    </div>
  );
}