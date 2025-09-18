import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { UserRole } from '@multi-shop/shared';
import { AccountService } from '../services/account.service';

export const accountsRouter = router({
  getCustomers: protectedProcedure
    .input(z.object({
      shopId: z.string().uuid(),
      searchTerm: z.string().optional()
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { shopId, searchTerm } = input;

        // For regular users, check if they have access to this shop
        if (ctx.user.role === UserRole.USER && ctx.user.shopId !== shopId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to this shop'
          });
        }

        const customers = await AccountService.getCustomers(shopId, searchTerm);

        return customers;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch customers',
          cause: error
        });
      }
    }),

  getCashBankAccounts: protectedProcedure
    .input(z.object({
      shopId: z.string().uuid()
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { shopId } = input;

        // For regular users, check if they have access to this shop
        if (ctx.user.role === UserRole.USER && ctx.user.shopId !== shopId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to this shop'
          });
        }

        const accounts = await AccountService.getCashBankAccounts(shopId);

        return accounts;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch cash/bank accounts',
          cause: error
        });
      }
    }),

  createCustomer: protectedProcedure
    .input(z.object({
      shopId: z.string().uuid(),
      nameAr: z.string().min(1, 'Arabic name is required'),
      nameEn: z.string().min(1, 'English name is required'),
      code: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { shopId, ...customerData } = input;

        // For regular users, check if they have access to this shop
        if (ctx.user.role === UserRole.USER && ctx.user.shopId !== shopId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to this shop'
          });
        }

        const customer = await AccountService.createCustomer({
          ...customerData,
          shopId
        });

        return customer;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create customer',
          cause: error
        });
      }
    })
});