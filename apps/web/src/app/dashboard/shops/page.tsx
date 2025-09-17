'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShopList } from '../../../components/features/shops/ShopList';
import { ShopForm } from '../../../components/features/shops/ShopForm';
import { useRTL } from '../../../components/layout/rtl-provider';

type ViewMode = 'list' | 'create' | 'edit';

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

export default function ShopsPage() {
  const { t } = useTranslation(['shop', 'common']);
  const { isRTL } = useRTL();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleCreateShop = () => {
    setSelectedShop(null);
    setViewMode('create');
  };

  const handleEditShop = (shop: Shop) => {
    setSelectedShop(shop);
    setViewMode('edit');
  };

  const handleShopSuccess = (shop: Shop) => {
    const message = viewMode === 'create'
      ? (isRTL ? 'تم إنشاء المتجر بنجاح' : 'Shop created successfully')
      : (isRTL ? 'تم تحديث المتجر بنجاح' : 'Shop updated successfully');

    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setViewMode('list');
    setSelectedShop(null);

    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedShop(null);
  };

  const handleDeleteShop = (shop: Shop) => {
    // Note: Deletion is handled by the ShopList component through soft delete
    // This function can be used for additional delete confirmation if needed
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className={`${isRTL ? 'mr-3' : 'ml-3'} flex-1`}>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {successMessage}
                </p>
              </div>
              <div className={`${isRTL ? 'ml-auto' : 'ml-auto'} flex-shrink-0`}>
                <button
                  onClick={() => setShowSuccessMessage(false)}
                  className="inline-flex text-green-400 hover:text-green-600 focus:outline-none"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className={`inline-flex items-center space-x-1 md:space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <li className="inline-flex items-center">
              <button
                onClick={() => setViewMode('list')}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
              >
                <svg
                  className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                {isRTL ? 'المتاجر' : 'Shops'}
              </button>
            </li>
            {viewMode !== 'list' && (
              <li>
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {viewMode === 'create'
                      ? (isRTL ? 'إنشاء متجر جديد' : 'Create New Shop')
                      : (isRTL ? 'تعديل المتجر' : 'Edit Shop')
                    }
                  </span>
                </div>
              </li>
            )}
          </ol>
        </nav>

        {/* Main Content */}
        {viewMode === 'list' && (
          <ShopList
            onCreateShop={handleCreateShop}
            onEditShop={handleEditShop}
            onDeleteShop={handleDeleteShop}
            showCreateButton={true}
          />
        )}

        {(viewMode === 'create' || viewMode === 'edit') && (
          <div className="max-w-2xl mx-auto">
            <ShopForm
              onSuccess={handleShopSuccess}
              onCancel={handleCancel}
              initialData={selectedShop ? {
                nameAr: selectedShop.nameAr,
                nameEn: selectedShop.nameEn,
                code: selectedShop.code,
                assignedUserIds: selectedShop.users.map(u => u.id)
              } : undefined}
              isEdit={viewMode === 'edit'}
            />
          </div>
        )}
      </div>
    </div>
  );
}