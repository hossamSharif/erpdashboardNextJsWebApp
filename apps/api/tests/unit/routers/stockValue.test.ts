import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TRPCError } from '@trpc/server';
import { createCallerFactory } from '@trpc/server';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';

import { appRouter } from '../../../src/server/routers';
import type { Context } from '../../../src/server/trpc';

const prismaMock = mockDeep<PrismaClient>();
const createCaller = createCallerFactory(appRouter);

// Mock user context
const mockAdminContext: Context = {
  user: {
    id: 'admin-123',
    email: 'admin@test.com',
    role: 'ADMIN',
    shopId: 'shop-123',
    isActive: true,
    name: 'Test Admin'
  },
  prisma: prismaMock
};

const mockUserContext: Context = {
  user: {
    id: 'user-456',
    email: 'user@test.com',
    role: 'USER',
    shopId: 'shop-456',
    isActive: true,
    name: 'Test User'
  },
  prisma: prismaMock
};

describe('Stock Value Management API', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  describe('updateOpeningStockValue', () => {
    it('should update opening stock value successfully', async () => {
      const mockShop = {
        id: 'shop-123',
        ownerId: 'admin-123',
        nameAr: 'متجر تجريبي',
        nameEn: 'Test Shop'
      };

      const mockFinancialYear = {
        id: 'fy-123',
        shopId: 'shop-123',
        openingStockValue: new Decimal('10000'),
        closingStockValue: null,
        isClosed: false,
        name: '2024'
      };

      const mockUpdatedYear = {
        ...mockFinancialYear,
        openingStockValue: new Decimal('15000'),
        shop: mockShop,
        _count: { transactions: 0 }
      };

      prismaMock.shop.findFirst.mockResolvedValue(mockShop);
      prismaMock.financialYear.findFirst.mockResolvedValue(mockFinancialYear);
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback({
          stockValueHistory: {
            create: vi.fn().mockResolvedValue({})
          },
          financialYear: {
            update: vi.fn().mockResolvedValue(mockUpdatedYear)
          }
        });
      });

      const caller = createCaller(mockAdminContext);
      const result = await caller.financialYear.updateOpeningStockValue({
        shopId: 'shop-123',
        financialYearId: 'fy-123',
        openingStockValue: 15000
      });

      expect(result.openingStockValue).toBe(15000);
      expect(prismaMock.shop.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'shop-123',
          ownerId: 'admin-123'
        }
      });
    });

    it('should reject unauthorized user', async () => {
      const caller = createCaller(mockUserContext);

      await expect(
        caller.financialYear.updateOpeningStockValue({
          shopId: 'shop-123',
          financialYearId: 'fy-123',
          openingStockValue: 15000
        })
      ).rejects.toThrow(TRPCError);
    });

    it('should reject update for non-owned shop', async () => {
      prismaMock.shop.findFirst.mockResolvedValue(null);

      const caller = createCaller(mockAdminContext);

      await expect(
        caller.financialYear.updateOpeningStockValue({
          shopId: 'shop-456',
          financialYearId: 'fy-123',
          openingStockValue: 15000
        })
      ).rejects.toThrow('You can only update stock values for shops you own');
    });

    it('should reject update for closed financial year', async () => {
      const mockShop = {
        id: 'shop-123',
        ownerId: 'admin-123'
      };

      const mockClosedYear = {
        id: 'fy-123',
        shopId: 'shop-123',
        isClosed: true
      };

      prismaMock.shop.findFirst.mockResolvedValue(mockShop);
      prismaMock.financialYear.findFirst.mockResolvedValue(mockClosedYear);

      const caller = createCaller(mockAdminContext);

      await expect(
        caller.financialYear.updateOpeningStockValue({
          shopId: 'shop-123',
          financialYearId: 'fy-123',
          openingStockValue: 15000
        })
      ).rejects.toThrow('Cannot update opening stock value for a closed financial year');
    });

    it('should validate negative stock value', async () => {
      const caller = createCaller(mockAdminContext);

      await expect(
        caller.financialYear.updateOpeningStockValue({
          shopId: 'shop-123',
          financialYearId: 'fy-123',
          openingStockValue: -1000
        })
      ).rejects.toThrow('Opening stock value must be non-negative');
    });
  });

  describe('updateClosingStockValue', () => {
    it('should update closing stock value successfully', async () => {
      const mockShop = {
        id: 'shop-123',
        ownerId: 'admin-123'
      };

      const mockFinancialYear = {
        id: 'fy-123',
        shopId: 'shop-123',
        openingStockValue: new Decimal('10000'),
        closingStockValue: null,
        isClosed: false
      };

      const mockUpdatedYear = {
        ...mockFinancialYear,
        closingStockValue: new Decimal('12000'),
        shop: mockShop,
        _count: { transactions: 5 }
      };

      prismaMock.shop.findFirst.mockResolvedValue(mockShop);
      prismaMock.financialYear.findFirst.mockResolvedValue(mockFinancialYear);
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback({
          stockValueHistory: {
            create: vi.fn().mockResolvedValue({})
          },
          financialYear: {
            update: vi.fn().mockResolvedValue(mockUpdatedYear)
          }
        });
      });

      const caller = createCaller(mockAdminContext);
      const result = await caller.financialYear.updateClosingStockValue({
        shopId: 'shop-123',
        financialYearId: 'fy-123',
        closingStockValue: 12000
      });

      expect(result.closingStockValue).toBe(12000);
    });
  });

  describe('bulkUpdateStockValues', () => {
    it('should update multiple stock values successfully', async () => {
      const mockShops = [
        { id: 'shop-123', ownerId: 'admin-123' },
        { id: 'shop-124', ownerId: 'admin-123' }
      ];

      const mockFinancialYears = [
        {
          id: 'fy-123',
          shopId: 'shop-123',
          openingStockValue: new Decimal('10000'),
          closingStockValue: null,
          isClosed: false
        },
        {
          id: 'fy-124',
          shopId: 'shop-124',
          openingStockValue: new Decimal('8000'),
          closingStockValue: null,
          isClosed: false
        }
      ];

      prismaMock.shop.findMany.mockResolvedValue(mockShops);
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback({
          financialYear: {
            findUnique: vi.fn()
              .mockResolvedValueOnce(mockFinancialYears[0])
              .mockResolvedValueOnce(mockFinancialYears[1]),
            update: vi.fn()
              .mockResolvedValueOnce({ ...mockFinancialYears[0], openingStockValue: new Decimal('11000') })
              .mockResolvedValueOnce({ ...mockFinancialYears[1], openingStockValue: new Decimal('9000') })
          },
          stockValueHistory: {
            create: vi.fn().mockResolvedValue({})
          }
        });
      });

      const caller = createCaller(mockAdminContext);
      const result = await caller.financialYear.bulkUpdateStockValues({
        updates: [
          {
            shopId: 'shop-123',
            financialYearId: 'fy-123',
            openingStockValue: 11000
          },
          {
            shopId: 'shop-124',
            financialYearId: 'fy-124',
            openingStockValue: 9000
          }
        ]
      });

      expect(result).toHaveLength(2);
    });

    it('should validate all shops belong to admin', async () => {
      const mockShops = [
        { id: 'shop-123', ownerId: 'admin-123' }
        // Missing shop-124, should cause error
      ];

      prismaMock.shop.findMany.mockResolvedValue(mockShops);

      const caller = createCaller(mockAdminContext);

      await expect(
        caller.financialYear.bulkUpdateStockValues({
          updates: [
            {
              shopId: 'shop-123',
              financialYearId: 'fy-123',
              openingStockValue: 11000
            },
            {
              shopId: 'shop-124', // Not owned by admin
              financialYearId: 'fy-124',
              openingStockValue: 9000
            }
          ]
        })
      ).rejects.toThrow('You can only update stock values for shops you own');
    });

    it('should reject updates for closed financial years', async () => {
      const mockShops = [
        { id: 'shop-123', ownerId: 'admin-123' }
      ];

      const mockClosedYear = {
        id: 'fy-123',
        shopId: 'shop-123',
        isClosed: true
      };

      prismaMock.shop.findMany.mockResolvedValue(mockShops);
      prismaMock.financialYear.findFirst.mockResolvedValue(mockClosedYear);

      const caller = createCaller(mockAdminContext);

      await expect(
        caller.financialYear.bulkUpdateStockValues({
          updates: [
            {
              shopId: 'shop-123',
              financialYearId: 'fy-123',
              openingStockValue: 11000
            }
          ]
        })
      ).rejects.toThrow('Cannot update stock values for closed financial year fy-123');
    });
  });
});