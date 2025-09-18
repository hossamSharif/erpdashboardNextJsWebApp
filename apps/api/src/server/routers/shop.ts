import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import {
  createShopSchema,
  updateShopSchema,
  shopIdSchema,
  shopListSchema,
  UserRole
} from '@multi-shop/shared';
import { ShopService } from '../services/shop.service';

export const shopRouter = router({
  create: adminProcedure
    .input(createShopSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const shop = await ShopService.createShop(input, ctx.user.id);

        return {
          shop,
          message: 'Shop created successfully'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create shop',
          cause: error
        });
      }
    }),

  list: protectedProcedure
    .input(shopListSchema)
    .query(async ({ input, ctx }) => {
      try {
        const result = await ShopService.listShops(
          input,
          ctx.user.id,
          ctx.user.role
        );

        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch shops',
          cause: error
        });
      }
    }),

  getById: protectedProcedure
    .input(shopIdSchema)
    .query(async ({ input, ctx }) => {
      try {
        const { id } = input;

        // For regular users, check if they have access to this shop
        if (ctx.user.role === UserRole.USER && ctx.user.shopId !== id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to this shop'
          });
        }

        // For admins, validate ownership
        if (ctx.user.role === UserRole.ADMIN) {
          await ShopService.validateShopOwnership(id, ctx.user.id);
        }

        const shop = await ShopService.getShopWithUsers(id);

        if (!shop) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Shop not found'
          });
        }

        return shop;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch shop',
          cause: error
        });
      }
    }),

  update: adminProcedure
    .input(updateShopSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id } = input;

        // Validate ownership
        await ShopService.validateShopOwnership(id, ctx.user.id);

        const shop = await ShopService.updateShop(input);

        return {
          shop,
          message: 'Shop updated successfully'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update shop',
          cause: error
        });
      }
    }),

  softDelete: adminProcedure
    .input(shopIdSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { id } = input;

        // Validate ownership
        await ShopService.validateShopOwnership(id, ctx.user.id);

        const shop = await ShopService.softDeleteShop(id);

        return {
          shop,
          message: 'Shop deactivated successfully'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to deactivate shop',
          cause: error
        });
      }
    }),

  toggleStatus: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      isActive: z.boolean()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, isActive } = input;

        // Validate ownership
        await ShopService.validateShopOwnership(id, ctx.user.id);

        const shop = await ShopService.updateShop({
          id,
          isActive
        });

        return {
          shop,
          message: `Shop ${isActive ? 'activated' : 'deactivated'} successfully`
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update shop status',
          cause: error
        });
      }
    }),

  checkCodeAvailability: adminProcedure
    .input(z.object({
      code: z.string(),
      excludeId: z.string().uuid().optional()
    }))
    .query(async ({ input }) => {
      try {
        const { code, excludeId } = input;

        await ShopService.validateUniqueCode(code, excludeId);

        return { available: true };
      } catch (error) {
        if (error instanceof TRPCError && error.code === 'CONFLICT') {
          return { available: false };
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check code availability',
          cause: error
        });
      }
    }),

  checkNameAvailability: adminProcedure
    .input(z.object({
      nameAr: z.string(),
      nameEn: z.string(),
      excludeId: z.string().uuid().optional()
    }))
    .query(async ({ input }) => {
      try {
        const { nameAr, nameEn, excludeId } = input;

        await ShopService.validateUniqueNames(nameAr, nameEn, excludeId);

        return { available: true };
      } catch (error) {
        if (error instanceof TRPCError && error.code === 'CONFLICT') {
          return { available: false };
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check name availability',
          cause: error
        });
      }
    }),

  getDashboard: protectedProcedure
    .input(z.object({
      shopId: z.string().uuid(),
      date: z.date().optional()
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { shopId, date = new Date() } = input;

        // For regular users, check if they have access to this shop
        if (ctx.user.role === UserRole.USER && ctx.user.shopId !== shopId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to this shop'
          });
        }

        // For admins, validate ownership
        if (ctx.user.role === UserRole.ADMIN) {
          await ShopService.validateShopOwnership(shopId, ctx.user.id);
        }

        const result = await ShopService.getDashboardData(shopId, date);

        return result;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch dashboard data',
          cause: error
        });
      }
    })
});