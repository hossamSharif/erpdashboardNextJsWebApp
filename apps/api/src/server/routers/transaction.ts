import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { UserRole } from '@multi-shop/shared';
import { TransactionService } from '../services/transaction.service';

export const transactionRouter = router({
  getDaily: protectedProcedure
    .input(z.object({
      shopId: z.string().uuid(),
      date: z.date()
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { shopId, date } = input;

        // For regular users, check if they have access to this shop
        if (ctx.user.role === UserRole.USER && ctx.user.shopId !== shopId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to this shop'
          });
        }

        const transactions = await TransactionService.getDailyTransactions(shopId, date);

        return transactions;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch daily transactions',
          cause: error
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      shopId: z.string().uuid()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, shopId } = input;

        // For regular users, check if they have access to this shop
        if (ctx.user.role === UserRole.USER && ctx.user.shopId !== shopId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to this shop'
          });
        }

        const result = await TransactionService.deleteTransaction(id, shopId);

        return {
          success: true,
          message: 'Transaction deleted successfully'
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete transaction',
          cause: error
        });
      }
    })
});