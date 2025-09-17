import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { TRPCError } from '@trpc/server';
import { Decimal } from '@prisma/client/runtime/library';

import { ProfitCalculationService } from '../../../src/server/services/profit-calculation.service';

const prismaMock = mockDeep<PrismaClient>();

describe('ProfitCalculationService', () => {
  let service: ProfitCalculationService;

  beforeEach(() => {
    mockReset(prismaMock);
    service = new ProfitCalculationService(prismaMock);
  });

  describe('calculateYearProfit', () => {
    it('should calculate profit correctly with stock adjustments', async () => {
      const mockFinancialYear = {
        id: 'fy-123',
        name: '2024',
        shopId: 'shop-123',
        openingStockValue: new Decimal('10000'),
        closingStockValue: new Decimal('12000'),
        shop: {
          nameAr: 'متجر تجريبي',
          nameEn: 'Test Shop'
        }
      };

      const mockRevenueResult = {
        _sum: { amount: new Decimal('50000') }
      };

      const mockExpenseResult = {
        _sum: { amount: new Decimal('30000') }
      };

      prismaMock.financialYear.findFirst.mockResolvedValue(mockFinancialYear);
      prismaMock.transaction.aggregate
        .mockResolvedValueOnce(mockRevenueResult) // Revenue query
        .mockResolvedValueOnce(mockExpenseResult); // Expense query

      const result = await service.calculateYearProfit('fy-123', 'shop-123');

      expect(result).toEqual({
        revenue: 50000,
        expenses: 30000,
        grossProfit: 20000,
        openingStockValue: 10000,
        closingStockValue: 12000,
        stockAdjustment: 2000, // 12000 - 10000
        netProfit: 22000, // 20000 + 2000
        financialYearId: 'fy-123',
        financialYearName: '2024',
        calculatedAt: expect.any(Date)
      });
    });

    it('should handle null closing stock value', async () => {
      const mockFinancialYear = {
        id: 'fy-123',
        name: '2024',
        shopId: 'shop-123',
        openingStockValue: new Decimal('10000'),
        closingStockValue: null,
        shop: {
          nameAr: 'متجر تجريبي',
          nameEn: 'Test Shop'
        }
      };

      const mockRevenueResult = {
        _sum: { amount: new Decimal('50000') }
      };

      const mockExpenseResult = {
        _sum: { amount: new Decimal('30000') }
      };

      prismaMock.financialYear.findFirst.mockResolvedValue(mockFinancialYear);
      prismaMock.transaction.aggregate
        .mockResolvedValueOnce(mockRevenueResult)
        .mockResolvedValueOnce(mockExpenseResult);

      const result = await service.calculateYearProfit('fy-123', 'shop-123');

      expect(result).toEqual({
        revenue: 50000,
        expenses: 30000,
        grossProfit: 20000,
        openingStockValue: 10000,
        closingStockValue: null,
        stockAdjustment: 0, // No adjustment when closing is null
        netProfit: 20000, // Same as gross profit
        financialYearId: 'fy-123',
        financialYearName: '2024',
        calculatedAt: expect.any(Date)
      });
    });

    it('should throw error for non-existent financial year', async () => {
      prismaMock.financialYear.findFirst.mockResolvedValue(null);

      await expect(
        service.calculateYearProfit('invalid-fy', 'shop-123')
      ).rejects.toThrow(TRPCError);
    });

    it('should handle zero revenue and expenses', async () => {
      const mockFinancialYear = {
        id: 'fy-123',
        name: '2024',
        shopId: 'shop-123',
        openingStockValue: new Decimal('5000'),
        closingStockValue: new Decimal('3000'),
        shop: {
          nameAr: 'متجر تجريبي',
          nameEn: 'Test Shop'
        }
      };

      const mockZeroResult = {
        _sum: { amount: null }
      };

      prismaMock.financialYear.findFirst.mockResolvedValue(mockFinancialYear);
      prismaMock.transaction.aggregate
        .mockResolvedValueOnce(mockZeroResult) // No revenue
        .mockResolvedValueOnce(mockZeroResult); // No expenses

      const result = await service.calculateYearProfit('fy-123', 'shop-123');

      expect(result).toEqual({
        revenue: 0,
        expenses: 0,
        grossProfit: 0,
        openingStockValue: 5000,
        closingStockValue: 3000,
        stockAdjustment: -2000, // Negative adjustment (stock decreased)
        netProfit: -2000, // Stock reduction affects profit
        financialYearId: 'fy-123',
        financialYearName: '2024',
        calculatedAt: expect.any(Date)
      });
    });
  });

  describe('calculateShopProfits', () => {
    it('should calculate profits for all financial years', async () => {
      const mockFinancialYears = [
        {
          id: 'fy-123',
          name: '2024',
          shopId: 'shop-123',
          openingStockValue: new Decimal('10000'),
          closingStockValue: new Decimal('12000'),
          shop: {
            nameAr: 'متجر تجريبي',
            nameEn: 'Test Shop'
          }
        },
        {
          id: 'fy-124',
          name: '2023',
          shopId: 'shop-123',
          openingStockValue: new Decimal('8000'),
          closingStockValue: new Decimal('10000'),
          shop: {
            nameAr: 'متجر تجريبي',
            nameEn: 'Test Shop'
          }
        }
      ];

      prismaMock.financialYear.findMany.mockResolvedValue(mockFinancialYears);

      // Mock the individual profit calculations
      const mockCalculateYearProfit = vi.spyOn(service, 'calculateYearProfit')
        .mockResolvedValueOnce({
          revenue: 50000,
          expenses: 30000,
          grossProfit: 20000,
          openingStockValue: 10000,
          closingStockValue: 12000,
          stockAdjustment: 2000,
          netProfit: 22000,
          financialYearId: 'fy-123',
          financialYearName: '2024',
          calculatedAt: new Date()
        })
        .mockResolvedValueOnce({
          revenue: 40000,
          expenses: 25000,
          grossProfit: 15000,
          openingStockValue: 8000,
          closingStockValue: 10000,
          stockAdjustment: 2000,
          netProfit: 17000,
          financialYearId: 'fy-124',
          financialYearName: '2023',
          calculatedAt: new Date()
        });

      const result = await service.calculateShopProfits('shop-123');

      expect(result.shopId).toBe('shop-123');
      expect(result.shopName).toBe('متجر تجريبي');
      expect(result.calculations).toHaveLength(2);
      expect(result.totalNetProfit).toBe(39000); // 22000 + 17000
      expect(result.totalRevenue).toBe(90000); // 50000 + 40000
      expect(result.totalExpenses).toBe(55000); // 30000 + 25000
      expect(result.totalStockAdjustment).toBe(4000); // 2000 + 2000

      expect(mockCalculateYearProfit).toHaveBeenCalledTimes(2);
    });

    it('should throw error for shop with no financial years', async () => {
      prismaMock.financialYear.findMany.mockResolvedValue([]);

      await expect(
        service.calculateShopProfits('shop-123')
      ).rejects.toThrow('No financial years found for the specified shop');
    });
  });

  describe('validateYearClosure', () => {
    it('should validate normal closing stock value', async () => {
      const mockFinancialYear = {
        id: 'fy-123',
        openingStockValue: new Decimal('10000')
      };

      // Mock calculateYearProfit to return current profit calculation
      const mockCalculateYearProfit = vi.spyOn(service, 'calculateYearProfit')
        .mockResolvedValue({
          revenue: 50000,
          expenses: 30000,
          grossProfit: 20000,
          openingStockValue: 10000,
          closingStockValue: null,
          stockAdjustment: 0,
          netProfit: 20000,
          financialYearId: 'fy-123',
          financialYearName: '2024',
          calculatedAt: new Date()
        });

      prismaMock.financialYear.findUnique.mockResolvedValue(mockFinancialYear);

      const result = await service.validateYearClosure('fy-123', 'shop-123', 12000);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
      expect(result.projectedNetProfit).toBe(22000); // 20000 + (12000 - 10000)
      expect(result.stockAdjustment).toBe(2000);
    });

    it('should warn about negative closing stock value', async () => {
      const mockFinancialYear = {
        id: 'fy-123',
        openingStockValue: new Decimal('10000')
      };

      const mockCalculateYearProfit = vi.spyOn(service, 'calculateYearProfit')
        .mockResolvedValue({
          revenue: 50000,
          expenses: 30000,
          grossProfit: 20000,
          openingStockValue: 10000,
          closingStockValue: null,
          stockAdjustment: 0,
          netProfit: 20000,
          financialYearId: 'fy-123',
          financialYearName: '2024',
          calculatedAt: new Date()
        });

      prismaMock.financialYear.findUnique.mockResolvedValue(mockFinancialYear);

      const result = await service.validateYearClosure('fy-123', 'shop-123', -1000);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain('Closing stock value cannot be negative');
    });

    it('should warn about unusually large stock value changes', async () => {
      const mockFinancialYear = {
        id: 'fy-123',
        openingStockValue: new Decimal('10000')
      };

      const mockCalculateYearProfit = vi.spyOn(service, 'calculateYearProfit')
        .mockResolvedValue({
          revenue: 20000, // Small revenue
          expenses: 10000,
          grossProfit: 10000,
          openingStockValue: 10000,
          closingStockValue: null,
          stockAdjustment: 0,
          netProfit: 10000,
          financialYearId: 'fy-123',
          financialYearName: '2024',
          calculatedAt: new Date()
        });

      prismaMock.financialYear.findUnique.mockResolvedValue(mockFinancialYear);

      // Stock change of 20000 (from 10000 to 30000) is > 50% of revenue (20000)
      const result = await service.validateYearClosure('fy-123', 'shop-123', 30000);

      expect(result.warnings).toContain('Stock value change is unusually large compared to revenue');
    });
  });

  describe('compareProfits', () => {
    it('should compare profits between two years', async () => {
      const mockCalculateYearProfit = vi.spyOn(service, 'calculateYearProfit')
        .mockResolvedValueOnce({
          revenue: 60000,
          expenses: 35000,
          grossProfit: 25000,
          openingStockValue: 12000,
          closingStockValue: 15000,
          stockAdjustment: 3000,
          netProfit: 28000,
          financialYearId: 'fy-current',
          financialYearName: '2024',
          calculatedAt: new Date()
        })
        .mockResolvedValueOnce({
          revenue: 50000,
          expenses: 30000,
          grossProfit: 20000,
          openingStockValue: 10000,
          closingStockValue: 12000,
          stockAdjustment: 2000,
          netProfit: 22000,
          financialYearId: 'fy-previous',
          financialYearName: '2023',
          calculatedAt: new Date()
        });

      const result = await service.compareProfits('fy-current', 'fy-previous', 'shop-123');

      expect(result.changes.revenueChange).toBe(10000); // 60000 - 50000
      expect(result.changes.expenseChange).toBe(5000); // 35000 - 30000
      expect(result.changes.netProfitChange).toBe(6000); // 28000 - 22000
      expect(result.changes.revenueGrowthRate).toBe(20); // (10000/50000) * 100
      expect(result.changes.profitGrowthRate).toBeCloseTo(27.27, 1); // (6000/22000) * 100
    });
  });
});