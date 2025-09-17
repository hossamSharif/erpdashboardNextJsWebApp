import NextAuth from 'next-auth';
import { UserRole } from '@multi-shop/shared';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      nameAr: string;
      nameEn: string;
      role: UserRole;
      shopId: string;
      isActive: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    nameAr: string;
    nameEn: string;
    role: UserRole;
    shopId: string;
    isActive: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    nameAr: string;
    nameEn: string;
    role: UserRole;
    shopId: string;
    isActive: boolean;
  }
}