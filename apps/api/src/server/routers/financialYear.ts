import { router, protectedProcedure, adminProcedure } from '../trpc';
import {
  createFinancialYearSchema,
  updateFinancialYearSchema,
  closeFinancialYearSchema,
  setCurrentFinancialYearSchema,
  listFinancialYearsSchema,
  financialYearIdSchema,
  updateOpeningStockValueSchema,
  updateClosingStockValueSchema,
  bulkUpdateStockValuesSchema
} from '@multi-shop/shared';
import { FinancialYearService } from '../services/financialYear.service';
import { TRPCError } from '@trpc/server';

export const financialYearRouter = router({
  // Create new financial year (admin only)
  create: adminProcedure
    .input(createFinancialYearSchema)
    .mutation(async ({ input, ctx }) => {
      const service = new FinancialYearService(ctx.prisma);

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
          message: 'You can only create financial years for shops you own'
        });
      }

      return service.create(input);
    }),

  // List financial years for a shop
  list: protectedProcedure
    .input(listFinancialYearsSchema)
    .query(async ({ input, ctx }) => {
      // Check if user has access to this shop
      if (ctx.user.role === 'USER' && ctx.user.shopId !== input.shopId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only access financial years for your assigned shop'
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
            message: 'You can only access financial years for shops you own'
          });
        }
      }

      const service = new FinancialYearService(ctx.prisma);
      return service.list(input.shopId);
    }),

  // Get financial year by ID
  getById: protectedProcedure
    .input(financialYearIdSchema)
    .query(async ({ input, ctx }) => {
      const service = new FinancialYearService(ctx.prisma);
      const financialYear = await service.getById(input.id);

      // Check if user has access to this shop
      if (ctx.user.role === 'USER' && ctx.user.shopId !== financialYear.shopId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only access financial years for your assigned shop'
        });
      }

      // For admin, check ownership
      if (ctx.user.role === 'ADMIN') {
        const shop = await ctx.prisma.shop.findFirst({
          where: {
            id: financialYear.shopId,
            ownerId: ctx.user.id
          }
        });

        if (!shop) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only access financial years for shops you own'
          });
        }
      }

      return financialYear;
    }),

  // Update financial year (admin only)
  update: adminProcedure
    .input(updateFinancialYearSchema)
    .mutation(async ({ input, ctx }) => {
      const service = new FinancialYearService(ctx.prisma);
      const existingYear = await service.getById(input.id);

      // Ensure the shop belongs to the admin
      const shop = await ctx.prisma.shop.findFirst({
        where: {
          id: existingYear.shopId,
          ownerId: ctx.user.id
        }
      });

      if (!shop) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update financial years for shops you own'
        });
      }

      return service.update(input);
    }),

  // Set current financial year (admin only)
  setCurrent: adminProcedure
    .input(setCurrentFinancialYearSchema)
    .mutation(async ({ input, ctx }) => {
      const service = new FinancialYearService(ctx.prisma);
      const financialYear = await service.getById(input.id);

      // Ensure the shop belongs to the admin
      const shop = await ctx.prisma.shop.findFirst({
        where: {
          id: financialYear.shopId,
          ownerId: ctx.user.id
        }
      });

      if (!shop) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only set current financial year for shops you own'
        });
      }

      return service.setCurrent(input.id);
    }),

  // Close financial year (admin only)
  close: adminProcedure
    .input(closeFinancialYearSchema)
    .mutation(async ({ input, ctx }) => {
      const service = new FinancialYearService(ctx.prisma);
      const financialYear = await service.getById(input.id);

      // Ensure the shop belongs to the admin
      const shop = await ctx.prisma.shop.findFirst({
        where: {
          id: financialYear.shopId,
          ownerId: ctx.user.id
        }
      });

      if (!shop) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only close financial years for shops you own'
        });
      }

      return service.close(input);
    }),

  // Get current financial year for a shop
  getCurrent: protectedProcedure
    .input(listFinancialYearsSchema)
    .query(async ({ input, ctx }) => {
      // Check if user has access to this shop
      if (ctx.user.role === 'USER' && ctx.user.shopId !== input.shopId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only access financial years for your assigned shop'
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
            message: 'You can only access financial years for shops you own'
          });
        }
      }

      const service = new FinancialYearService(ctx.prisma);
      return service.getCurrentForShop(input.shopId);
    }),

  // Delete financial year (admin only)
  delete: adminProcedure
    .input(financialYearIdSchema)
    .mutation(async ({ input, ctx }) => {
      const service = new FinancialYearService(ctx.prisma);
      const financialYear = await service.getById(input.id);

      // Ensure the shop belongs to the admin
      const shop = await ctx.prisma.shop.findFirst({
        where: {
          id: financialYear.shopId,
          ownerId: ctx.user.id
        }
      });

      if (!shop) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only delete financial years for shops you own'
        });
      }

      await service.delete(input.id);
      return { success: true };
    }),

  // Validate if a financial year allows transactions (for transaction creation)
  validateTransactionYear: protectedProcedure
    .input(financialYearIdSchema)
    .query(async ({ input, ctx }) => {
      const service = new FinancialYearService(ctx.prisma);
      return service.validateTransactionYear(input.id);
    }),

  // Update opening stock value (admin only)
  updateOpeningStockValue: adminProcedure
    .input(updateOpeningStockValueSchema)
    .mutation(async ({ input, ctx }) => {
      const service = new FinancialYearService(ctx.prisma);

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
          message: 'You can only update stock values for shops you own'
        });
      }

      return service.updateOpeningStockValue(input);
    }),

  // Update closing stock value (admin only)
  updateClosingStockValue: adminProcedure
    .input(updateClosingStockValueSchema)
    .mutation(async ({ input, ctx }) => {
      const service = new FinancialYearService(ctx.prisma);

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
          message: 'You can only update stock values for shops you own'
        });
      }

      return service.updateClosingStockValue(input);
    }),

  // Bulk update stock values for multiple shops (admin only)
  bulkUpdateStockValues: adminProcedure
    .input(bulkUpdateStockValuesSchema)
    .mutation(async ({ input, ctx }) => {
      const service = new FinancialYearService(ctx.prisma);

      // Validate that all shops belong to the admin
      const shopIds = input.updates.map(update => update.shopId);
      const shops = await ctx.prisma.shop.findMany({
        where: {
          id: { in: shopIds },
          ownerId: ctx.user.id
        }
      });

      if (shops.length !== shopIds.length) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update stock values for shops you own'
        });
      }

      return service.bulkUpdateStockValues(input.updates);
    })
});