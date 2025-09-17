'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { createShopSchema, SHOP_CONSTANTS } from '@multi-shop/shared';
import type { CreateShopInput } from '@multi-shop/shared';
import { trpc } from '../../../utils/trpc';
import { useRTL } from '../../layout/rtl-provider';
import { rtlClasses } from '../../../lib/rtl-utils';

interface ShopFormProps {
  onSuccess?: (shop: any) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateShopInput>;
  isEdit?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function ShopForm({
  onSuccess,
  onCancel,
  initialData,
  isEdit = false
}: ShopFormProps) {
  const { t } = useTranslation(['shop', 'common']);
  const { isRTL } = useRTL();
  const [isLoading, setIsLoading] = useState(false);
  const [codeCheckLoading, setCodeCheckLoading] = useState(false);
  const [nameCheckLoading, setNameCheckLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    watch,
    setValue
  } = useForm<CreateShopInput>({
    resolver: zodResolver(createShopSchema),
    defaultValues: initialData || {
      nameAr: '',
      nameEn: '',
      code: '',
      assignedUserIds: []
    }
  });

  const watchedCode = watch('code');
  const watchedNameAr = watch('nameAr');
  const watchedNameEn = watch('nameEn');

  // tRPC mutations and queries
  const createShopMutation = trpc.shop.create.useMutation({
    onSuccess: (data) => {
      setIsLoading(false);
      onSuccess?.(data.shop);
    },
    onError: (error) => {
      setIsLoading(false);
      setError('root', {
        type: 'manual',
        message: isRTL ? 'حدث خطأ أثناء إنشاء المتجر' : 'Failed to create shop'
      });
    }
  });

  const checkCodeAvailability = trpc.shop.checkCodeAvailability.useQuery(
    {
      code: watchedCode || '',
      excludeId: isEdit ? (initialData as any)?.id : undefined
    },
    {
      enabled: !!watchedCode && watchedCode.length >= SHOP_CONSTANTS.CODE.MIN_LENGTH,
      onSuccess: (data) => {
        setCodeCheckLoading(false);
        if (!data.available) {
          setError('code', {
            type: 'manual',
            message: isRTL ? 'رمز المتجر مستخدم بالفعل' : 'Shop code is already taken'
          });
        } else {
          clearErrors('code');
        }
      },
      onError: () => {
        setCodeCheckLoading(false);
      }
    }
  );

  const checkNameAvailability = trpc.shop.checkNameAvailability.useQuery(
    {
      nameAr: watchedNameAr || '',
      nameEn: watchedNameEn || '',
      excludeId: isEdit ? (initialData as any)?.id : undefined
    },
    {
      enabled: !!(watchedNameAr && watchedNameEn &&
        watchedNameAr.length >= SHOP_CONSTANTS.NAME.MIN_LENGTH &&
        watchedNameEn.length >= SHOP_CONSTANTS.NAME.MIN_LENGTH),
      onSuccess: (data) => {
        setNameCheckLoading(false);
        if (!data.available) {
          setError('nameAr', {
            type: 'manual',
            message: isRTL ? 'اسم المتجر مستخدم بالفعل' : 'Shop name is already taken'
          });
          setError('nameEn', {
            type: 'manual',
            message: isRTL ? 'اسم المتجر مستخدم بالفعل' : 'Shop name is already taken'
          });
        } else {
          clearErrors(['nameAr', 'nameEn']);
        }
      },
      onError: () => {
        setNameCheckLoading(false);
      }
    }
  );

  // Auto-generate code from English name
  useEffect(() => {
    if (watchedNameEn && !isEdit) {
      const generatedCode = watchedNameEn
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_')
        .substring(0, SHOP_CONSTANTS.CODE.MAX_LENGTH);
      setValue('code', generatedCode);
    }
  }, [watchedNameEn, setValue, isEdit]);

  // Debounced validation for code
  useEffect(() => {
    if (watchedCode && watchedCode.length >= SHOP_CONSTANTS.CODE.MIN_LENGTH) {
      setCodeCheckLoading(true);
      const timer = setTimeout(() => {
        // The query will automatically trigger due to enabled condition
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [watchedCode]);

  // Debounced validation for names
  useEffect(() => {
    if (watchedNameAr && watchedNameEn &&
        watchedNameAr.length >= SHOP_CONSTANTS.NAME.MIN_LENGTH &&
        watchedNameEn.length >= SHOP_CONSTANTS.NAME.MIN_LENGTH) {
      setNameCheckLoading(true);
      const timer = setTimeout(() => {
        // The query will automatically trigger due to enabled condition
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [watchedNameAr, watchedNameEn]);

  const onSubmit = async (data: CreateShopInput) => {
    setIsLoading(true);
    createShopMutation.mutate(data);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 ${rtlClasses.card}`}>
      <div className="flex justify-between items-center mb-8">
        <h2 className={`text-2xl font-bold text-gray-900 dark:text-white ${rtlClasses.cardHeader}`}>
          {isEdit
            ? (isRTL ? 'تعديل المتجر' : 'Edit Shop')
            : (isRTL ? 'إنشاء متجر جديد' : 'Create New Shop')
          }
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Arabic Name Field */}
        <div>
          <label
            htmlFor="nameAr"
            className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${rtlClasses.formLabel}`}
          >
            {isRTL ? 'اسم المتجر (عربي) *' : 'Shop Name (Arabic) *'}
          </label>
          <input
            {...register('nameAr')}
            type="text"
            id="nameAr"
            dir="rtl"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-right ${
              errors.nameAr ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={isRTL ? 'أدخل اسم المتجر بالعربي' : 'Enter shop name in Arabic'}
          />
          {nameCheckLoading && (
            <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
              {isRTL ? 'جاري التحقق من توفر الاسم...' : 'Checking name availability...'}
            </p>
          )}
          {errors.nameAr && (
            <p className={`mt-1 text-sm text-red-600 dark:text-red-400 ${rtlClasses.formHelp}`}>
              {errors.nameAr.message}
            </p>
          )}
        </div>

        {/* English Name Field */}
        <div>
          <label
            htmlFor="nameEn"
            className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${rtlClasses.formLabel}`}
          >
            {isRTL ? 'اسم المتجر (إنجليزي) *' : 'Shop Name (English) *'}
          </label>
          <input
            {...register('nameEn')}
            type="text"
            id="nameEn"
            dir="ltr"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-left ${
              errors.nameEn ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={isRTL ? 'أدخل اسم المتجر بالإنجليزي' : 'Enter shop name in English'}
          />
          {errors.nameEn && (
            <p className={`mt-1 text-sm text-red-600 dark:text-red-400 ${rtlClasses.formHelp}`}>
              {errors.nameEn.message}
            </p>
          )}
        </div>

        {/* Shop Code Field */}
        <div>
          <label
            htmlFor="code"
            className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${rtlClasses.formLabel}`}
          >
            {isRTL ? 'رمز المتجر *' : 'Shop Code *'}
          </label>
          <input
            {...register('code')}
            type="text"
            id="code"
            dir="ltr"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-left uppercase ${
              errors.code ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={isRTL ? 'رمز المتجر (أحرف إنجليزية وأرقام فقط)' : 'Shop code (letters and numbers only)'}
          />
          <p className={`mt-1 text-xs text-gray-500 dark:text-gray-400 ${rtlClasses.formHelp}`}>
            {isRTL
              ? `${SHOP_CONSTANTS.CODE.MIN_LENGTH}-${SHOP_CONSTANTS.CODE.MAX_LENGTH} أحرف، أحرف كبيرة وأرقام وشرطات فقط`
              : `${SHOP_CONSTANTS.CODE.MIN_LENGTH}-${SHOP_CONSTANTS.CODE.MAX_LENGTH} characters, uppercase letters, numbers, and hyphens only`
            }
          </p>
          {codeCheckLoading && (
            <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
              {isRTL ? 'جاري التحقق من توفر الرمز...' : 'Checking code availability...'}
            </p>
          )}
          {errors.code && (
            <p className={`mt-1 text-sm text-red-600 dark:text-red-400 ${rtlClasses.formHelp}`}>
              {errors.code.message}
            </p>
          )}
        </div>

        {/* User Assignment Field */}
        <div>
          <label
            htmlFor="assignedUserIds"
            className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${rtlClasses.formLabel}`}
          >
            {isRTL ? 'تعيين المستخدمين (اختياري)' : 'Assign Users (Optional)'}
          </label>
          <select
            {...register('assignedUserIds')}
            multiple
            id="assignedUserIds"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.assignedUserIds ? 'border-red-500' : 'border-gray-300'
            } ${rtlClasses.formInput}`}
          >
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          <p className={`mt-1 text-xs text-gray-500 dark:text-gray-400 ${rtlClasses.formHelp}`}>
            {isRTL
              ? 'استخدم Ctrl/Cmd للاختيار المتعدد'
              : 'Hold Ctrl/Cmd to select multiple users'
            }
          </p>
          {errors.assignedUserIds && (
            <p className={`mt-1 text-sm text-red-600 dark:text-red-400 ${rtlClasses.formHelp}`}>
              {errors.assignedUserIds.message}
            </p>
          )}
        </div>

        {/* Error Display */}
        {errors.root && (
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className={`${isRTL ? 'mr-3' : 'ml-3'}`}>
                <p className="text-sm text-red-800 dark:text-red-200">
                  {errors.root.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <button
            type="submit"
            disabled={isLoading || codeCheckLoading || nameCheckLoading}
            className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {isLoading
              ? (isRTL ? 'جاري الحفظ...' : 'Saving...')
              : isEdit
                ? (isRTL ? 'تحديث المتجر' : 'Update Shop')
                : (isRTL ? 'إنشاء المتجر' : 'Create Shop')
            }
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}