'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { loginSchema, AUTH_ERRORS, AUTH_ROUTES } from '@multi-shop/shared';
import type { LoginInput } from '@multi-shop/shared';
import { useAuthStore } from '../../../stores/auth-store';
import { useRTL } from '../../layout/rtl-provider';
import { rtlClasses } from '../../../lib/rtl-utils';
import { LanguageToggle } from './language-toggle';

interface LoginFormProps {
  searchParams?: {
    error?: string;
    callbackUrl?: string;
  };
}

const mockShops = [
  { id: 'shop-1', nameAr: 'متجر الإلكترونيات', nameEn: 'Electronics Store' },
  { id: 'shop-2', nameAr: 'متجر الملابس', nameEn: 'Clothing Store' }
];

export function LoginForm({ searchParams }: LoginFormProps) {
  const router = useRouter();
  const { t } = useTranslation('auth');
  const { isRTL } = useRTL();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showShopSelect, setShowShopSelect] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema)
  });

  const email = watch('email');

  // Mock logic to show shop selector for regular users
  const checkUserRole = (email: string) => {
    if (email.includes('admin')) {
      setShowShopSelect(false);
    } else {
      setShowShopSelect(true);
    }
  };

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        shopId: data.shopId,
        redirect: false
      });

      if (result?.error) {
        const errorObj = JSON.parse(result.error);
        setError('root', {
          type: 'manual',
          message: errorObj.messageAr || errorObj.message || t('errors.loginFailed')
        });
      } else if (result?.ok) {
        // Update auth store with user data
        const session = await getSession();
        if (session?.user) {
          setUser(session.user as any);
        }

        // Redirect to dashboard or callback URL
        const callbackUrl = searchParams?.callbackUrl || AUTH_ROUTES.DASHBOARD;
        router.push(callbackUrl);
      }
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: t('errors.loginFailed')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error: any) => {
    if (searchParams?.error) {
      switch (searchParams.error) {
        case 'inactive':
          return AUTH_ERRORS.INACTIVE_USER.messageAr || AUTH_ERRORS.INACTIVE_USER.message;
        case 'no-shop':
          return t('errors.noShop', { defaultValue: 'A shop must be assigned to your account' });
        default:
          return t('errors.loginFailed');
      }
    }
    return error?.message;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 ${rtlClasses.card}`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-2xl font-bold text-gray-900 dark:text-white ${rtlClasses.cardHeader}`}>
          {t('login.title')}
        </h1>
        <LanguageToggle />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${rtlClasses.formLabel}`}>
            {t('login.email')}
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            onChange={(e) => checkUserRole(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } ${rtlClasses.formInput}`}
            placeholder={t('login.email')}
          />
          {errors.email && (
            <p className={`mt-1 text-sm text-red-600 dark:text-red-400 ${rtlClasses.formHelp}`}>
              {t('errors.invalidEmail')}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isRTL ? 'كلمة المرور' : 'Password'}
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            } ${isRTL ? 'text-right' : 'text-left'}`}
            placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter your password'}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {isRTL ? 'كلمة المرور مطلوبة (8 أحرف على الأقل)' : errors.password.message}
            </p>
          )}
        </div>

        {/* Shop Selection for Users */}
        {showShopSelect && (
          <div>
            <label htmlFor="shopId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isRTL ? 'اختر المتجر' : 'Select Shop'}
            </label>
            <select
              {...register('shopId')}
              id="shopId"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.shopId ? 'border-red-500' : 'border-gray-300'
              } ${isRTL ? 'text-right' : 'text-left'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <option value="">
                {isRTL ? 'اختر المتجر' : 'Select Shop'}
              </option>
              {mockShops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {isRTL ? shop.nameAr : shop.nameEn}
                </option>
              ))}
            </select>
            {errors.shopId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {isRTL ? 'يرجى اختيار متجر' : 'Please select a shop'}
              </p>
            )}
          </div>
        )}

        {/* Error Display */}
        {(errors.root || searchParams?.error) && (
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className={`${isRTL ? 'mr-3' : 'ml-3'}`}>
                <p className="text-sm text-red-800 dark:text-red-200">
                  {getErrorMessage(errors.root)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : null}
          {isLoading
            ? (isRTL ? 'جاري تسجيل الدخول...' : 'Signing in...')
            : (isRTL ? 'تسجيل الدخول' : 'Sign In')
          }
        </button>
      </form>

      {/* Demo Credentials */}
      <div className="mt-8 border-t dark:border-gray-700 pt-6">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          {isRTL ? 'حسابات تجريبية:' : 'Demo Accounts:'}
        </h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>{isRTL ? 'مدير:' : 'Admin:'}</strong> admin@shop1.com / password123
          </p>
          <p>
            <strong>{isRTL ? 'مستخدم:' : 'User:'}</strong> user@shop1.com / password123
          </p>
        </div>
      </div>
    </div>
  );
}