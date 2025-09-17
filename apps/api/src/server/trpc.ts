import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getServerSession } from 'next-auth/next';
import { UserRole } from '@multi-shop/shared';
import { z } from 'zod';
import { authOptions } from '../../../web/src/app/api/auth/[...nextauth]/route';

// Create context for tRPC
export const createContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // Get the session from NextAuth
  const session = await getServerSession(req, res, authOptions);

  return {
    req,
    res,
    session,
    user: session?.user || null
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create();

// Base router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure
  .use(t.middleware(({ ctx, next }) => {
    if (!ctx.session || !ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
    }

    if (!ctx.user.isActive) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Account is inactive'
      });
    }

    return next({
      ctx: {
        ...ctx,
        session: ctx.session,
        user: ctx.user
      }
    });
  }));

// Admin-only procedure
export const adminProcedure = protectedProcedure
  .use(t.middleware(({ ctx, next }) => {
    if (ctx.user.role !== UserRole.ADMIN) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Admin access required'
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user as typeof ctx.user & { role: 'ADMIN' }
      }
    });
  }));

// Shop-scoped procedure - ensures user has access to shop data
export const shopProcedure = protectedProcedure
  .input(z.object({ shopId: z.string().uuid() }))
  .use(t.middleware(({ ctx, input, next }) => {
    const { user } = ctx;

    // Admin can access any shop they own
    if (user.role === UserRole.ADMIN) {
      // TODO: Validate shop ownership in database
      return next({ ctx });
    }

    // Regular users can only access their assigned shop
    if (user.role === UserRole.USER) {
      if (!user.shopId || user.shopId !== input.shopId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied to this shop'
        });
      }
    }

    return next({ ctx });
  }));