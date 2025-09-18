'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '../../../stores/auth-store';
import { trpc } from '../../../utils/trpc';
import { useTranslation } from 'react-i18next';

interface TransactionActionsProps {
  transaction: {
    id: string;
    transactionType: string;
    amount: number | string;
    description?: string | null;
  };
  onUpdate: () => void;
}

export function TransactionActions({ transaction, onUpdate }: TransactionActionsProps) {
  const { data: session } = useSession();
  const { language } = useAuthStore();
  const { t } = useTranslation();
  const isRTL = language === 'ar';

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMutation = trpc.transaction.delete.useMutation({
    onSuccess: () => {
      setShowDeleteConfirm(false);
      setIsDeleting(false);
      onUpdate();
    },
    onError: (error) => {
      setIsDeleting(false);
      console.error('Failed to delete transaction:', error);
    },
  });

  const handleDelete = async () => {
    if (!session?.user?.shopId) return;

    setIsDeleting(true);
    deleteMutation.mutate({
      id: transaction.id,
      shopId: session.user.shopId,
    });
  };

  const handleEdit = () => {
    // TODO: Open edit modal
    console.log('Edit transaction:', transaction.id);
  };

  if (showDeleteConfirm) {
    return (
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isRTL ? 'جاري الحذف...' : 'Deleting...'}
            </>
          ) : (
            <>
              <svg className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isRTL ? 'تأكيد' : 'Confirm'}
            </>
          )}
        </button>
        <button
          onClick={() => setShowDeleteConfirm(false)}
          disabled={isDeleting}
          className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {isRTL ? 'إلغاء' : 'Cancel'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse">
      {/* Edit Button */}
      <button
        onClick={handleEdit}
        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        title={isRTL ? 'تعديل' : 'Edit'}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </button>

      {/* Delete Button */}
      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        title={isRTL ? 'حذف' : 'Delete'}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
}