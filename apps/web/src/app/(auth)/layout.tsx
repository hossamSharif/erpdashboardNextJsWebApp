'use client';

import { useAuthStore } from '../../stores/auth-store';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = useAuthStore();
  const isRTL = language === 'ar';

  return (
    <div className={`min-h-screen ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex min-h-screen">
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>

        {/* Background design */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-purple-700 items-center justify-center">
          <div className="text-center text-white px-8">
            <h1 className="text-4xl font-bold mb-4">
              {isRTL ? 'نظام المحاسبة متعدد المتاجر' : 'Multi-Shop Accounting System'}
            </h1>
            <p className="text-xl opacity-90">
              {isRTL
                ? 'إدارة محاسبة احترافية لمتاجر متعددة'
                : 'Professional accounting management for multiple shops'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}