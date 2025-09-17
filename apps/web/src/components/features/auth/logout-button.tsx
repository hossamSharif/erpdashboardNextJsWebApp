'use client';

import { signOut } from 'next-auth/react';
import { useAuthStore } from '../../../stores/auth-store';

interface LogoutButtonProps {
  variant?: 'button' | 'link';
  className?: string;
}

export function LogoutButton({ variant = 'button', className = '' }: LogoutButtonProps) {
  const { language, logout } = useAuthStore();
  const isRTL = language === 'ar';

  const handleLogout = async () => {
    try {
      // Clear Zustand store
      logout();

      // Sign out with NextAuth
      await signOut({
        callbackUrl: '/login',
        redirect: true
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const baseClasses = variant === 'button'
    ? 'inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors'
    : 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors';

  return (
    <button
      onClick={handleLogout}
      className={`${baseClasses} ${className}`}
      type="button"
    >
      <svg
        className={`h-4 w-4 ${variant === 'button' ? (isRTL ? 'ml-2' : 'mr-2') : (isRTL ? 'ml-1' : 'mr-1')}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      {isRTL ? 'تسجيل الخروج' : 'Logout'}
    </button>
  );
}