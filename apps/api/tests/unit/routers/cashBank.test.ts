import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cashBankRouter } from '../../../src/server/routers/cash-bank';
import { createInnerTRPCContext } from '../../../src/server/trpc';
import { PrismaClient } from '@prisma/client';
import { UserRole } from '@prisma/client';

vi.mock('@prisma/client', () => {
  const PrismaClient = vi.fn();
  PrismaClient.prototype.cashAccount = {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  };
  PrismaClient.prototype.bankAccount = {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  };
  PrismaClient.prototype.balanceHistory = {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
  };
  PrismaClient.prototype.$transaction = vi.fn();

  return { PrismaClient };
});

describe('cashBankRouter', () => {
  let prisma: PrismaClient;
  let ctx: ReturnType<typeof createInnerTRPCContext>;
  let caller: ReturnType<typeof cashBankRouter.createCaller>;

  beforeEach(() => {
    prisma = new PrismaClient();

    ctx = createInnerTRPCContext({
      session: {
        user: {
          id: 'test-user-id',
          email: 'admin@test.com',
          name: 'Test Admin',
          role: UserRole.ADMIN,
          shopId: 'test-shop-id',
        },
        expires: '2024-12-31',
      },
      prisma,
    });

    caller = cashBankRouter.createCaller(ctx);
  });

  describe('createCashAccount', () => {
    it('should create a cash account successfully', async () => {
      const input = {
        nameAr: 'الصندوق الرئيسي',
        nameEn: 'Main Cash',
        openingBalance: 1000,
        isDefault: false,
      };

      const expectedAccount = {
        id: 'cash-account-id',
        ...input,
        currentBalance: input.openingBalance,
        shopId: 'test-shop-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      (prisma.cashAccount.create as any).mockResolvedValue(expectedAccount);

      const result = await caller.createCashAccount(input);

      expect(result).toEqual(expectedAccount);
      expect(prisma.cashAccount.create).toHaveBeenCalledWith({
        data: {
          nameAr: input.nameAr,
          nameEn: input.nameEn,
          shopId: 'test-shop-id',
          openingBalance: expect.any(Object),
          currentBalance: expect.any(Object),
          isDefault: false,
        },
      });
    });

    it('should unset other default accounts when creating a default account', async () => {
      const input = {
        nameAr: 'الصندوق الافتراضي',
        nameEn: 'Default Cash',
        openingBalance: 500,
        isDefault: true,
      };

      const expectedAccount = {
        id: 'default-cash-account-id',
        ...input,
        currentBalance: input.openingBalance,
        shopId: 'test-shop-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      (prisma.cashAccount.updateMany as any).mockResolvedValue({ count: 1 });
      (prisma.cashAccount.create as any).mockResolvedValue(expectedAccount);

      const result = await caller.createCashAccount(input);

      expect(prisma.cashAccount.updateMany).toHaveBeenCalledWith({
        where: {
          shopId: 'test-shop-id',
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
      expect(result).toEqual(expectedAccount);
    });
  });

  describe('createBankAccount', () => {
    it('should create a bank account successfully', async () => {
      const input = {
        nameAr: 'البنك الأهلي',
        nameEn: 'National Bank',
        accountNumber: '1234567890',
        bankName: 'National Bank',
        iban: 'SA1234567890',
        openingBalance: 50000,
        isDefault: false,
      };

      const expectedAccount = {
        id: 'bank-account-id',
        ...input,
        currentBalance: input.openingBalance,
        shopId: 'test-shop-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      (prisma.bankAccount.create as any).mockResolvedValue(expectedAccount);

      const result = await caller.createBankAccount(input);

      expect(result).toEqual(expectedAccount);
      expect(prisma.bankAccount.create).toHaveBeenCalledWith({
        data: {
          nameAr: input.nameAr,
          nameEn: input.nameEn,
          accountNumber: input.accountNumber,
          bankName: input.bankName,
          iban: input.iban,
          shopId: 'test-shop-id',
          openingBalance: expect.any(Object),
          currentBalance: expect.any(Object),
          isDefault: false,
        },
      });
    });
  });

  describe('updateAccountBalance', () => {
    it('should update cash account balance and create history', async () => {
      const currentAccount = {
        id: 'cash-account-id',
        currentBalance: '1000',
        shopId: 'test-shop-id',
      };

      const input = {
        accountId: 'cash-account-id',
        accountType: 'CASH' as const,
        newBalance: 1500,
        changeReason: 'Cash deposit',
      };

      const updatedAccount = {
        ...currentAccount,
        currentBalance: '1500',
      };

      (prisma.cashAccount.findFirst as any).mockResolvedValue(currentAccount);
      (prisma.$transaction as any).mockResolvedValue([updatedAccount, {}]);

      const result = await caller.updateAccountBalance(input);

      expect(result).toEqual(updatedAccount);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should update bank account balance and create history', async () => {
      const currentAccount = {
        id: 'bank-account-id',
        currentBalance: '50000',
        shopId: 'test-shop-id',
      };

      const input = {
        accountId: 'bank-account-id',
        accountType: 'BANK' as const,
        newBalance: 45000,
        changeReason: 'Wire transfer',
      };

      const updatedAccount = {
        ...currentAccount,
        currentBalance: '45000',
      };

      (prisma.bankAccount.findFirst as any).mockResolvedValue(currentAccount);
      (prisma.$transaction as any).mockResolvedValue([updatedAccount, {}]);

      const result = await caller.updateAccountBalance(input);

      expect(result).toEqual(updatedAccount);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('getCashAccounts', () => {
    it('should fetch all cash accounts for the shop', async () => {
      const mockAccounts = [
        {
          id: 'cash-1',
          nameEn: 'Main Cash',
          currentBalance: '1000',
          isDefault: true,
        },
        {
          id: 'cash-2',
          nameEn: 'Petty Cash',
          currentBalance: '200',
          isDefault: false,
        },
      ];

      (prisma.cashAccount.findMany as any).mockResolvedValue(mockAccounts);

      const result = await caller.getCashAccounts();

      expect(result).toEqual(mockAccounts);
      expect(prisma.cashAccount.findMany).toHaveBeenCalledWith({
        where: {
          shopId: 'test-shop-id',
        },
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: 'desc' },
        ],
      });
    });
  });

  describe('getBankAccounts', () => {
    it('should fetch all bank accounts for the shop', async () => {
      const mockAccounts = [
        {
          id: 'bank-1',
          nameEn: 'National Bank',
          accountNumber: '1234567890',
          currentBalance: '50000',
          isDefault: true,
        },
        {
          id: 'bank-2',
          nameEn: 'Commercial Bank',
          accountNumber: '0987654321',
          currentBalance: '25000',
          isDefault: false,
        },
      ];

      (prisma.bankAccount.findMany as any).mockResolvedValue(mockAccounts);

      const result = await caller.getBankAccounts();

      expect(result).toEqual(mockAccounts);
      expect(prisma.bankAccount.findMany).toHaveBeenCalledWith({
        where: {
          shopId: 'test-shop-id',
        },
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: 'desc' },
        ],
      });
    });
  });

  describe('getBalanceHistory', () => {
    it('should fetch balance history for an account', async () => {
      const input = {
        accountId: 'cash-account-id',
        accountType: 'CASH' as const,
        limit: 10,
        offset: 0,
      };

      const mockHistory = [
        {
          id: 'history-1',
          accountId: 'cash-account-id',
          accountType: 'CASH',
          previousBalance: '1000',
          newBalance: '1500',
          changeAmount: '500',
          changeReason: 'Cash deposit',
          createdAt: new Date(),
        },
      ];

      (prisma.balanceHistory.findMany as any).mockResolvedValue(mockHistory);

      const result = await caller.getBalanceHistory(input);

      expect(result).toEqual(mockHistory);
      expect(prisma.balanceHistory.findMany).toHaveBeenCalledWith({
        where: {
          accountId: input.accountId,
          accountType: input.accountType,
          shopId: 'test-shop-id',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: input.limit,
        skip: input.offset,
      });
    });
  });
});