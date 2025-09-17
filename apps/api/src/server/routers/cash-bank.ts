import { z } from 'zod';
import { createTRPCRouter, adminProcedure, protectedProcedure } from '../trpc';
import { CashAccountRepository } from '../db/repositories/cashAccount';
import { BankAccountRepository } from '../db/repositories/bankAccount';
import { BalanceHistoryService } from '../services/balance-history.service';
import {
  createCashAccountSchema,
  createBankAccountSchema,
  updateAccountBalanceSchema,
  setDefaultPaymentAccountSchema,
} from '@packages/shared/src/validators/cashBankAccount';
import { AccountCategory } from '@packages/shared/src/types/cashBankAccount';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';

export const cashBankRouter = createTRPCRouter({
  createCashAccount: adminProcedure
    .input(createCashAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx;
      const shopId = session.user.shopId;

      const cashAccountRepo = new CashAccountRepository(prisma);

      try {
        const cashAccount = await cashAccountRepo.create({
          ...input,
          shopId,
          openingBalance: new Prisma.Decimal(input.openingBalance),
        });

        return cashAccount;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create cash account',
        });
      }
    }),

  createBankAccount: adminProcedure
    .input(createBankAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx;
      const shopId = session.user.shopId;

      const bankAccountRepo = new BankAccountRepository(prisma);

      try {
        const bankAccount = await bankAccountRepo.create({
          ...input,
          shopId,
          openingBalance: new Prisma.Decimal(input.openingBalance),
        });

        return bankAccount;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create bank account',
        });
      }
    }),

  updateAccountBalance: adminProcedure
    .input(updateAccountBalanceSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx;
      const shopId = session.user.shopId;
      const userId = session.user.id;

      const { accountId, accountType, newBalance, changeReason } = input;

      try {
        if (accountType === AccountCategory.CASH) {
          const cashAccountRepo = new CashAccountRepository(prisma);
          const updatedAccount = await cashAccountRepo.updateBalance(
            accountId,
            shopId,
            new Prisma.Decimal(newBalance),
            changeReason,
            userId
          );
          return updatedAccount;
        } else {
          const bankAccountRepo = new BankAccountRepository(prisma);
          const updatedAccount = await bankAccountRepo.updateBalance(
            accountId,
            shopId,
            new Prisma.Decimal(newBalance),
            changeReason,
            userId
          );
          return updatedAccount;
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update account balance',
        });
      }
    }),

  setDefaultPaymentAccount: adminProcedure
    .input(setDefaultPaymentAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx;
      const shopId = session.user.shopId;

      const { accountId, accountType } = input;

      try {
        if (accountType === AccountCategory.CASH) {
          const cashAccountRepo = new CashAccountRepository(prisma);
          const updatedAccount = await cashAccountRepo.update(
            accountId,
            shopId,
            { isDefault: true }
          );
          return updatedAccount;
        } else {
          const bankAccountRepo = new BankAccountRepository(prisma);
          const updatedAccount = await bankAccountRepo.update(
            accountId,
            shopId,
            { isDefault: true }
          );
          return updatedAccount;
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to set default payment account',
        });
      }
    }),

  getCashAccounts: protectedProcedure
    .query(async ({ ctx }) => {
      const { session, prisma } = ctx;
      const shopId = session.user.shopId;

      const cashAccountRepo = new CashAccountRepository(prisma);

      try {
        const accounts = await cashAccountRepo.findAllByShop(shopId);
        return accounts;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch cash accounts',
        });
      }
    }),

  getBankAccounts: protectedProcedure
    .query(async ({ ctx }) => {
      const { session, prisma } = ctx;
      const shopId = session.user.shopId;

      const bankAccountRepo = new BankAccountRepository(prisma);

      try {
        const accounts = await bankAccountRepo.findAllByShop(shopId);
        return accounts;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch bank accounts',
        });
      }
    }),

  getBalanceHistory: protectedProcedure
    .input(z.object({
      accountId: z.string().uuid(),
      accountType: z.nativeEnum(AccountCategory),
      limit: z.number().optional().default(50),
      offset: z.number().optional().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { session, prisma } = ctx;
      const shopId = session.user.shopId;

      const balanceHistoryService = new BalanceHistoryService(prisma);

      try {
        const history = await balanceHistoryService.getAccountHistory(
          input.accountId,
          input.accountType,
          shopId,
          {
            limit: input.limit,
            offset: input.offset,
          }
        );
        return history;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch balance history',
        });
      }
    }),

  deleteCashAccount: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx;
      const shopId = session.user.shopId;

      const cashAccountRepo = new CashAccountRepository(prisma);

      try {
        await cashAccountRepo.delete(input.id, shopId);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete cash account',
        });
      }
    }),

  deleteBankAccount: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx;
      const shopId = session.user.shopId;

      const bankAccountRepo = new BankAccountRepository(prisma);

      try {
        await bankAccountRepo.delete(input.id, shopId);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete bank account',
        });
      }
    }),
});