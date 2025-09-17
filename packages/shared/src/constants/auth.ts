export const AUTH_CONSTANTS = {
  SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
  RATE_LIMIT: {
    MAX_ATTEMPTS: 5,
    WINDOW_MINUTES: 15
  },
  BCRYPT_ROUNDS: 12,
  JWT_EXPIRES_IN: '8h'
} as const;

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    message: 'Invalid email or password',
    messageAr: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
  },
  RATE_LIMITED: {
    code: 'RATE_LIMITED',
    message: 'Too many login attempts. Please try again later.',
    messageAr: 'محاولات تسجيل دخول كثيرة جداً. يرجى المحاولة لاحقاً'
  },
  SESSION_EXPIRED: {
    code: 'SESSION_EXPIRED',
    message: 'Your session has expired. Please login again.',
    messageAr: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى'
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'You are not authorized to access this resource',
    messageAr: 'غير مخول للوصول لهذا المورد'
  },
  SHOP_ACCESS_DENIED: {
    code: 'SHOP_ACCESS_DENIED',
    message: 'You do not have access to this shop',
    messageAr: 'ليس لديك صلاحية للوصول لهذا المتجر'
  },
  INACTIVE_USER: {
    code: 'INACTIVE_USER',
    message: 'Your account has been deactivated',
    messageAr: 'تم إلغاء تفعيل حسابك'
  }
} as const;

export const AUTH_ROUTES = {
  LOGIN: '/login',
  LOGOUT: '/logout',
  DASHBOARD: '/dashboard',
  API: {
    LOGIN: '/api/auth/signin',
    LOGOUT: '/api/auth/signout',
    SESSION: '/api/auth/session'
  }
} as const;