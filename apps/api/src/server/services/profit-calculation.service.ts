import { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';

export interface ProfitCalculationResult {
  revenue: number;
  expenses: number;
  grossProfit: number;
  openingStockValue: number;
  closingStockValue: number | null;
  stockAdjustment: number; // closing - opening
  netProfit: number; // gross profit + stock adjustment
  financialYearId: string;
  financialYearName: string;
  calculatedAt: Date;
}

export interface ProfitCalculationSummary {
  shopId: string;
  shopName: string;
  calculations: ProfitCalculationResult[];
  totalNetProfit: number;
  totalRevenue: number;
  totalExpenses: number;
  totalStockAdjustment: number;
}

export class ProfitCalculationService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Calculate profit for a specific financial year including stock value adjustments
   */
  async calculateYearProfit(
    financialYearId: string,
    shopId: string
  ): Promise<ProfitCalculationResult> {
    // Get the financial year with stock values
    const financialYear = await this.prisma.financialYear.findFirst({
      where: {
        id: financialYearId,
        shopId: shopId
      },
      include: {
        shop: {
          select: { nameAr: true, nameEn: true }
        }
      }
    });

    if (!financialYear) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Financial year not found for the specified shop'
      });
    }

    // Calculate revenue (credit amounts from revenue accounts)
    const revenueResult = await this.prisma.transaction.aggregate({
      where: {
        financialYearId: financialYearId,
        shopId: shopId,
        creditAccount: {
          accountType: 'REVENUE'
        }
      },
      _sum: {
        amount: true
      }
    });

    // Calculate expenses (debit amounts from expense accounts)
    const expenseResult = await this.prisma.transaction.aggregate({
      where: {
        financialYearId: financialYearId,
        shopId: shopId,
        debitAccount: {
          accountType: 'EXPENSE'
        }
      },
      _sum: {
        amount: true
      }
    });

    const revenue = revenueResult._sum.amount?.toNumber() || 0;
    const expenses = expenseResult._sum.amount?.toNumber() || 0;
    const grossProfit = revenue - expenses;

    const openingStockValue = financialYear.openingStockValue.toNumber();
    const closingStockValue = financialYear.closingStockValue?.toNumber() || null;

    // Stock adjustment: positive if closing > opening (inventory increase)
    const stockAdjustment = closingStockValue !== null
      ? (closingStockValue - openingStockValue)
      : 0;

    // Net profit includes stock value changes
    // If stock value increased, it adds to profit
    // If stock value decreased, it reduces profit
    const netProfit = grossProfit + stockAdjustment;

    return {
      revenue,
      expenses,
      grossProfit,
      openingStockValue,
      closingStockValue,
      stockAdjustment,
      netProfit,
      financialYearId: financialYear.id,
      financialYearName: financialYear.name,
      calculatedAt: new Date()
    };
  }

  /**
   * Calculate profit for all financial years of a shop
   */
  async calculateShopProfits(shopId: string): Promise<ProfitCalculationSummary> {
    // Get all financial years for the shop
    const financialYears = await this.prisma.financialYear.findMany({
      where: { shopId },
      include: {
        shop: {
          select: { nameAr: true, nameEn: true }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    if (financialYears.length === 0) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No financial years found for the specified shop'
      });
    }

    const shop = financialYears[0].shop;
    const calculations: ProfitCalculationResult[] = [];

    // Calculate profit for each financial year
    for (const financialYear of financialYears) {
      try {
        const calculation = await this.calculateYearProfit(financialYear.id, shopId);
        calculations.push(calculation);
      } catch (error) {
        // Skip years with calculation errors but log them
        console.error(`Error calculating profit for financial year ${financialYear.id}:`, error);
      }
    }

    // Calculate totals
    const totals = calculations.reduce(
      (acc, calc) => ({
        totalNetProfit: acc.totalNetProfit + calc.netProfit,
        totalRevenue: acc.totalRevenue + calc.revenue,
        totalExpenses: acc.totalExpenses + calc.expenses,
        totalStockAdjustment: acc.totalStockAdjustment + calc.stockAdjustment
      }),
      {
        totalNetProfit: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        totalStockAdjustment: 0
      }
    );

    return {
      shopId,
      shopName: shop?.nameAr || 'Unknown Shop',
      calculations,
      ...totals
    };
  }

  /**
   * Calculate profit comparison between two financial years
   */
  async compareProfits(
    currentYearId: string,
    previousYearId: string,
    shopId: string
  ): Promise<{
    current: ProfitCalculationResult;
    previous: ProfitCalculationResult;
    changes: {
      revenueChange: number;
      expenseChange: number;
      grossProfitChange: number;
      netProfitChange: number;
      stockValueChange: number;
      revenueGrowthRate: number;
      profitGrowthRate: number;
    };
  }> {
    const [currentProfit, previousProfit] = await Promise.all([
      this.calculateYearProfit(currentYearId, shopId),
      this.calculateYearProfit(previousYearId, shopId)
    ]);

    const revenueChange = currentProfit.revenue - previousProfit.revenue;
    const expenseChange = currentProfit.expenses - previousProfit.expenses;
    const grossProfitChange = currentProfit.grossProfit - previousProfit.grossProfit;
    const netProfitChange = currentProfit.netProfit - previousProfit.netProfit;
    const stockValueChange = currentProfit.stockAdjustment - previousProfit.stockAdjustment;

    const revenueGrowthRate = previousProfit.revenue > 0
      ? (revenueChange / previousProfit.revenue) * 100
      : 0;

    const profitGrowthRate = previousProfit.netProfit > 0
      ? (netProfitChange / previousProfit.netProfit) * 100
      : 0;

    return {
      current: currentProfit,
      previous: previousProfit,
      changes: {
        revenueChange,
        expenseChange,
        grossProfitChange,
        netProfitChange,
        stockValueChange,
        revenueGrowthRate,
        profitGrowthRate
      }
    };
  }

  /**
   * Validate profit calculation when closing a financial year
   */
  async validateYearClosure(
    financialYearId: string,
    shopId: string,
    proposedClosingStockValue: number
  ): Promise<{
    isValid: boolean;
    warnings: string[];
    projectedNetProfit: number;
    currentGrossProfit: number;
    stockAdjustment: number;
  }> {
    const warnings: string[] = [];

    // Get current profit calculation
    const currentCalculation = await this.calculateYearProfit(financialYearId, shopId);

    // Calculate projected profit with the proposed closing stock value
    const financialYear = await this.prisma.financialYear.findUnique({
      where: { id: financialYearId }
    });

    if (!financialYear) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Financial year not found'
      });
    }

    const openingStockValue = financialYear.openingStockValue.toNumber();
    const stockAdjustment = proposedClosingStockValue - openingStockValue;
    const projectedNetProfit = currentCalculation.grossProfit + stockAdjustment;

    // Validation checks
    if (proposedClosingStockValue < 0) {
      warnings.push('Closing stock value cannot be negative');
    }

    if (Math.abs(stockAdjustment) > currentCalculation.revenue * 0.5) {
      warnings.push('Stock value change is unusually large compared to revenue');
    }

    if (projectedNetProfit < 0 && currentCalculation.grossProfit > 0) {
      warnings.push('Proposed closing stock value would result in negative net profit');
    }

    const isValid = warnings.length === 0;

    return {
      isValid,
      warnings,
      projectedNetProfit,
      currentGrossProfit: currentCalculation.grossProfit,
      stockAdjustment
    };
  }

  /**
   * Get profit trends over multiple years
   */
  async getProfitTrends(
    shopId: string,
    yearCount: number = 5
  ): Promise<{
    trends: Array<{
      year: string;
      revenue: number;
      expenses: number;
      grossProfit: number;
      netProfit: number;
      stockAdjustment: number;
      profitMargin: number; // net profit / revenue * 100
    }>;
    averages: {
      avgRevenue: number;
      avgExpenses: number;
      avgNetProfit: number;
      avgProfitMargin: number;
    };
  }> {
    const financialYears = await this.prisma.financialYear.findMany({
      where: {
        shopId,
        isClosed: true // Only include closed years for trend analysis
      },
      orderBy: { startDate: 'desc' },
      take: yearCount
    });

    const trends = [];
    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalNetProfit = 0;
    let totalMargin = 0;

    for (const year of financialYears) {
      try {
        const calculation = await this.calculateYearProfit(year.id, shopId);
        const profitMargin = calculation.revenue > 0
          ? (calculation.netProfit / calculation.revenue) * 100
          : 0;

        trends.push({
          year: year.name,
          revenue: calculation.revenue,
          expenses: calculation.expenses,
          grossProfit: calculation.grossProfit,
          netProfit: calculation.netProfit,
          stockAdjustment: calculation.stockAdjustment,
          profitMargin
        });

        totalRevenue += calculation.revenue;
        totalExpenses += calculation.expenses;
        totalNetProfit += calculation.netProfit;
        totalMargin += profitMargin;
      } catch (error) {
        console.error(`Error calculating trend for year ${year.id}:`, error);
      }
    }

    const count = trends.length;
    const averages = {
      avgRevenue: count > 0 ? totalRevenue / count : 0,
      avgExpenses: count > 0 ? totalExpenses / count : 0,
      avgNetProfit: count > 0 ? totalNetProfit / count : 0,
      avgProfitMargin: count > 0 ? totalMargin / count : 0
    };

    return {
      trends: trends.reverse(), // Show oldest to newest
      averages
    };
  }
}