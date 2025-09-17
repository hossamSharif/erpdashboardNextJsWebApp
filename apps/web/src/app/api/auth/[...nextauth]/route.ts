import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AUTH_CONSTANTS, AUTH_ERRORS, loginSchema } from '@multi-shop/shared';

// Mock user data - will be replaced with database calls in Task 2
const mockUsers = [
  {
    id: '1',
    email: 'admin@shop1.com',
    password: '$2a$12$rZ8qQe.6zH9Zv5J7P1cO7u1xY.3nF8wB2mC5dE6fG7hI8jK9lM0nO', // password123
    nameAr: 'المدير الأول',
    nameEn: 'Admin User',
    role: 'ADMIN' as const,
    shopId: 'shop-1',
    isActive: true,
    lastSyncAt: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    email: 'user@shop1.com',
    password: '$2a$12$rZ8qQe.6zH9Zv5J7P1cO7u1xY.3nF8wB2mC5dE6fG7hI8jK9lM0nO', // password123
    nameAr: 'المستخدم الأول',
    nameEn: 'Regular User',
    role: 'USER' as const,
    shopId: 'shop-1',
    isActive: true,
    lastSyncAt: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        shopId: { label: 'Shop ID', type: 'text' }
      },
      async authorize(credentials) {
        try {
          // Validate credentials format
          const validatedCredentials = loginSchema.parse(credentials);

          // Find user by email (will be replaced with database query)
          const user = mockUsers.find(u => u.email === validatedCredentials.email);

          if (!user) {
            throw new Error(JSON.stringify(AUTH_ERRORS.INVALID_CREDENTIALS));
          }

          // Check if user is active
          if (!user.isActive) {
            throw new Error(JSON.stringify(AUTH_ERRORS.INACTIVE_USER));
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            validatedCredentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error(JSON.stringify(AUTH_ERRORS.INVALID_CREDENTIALS));
          }

          // For USER role, validate shop access
          if (user.role === 'USER' && validatedCredentials.shopId) {
            if (user.shopId !== validatedCredentials.shopId) {
              throw new Error(JSON.stringify(AUTH_ERRORS.SHOP_ACCESS_DENIED));
            }
          }

          // Return user data (excluding password)
          const { password: _, ...userWithoutPassword } = user;
          return {
            id: userWithoutPassword.id,
            email: userWithoutPassword.email,
            name: userWithoutPassword.nameEn, // NextAuth expects 'name'
            ...userWithoutPassword
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: AUTH_CONSTANTS.SESSION_TIMEOUT / 1000 // 8 hours in seconds
  },

  jwt: {
    maxAge: AUTH_CONSTANTS.SESSION_TIMEOUT / 1000 // 8 hours in seconds
  },

  callbacks: {
    async jwt({ token, user }) {
      // Include user data in JWT token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.nameAr = user.nameAr;
        token.nameEn = user.nameEn;
        token.role = user.role;
        token.shopId = user.shopId;
        token.isActive = user.isActive;
      }
      return token;
    },

    async session({ session, token }) {
      // Include user data in session
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.nameAr = token.nameAr as string;
        session.user.nameEn = token.nameEn as string;
        session.user.role = token.role as 'ADMIN' | 'USER';
        session.user.shopId = token.shopId as string;
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    }
  },

  pages: {
    signIn: '/login',
    signOut: '/logout'
  },

  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };