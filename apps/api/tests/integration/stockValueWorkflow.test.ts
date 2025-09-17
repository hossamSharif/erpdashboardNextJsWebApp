import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { createCallerFactory } from '@trpc/server';
import { appRouter } from '../../src/server/routers';
import type { Context } from '../../src/server/trpc';

// Test database setup
const prisma = new PrismaClient({
  datasourceUrl: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/erptest'
});

const createCaller = createCallerFactory(appRouter);

describe('Stock Value Management Integration Tests', () => {
  let testShopId: string;
  let testFinancialYearId: string;
  let testUserId: string;
  let testContext: Context;

  beforeAll(async () => {
    // Create test data
    const testUser = await prisma.user.create({
      data: {
        email: 'test-admin@stockvalue.test',
        name: 'Test Admin',
        role: 'ADMIN',
        shopId: 'temp-shop-id',
        hashedPassword: 'test-hash'
      }
    });
    testUserId = testUser.id;

    const testShop = await prisma.shop.create({
      data: {
        nameAr: 'متجر اختبار قيم المخزون',
        nameEn: 'Stock Value Test Shop',
        code: 'SVTEST',
        ownerId: testUserId,
        isActive: true
      }
    });
    testShopId = testShop.id;

    // Update user with correct shopId
    await prisma.user.update({
      where: { id: testUserId },
      data: { shopId: testShopId }
    });

    const testFinancialYear = await prisma.financialYear.create({
      data: {
        name: '2024 Test Year',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        openingStockValue: 10000,
        shopId: testShopId,
        isCurrent: true
      }
    });
    testFinancialYearId = testFinancialYear.id;

    testContext = {
      user: {
        id: testUserId,
        email: testUser.email,
        name: testUser.name,
        role: 'ADMIN',
        shopId: testShopId,
        isActive: true
      },
      prisma
    };
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.stockValueHistory.deleteMany({
      where: {
        financialYear: {
          shopId: testShopId
        }
      }
    });
    await prisma.financialYear.deleteMany({
      where: { shopId: testShopId }
    });
    await prisma.user.deleteMany({
      where: { shopId: testShopId }
    });
    await prisma.shop.deleteMany({
      where: { id: testShopId }
    });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Reset financial year to open state
    await prisma.financialYear.update({
      where: { id: testFinancialYearId },
      data: {
        isClosed: false,
        closingStockValue: null,
        openingStockValue: 10000
      }
    });

    // Clear stock value history
    await prisma.stockValueHistory.deleteMany({
      where: { financialYearId: testFinancialYearId }
    });
  });

  describe('Complete Stock Value Management Workflow', () => {
    it('should handle full stock value lifecycle', async () => {
      const caller = createCaller(testContext);

      // Step 1: Update opening stock value
      const updatedOpening = await caller.financialYear.updateOpeningStockValue({
        shopId: testShopId,
        financialYearId: testFinancialYearId,
        openingStockValue: 15000
      });

      expect(updatedOpening.openingStockValue).toBe(15000);

      // Step 2: Update closing stock value
      const updatedClosing = await caller.financialYear.updateClosingStockValue({
        shopId: testShopId,
        financialYearId: testFinancialYearId,
        closingStockValue: 18000
      });

      expect(updatedClosing.closingStockValue).toBe(18000);

      // Step 3: Verify stock value history was created
      const history = await prisma.stockValueHistory.findMany({
        where: { financialYearId: testFinancialYearId },
        orderBy: { changedAt: 'asc' }
      });

      expect(history).toHaveLength(2);
      expect(history[0].fieldChanged).toBe('openingStockValue');
      expect(history[0].newValue.toNumber()).toBe(15000);
      expect(history[1].fieldChanged).toBe('closingStockValue');
      expect(history[1].newValue.toNumber()).toBe(18000);

      // Step 4: Calculate profit with stock adjustments
      const profit = await caller.profit.calculateYearProfit({
        shopId: testShopId,
        financialYearId: testFinancialYearId
      });

      expect(profit.openingStockValue).toBe(15000);
      expect(profit.closingStockValue).toBe(18000);
      expect(profit.stockAdjustment).toBe(3000); // 18000 - 15000
    });

    it('should handle bulk stock value updates', async () => {
      // Create additional financial year for bulk update
      const secondFinancialYear = await prisma.financialYear.create({
        data: {
          name: '2023 Test Year',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          openingStockValue: 8000,
          shopId: testShopId,
          isCurrent: false
        }
      });

      const caller = createCaller(testContext);

      // Perform bulk update
      const bulkUpdateResult = await caller.financialYear.bulkUpdateStockValues({
        updates: [
          {
            shopId: testShopId,
            financialYearId: testFinancialYearId,
            openingStockValue: 12000,
            closingStockValue: 14000
          },
          {
            shopId: testShopId,
            financialYearId: secondFinancialYear.id,
            openingStockValue: 9000,
            closingStockValue: 11000
          }
        ]
      });

      expect(bulkUpdateResult).toHaveLength(2);

      // Verify updates were applied
      const updatedYears = await prisma.financialYear.findMany({
        where: {
          id: { in: [testFinancialYearId, secondFinancialYear.id] }
        }
      });

      const year1 = updatedYears.find(y => y.id === testFinancialYearId);
      const year2 = updatedYears.find(y => y.id === secondFinancialYear.id);

      expect(year1?.openingStockValue.toNumber()).toBe(12000);
      expect(year1?.closingStockValue?.toNumber()).toBe(14000);
      expect(year2?.openingStockValue.toNumber()).toBe(9000);
      expect(year2?.closingStockValue?.toNumber()).toBe(11000);

      // Verify audit logs were created
      const history = await prisma.stockValueHistory.findMany({
        where: {
          financialYearId: { in: [testFinancialYearId, secondFinancialYear.id] }
        }
      });

      expect(history.length).toBeGreaterThanOrEqual(4); // 2 updates per year

      // Clean up
      await prisma.financialYear.delete({
        where: { id: secondFinancialYear.id }
      });
    });

    it('should validate year closure with stock values', async () => {
      const caller = createCaller(testContext);

      // Set up some transactions for realistic profit calculation
      const revenueAccount = await prisma.account.create({
        data: {
          code: 'REV001',
          nameAr: 'إيرادات المبيعات',
          nameEn: 'Sales Revenue',
          accountType: 'REVENUE',
          shopId: testShopId,
          level: 0
        }
      });

      const expenseAccount = await prisma.account.create({
        data: {
          code: 'EXP001',
          nameAr: 'مصروفات التشغيل',
          nameEn: 'Operating Expenses',
          accountType: 'EXPENSE',
          shopId: testShopId,
          level: 0
        }
      });

      // Create some test transactions
      await prisma.transaction.create({
        data: {
          transactionType: 'SALE',
          amount: 25000,
          description: 'Test sale',
          transactionDate: new Date('2024-06-01'),
          debitAccountId: revenueAccount.id,
          creditAccountId: revenueAccount.id,
          debitUserId: testUserId,
          creditUserId: testUserId,
          shopId: testShopId,
          financialYearId: testFinancialYearId
        }
      });

      await prisma.transaction.create({
        data: {
          transactionType: 'PURCHASE',
          amount: 15000,
          description: 'Test expense',
          transactionDate: new Date('2024-06-02'),
          debitAccountId: expenseAccount.id,
          creditAccountId: expenseAccount.id,
          debitUserId: testUserId,
          creditUserId: testUserId,
          shopId: testShopId,
          financialYearId: testFinancialYearId
        }
      });

      // Validate year closure with proposed closing stock value
      const validation = await caller.profit.validateYearClosure({
        shopId: testShopId,
        financialYearId: testFinancialYearId,
        proposedClosingStockValue: 12000
      });

      expect(validation.isValid).toBe(true);
      expect(validation.projectedNetProfit).toBeGreaterThan(0);
      expect(validation.stockAdjustment).toBe(2000); // 12000 - 10000

      // Test with invalid (negative) closing stock value
      const invalidValidation = await caller.profit.validateYearClosure({
        shopId: testShopId,
        financialYearId: testFinancialYearId,
        proposedClosingStockValue: -1000
      });

      expect(invalidValidation.isValid).toBe(false);
      expect(invalidValidation.warnings).toContain('Closing stock value cannot be negative');
    });

    it('should prevent stock value updates on closed financial years', async () => {
      const caller = createCaller(testContext);

      // Close the financial year first
      await caller.financialYear.close({
        id: testFinancialYearId,
        closingStockValue: 12000
      });

      // Attempt to update opening stock value on closed year
      await expect(
        caller.financialYear.updateOpeningStockValue({
          shopId: testShopId,
          financialYearId: testFinancialYearId,
          openingStockValue: 15000
        })
      ).rejects.toThrow('Cannot update opening stock value for a closed financial year');

      // Attempt to update closing stock value on closed year
      await expect(
        caller.financialYear.updateClosingStockValue({
          shopId: testShopId,
          financialYearId: testFinancialYearId,
          closingStockValue: 16000
        })
      ).rejects.toThrow('Cannot update closing stock value for a closed financial year');
    });

    it('should calculate shop profits including all years', async () => {
      const caller = createCaller(testContext);

      // Create and close a previous year
      const previousYear = await prisma.financialYear.create({
        data: {
          name: '2023 Test Year',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          openingStockValue: 5000,
          closingStockValue: 8000,
          shopId: testShopId,
          isCurrent: false,
          isClosed: true
        }
      });

      // Update current year stock values
      await caller.financialYear.updateClosingStockValue({
        shopId: testShopId,
        financialYearId: testFinancialYearId,
        closingStockValue: 13000
      });

      // Calculate shop profits
      const shopProfits = await caller.profit.calculateShopProfits({
        shopId: testShopId
      });

      expect(shopProfits.shopId).toBe(testShopId);
      expect(shopProfits.calculations).toHaveLength(2);
      expect(shopProfits.totalStockAdjustment).toBe(6000); // (13000-10000) + (8000-5000)

      // Clean up
      await prisma.financialYear.delete({
        where: { id: previousYear.id }
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle concurrent stock value updates safely', async () => {
      const caller = createCaller(testContext);

      // Simulate concurrent updates
      const updates = [
        caller.financialYear.updateOpeningStockValue({
          shopId: testShopId,
          financialYearId: testFinancialYearId,
          openingStockValue: 11000
        }),
        caller.financialYear.updateClosingStockValue({
          shopId: testShopId,
          financialYearId: testFinancialYearId,
          closingStockValue: 13000
        })
      ];

      const results = await Promise.all(updates);

      expect(results[0].openingStockValue).toBe(11000);
      expect(results[1].closingStockValue).toBe(13000);

      // Verify both changes were recorded in history
      const history = await prisma.stockValueHistory.findMany({
        where: { financialYearId: testFinancialYearId }
      });

      expect(history).toHaveLength(2);
    });

    it('should handle very large stock value changes with warnings', async () => {
      const caller = createCaller(testContext);

      // Test with extremely large stock value
      const validation = await caller.profit.validateYearClosure({
        shopId: testShopId,
        financialYearId: testFinancialYearId,
        proposedClosingStockValue: 1000000 // Very large value
      });

      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings.some(w =>
        w.includes('unusually large')
      )).toBe(true);
    });
  });
});