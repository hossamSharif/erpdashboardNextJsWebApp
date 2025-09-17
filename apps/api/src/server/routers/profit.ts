import { router, protectedProcedure, adminProcedure } from '../trpc';
import { z } from 'zod';
import { ProfitCalculationService } from '../services/profit-calculation.service';
import { TRPCError } from '@trpc/server';

// Input validation schemas
const calculateYearProfitSchema = z.object({
  financialYearId: z.string().uuid('Invalid financial year ID'),
  shopId: z.string().uuid('Invalid shop ID')
});

const calculateShopProfitsSchema = z.object({
  shopId: z.string().uuid('Invalid shop ID')
});

const compareProfitsSchema = z.object({
  currentYearId: z.string().uuid('Invalid current year ID'),
  previousYearId: z.string().uuid('Invalid previous year ID'),
  shopId: z.string().uuid('Invalid shop ID')
});

const validateYearClosureSchema = z.object({
  financialYearId: z.string().uuid('Invalid financial year ID'),
  shopId: z.string().uuid('Invalid shop ID'),
  proposedClosingStockValue: z.number().nonnegative('Closing stock value must be non-negative')
});

const getProfitTrendsSchema = z.object({
  shopId: z.string().uuid('Invalid shop ID'),
  yearCount: z.number().int().min(1).max(10).optional().default(5)
});

export const profitRouter = router({
  // Calculate profit for a specific financial year
  calculateYearProfit: protectedProcedure
    .input(calculateYearProfitSchema)
    .query(async ({ input, ctx }) => {
      // Check if user has access to this shop
      if (ctx.user.role === 'USER' && ctx.user.shopId !== input.shopId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only access profit calculations for your assigned shop'
        });
      }

      // For admin, check ownership
      if (ctx.user.role === 'ADMIN') {
        const shop = await ctx.prisma.shop.findFirst({
          where: {
            id: input.shopId,
            ownerId: ctx.user.id
          }
        });

        if (!shop) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only access profit calculations for shops you own'
          });
        }
      }

      const service = new ProfitCalculationService(ctx.prisma);
      return service.calculateYearProfit(input.financialYearId, input.shopId);
    }),

  // Calculate profits for all financial years of a shop
  calculateShopProfits: protectedProcedure
    .input(calculateShopProfitsSchema)
    .query(async ({ input, ctx }) => {
      // Check if user has access to this shop
      if (ctx.user.role === 'USER' && ctx.user.shopId !== input.shopId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only access profit calculations for your assigned shop'
        });
      }

      // For admin, check ownership
      if (ctx.user.role === 'ADMIN') {
        const shop = await ctx.prisma.shop.findFirst({
          where: {
            id: input.shopId,
            ownerId: ctx.user.id
          }
        });

        if (!shop) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only access profit calculations for shops you own'
          });
        }
      }

      const service = new ProfitCalculationService(ctx.prisma);
      return service.calculateShopProfits(input.shopId);
    }),

  // Compare profits between two financial years
  compareProfits: protectedProcedure
    .input(compareProfitsSchema)
    .query(async ({ input, ctx }) => {
      // Check if user has access to this shop
      if (ctx.user.role === 'USER' && ctx.user.shopId !== input.shopId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only access profit calculations for your assigned shop'
        });
      }

      // For admin, check ownership
      if (ctx.user.role === 'ADMIN') {
        const shop = await ctx.prisma.shop.findFirst({
          where: {
            id: input.shopId,
            ownerId: ctx.user.id
          }
        });

        if (!shop) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only access profit calculations for shops you own'
          });
        }
      }

      const service = new ProfitCalculationService(ctx.prisma);
      return service.compareProfits(input.currentYearId, input.previousYearId, input.shopId);
    }),

  // Validate financial year closure with proposed closing stock value
  validateYearClosure: adminProcedure
    .input(validateYearClosureSchema)
    .query(async ({ input, ctx }) => {
      // Ensure the shop belongs to the admin
      const shop = await ctx.prisma.shop.findFirst({
        where: {
          id: input.shopId,
          ownerId: ctx.user.id
        }
      });

      if (!shop) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only validate year closure for shops you own'
        });
      }

      const service = new ProfitCalculationService(ctx.prisma);
      return service.validateYearClosure(
        input.financialYearId,
        input.shopId,
        input.proposedClosingStockValue
      );
    }),

  // Get profit trends over multiple years
  getProfitTrends: protectedProcedure
    .input(getProfitTrendsSchema)
    .query(async ({ input, ctx }) => {
      // Check if user has access to this shop
      if (ctx.user.role === 'USER' && ctx.user.shopId !== input.shopId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only access profit trends for your assigned shop'
        });
      }

      // For admin, check ownership
      if (ctx.user.role === 'ADMIN') {
        const shop = await ctx.prisma.shop.findFirst({
          where: {
            id: input.shopId,
            ownerId: ctx.user.id
          }
        });

        if (!shop) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only access profit trends for shops you own'
          });
        }
      }

      const service = new ProfitCalculationService(ctx.prisma);
      return service.getProfitTrends(input.shopId, input.yearCount);
    })
});