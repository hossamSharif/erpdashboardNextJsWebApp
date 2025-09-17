import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { TRPCError } from '@trpc/server';
import { publicProcedure, router } from '../trpc';
import {
  loginSchema,
  AUTH_CONSTANTS,
  AUTH_ERRORS,
  UserRole
} from '@multi-shop/shared';

// Rate limiting store (will be replaced with Redis in production)
const loginAttempts = new Map<string, { count: number; lastAttempt: Date }>();

// Mock user data - will be replaced with Prisma database calls
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

const mockShops = [
  {
    id: 'shop-1',
    nameAr: 'متجر الإلكترونيات',
    nameEn: 'Electronics Store',
    ownerId: '1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Rate limiting helper
function checkRateLimit(identifier: string): boolean {
  const now = new Date();
  const attempt = loginAttempts.get(identifier);

  if (!attempt) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }

  const timeDiff = now.getTime() - attempt.lastAttempt.getTime();
  const windowMs = AUTH_CONSTANTS.RATE_LIMIT.WINDOW_MINUTES * 60 * 1000;

  if (timeDiff > windowMs) {
    // Reset counter if window expired
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }

  if (attempt.count >= AUTH_CONSTANTS.RATE_LIMIT.MAX_ATTEMPTS) {
    return false;
  }

  attempt.count++;
  attempt.lastAttempt = now;
  return true;
}

export const authRouter = router({
  signIn: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      const { email, password, shopId } = input;

      // Rate limiting check
      const rateLimitKey = `${ctx.req?.ip || 'unknown'}:${email}`;
      if (!checkRateLimit(rateLimitKey)) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: AUTH_ERRORS.RATE_LIMITED.message,
          cause: AUTH_ERRORS.RATE_LIMITED
        });
      }

      try {
        // Find user by email (will be replaced with Prisma query)
        const user = mockUsers.find(u => u.email === email);

        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: AUTH_ERRORS.INVALID_CREDENTIALS.message,
            cause: AUTH_ERRORS.INVALID_CREDENTIALS
          });
        }

        // Check if user is active
        if (!user.isActive) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: AUTH_ERRORS.INACTIVE_USER.message,
            cause: AUTH_ERRORS.INACTIVE_USER
          });
        }

        // Verify password with bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: AUTH_ERRORS.INVALID_CREDENTIALS.message,
            cause: AUTH_ERRORS.INVALID_CREDENTIALS
          });
        }

        // For USER role, validate shop access
        if (user.role === UserRole.USER) {
          if (shopId && user.shopId !== shopId) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: AUTH_ERRORS.SHOP_ACCESS_DENIED.message,
              cause: AUTH_ERRORS.SHOP_ACCESS_DENIED
            });
          }
        }

        // Get shop information if needed
        let shop = null;
        if (user.shopId) {
          shop = mockShops.find(s => s.id === user.shopId);
        }

        // Reset rate limit on successful login
        loginAttempts.delete(rateLimitKey);

        // Return user data (excluding password)
        const { password: _, ...userWithoutPassword } = user;

        return {
          user: userWithoutPassword,
          shop,
          message: 'Login successful'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Login failed',
          cause: error
        });
      }
    }),

  getSession: publicProcedure
    .query(async ({ ctx }) => {
      // This will be used with NextAuth session
      // For now, return null - will be implemented with session validation
      return null;
    }),

  updateProfile: publicProcedure
    .input(z.object({
      nameAr: z.string().min(1),
      nameEn: z.string().min(1)
    }))
    .mutation(async ({ input, ctx }) => {
      // TODO: Implement with session validation and database update
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Profile update not implemented yet'
      });
    }),

  changePassword: publicProcedure
    .input(z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8).max(100)
    }))
    .mutation(async ({ input, ctx }) => {
      // TODO: Implement with session validation and password update
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Password change not implemented yet'
      });
    })
});