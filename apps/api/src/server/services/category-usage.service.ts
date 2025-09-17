import { PrismaClient, Prisma } from '@prisma/client';
import { CategoryUsageStats } from '@packages/shared/src/types/expenseCategory';

export class CategoryUsageService {
  constructor(private readonly prisma: PrismaClient) {}

  async getCategoryUsageStats(
    shopId: string,
    categoryId?: string,
    limit: number = 50
  ): Promise<CategoryUsageStats[]> {
    // If specific category is requested
    if (categoryId) {
      const stats = await this.getSingleCategoryStats(categoryId, shopId);
      return stats ? [stats] : [];
    }

    // Get stats for all categories
    return this.getAllCategoriesStats(shopId, limit);
  }

  private async getSingleCategoryStats(
    categoryId: string,
    shopId: string
  ): Promise<CategoryUsageStats | null> {
    // Get category details
    const category = await this.prisma.expenseCategory.findFirst({
      where: { id: categoryId, shopId },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        code: true,
      },
    });

    if (!category) return null;

    // Get assignment count
    const assignedAccountsCount = await this.prisma.categoryAccountAssignment.count({
      where: { categoryId, shopId },
    });

    // Get transaction stats through assigned accounts
    const transactionStats = await this.getTransactionStatsForCategory(categoryId, shopId);

    return {
      categoryId,
      category: {
        nameAr: category.nameAr,
        nameEn: category.nameEn,
        code: category.code,
      },
      assignedAccountsCount,
      transactionCount: transactionStats.count,
      totalAmount: transactionStats.totalAmount,
      lastUsedAt: transactionStats.lastUsedAt,
    };
  }

  private async getAllCategoriesStats(
    shopId: string,
    limit: number
  ): Promise<CategoryUsageStats[]> {
    // Get all categories with their assignments
    const categories = await this.prisma.expenseCategory.findMany({
      where: { shopId },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        code: true,
        accountAssignments: {
          select: {
            accountId: true,
          },
        },
      },
      take: limit,
      orderBy: { nameEn: 'asc' },
    });

    const stats: CategoryUsageStats[] = [];

    for (const category of categories) {
      const assignedAccountsCount = category.accountAssignments.length;
      const transactionStats = await this.getTransactionStatsForCategory(category.id, shopId);

      stats.push({
        categoryId: category.id,
        category: {
          nameAr: category.nameAr,
          nameEn: category.nameEn,
          code: category.code,
        },
        assignedAccountsCount,
        transactionCount: transactionStats.count,
        totalAmount: transactionStats.totalAmount,
        lastUsedAt: transactionStats.lastUsedAt,
      });
    }

    // Sort by usage (transaction count + total amount)
    stats.sort((a, b) => {
      const aUsage = a.transactionCount + (a.totalAmount / 1000); // Normalize amount
      const bUsage = b.transactionCount + (b.totalAmount / 1000);
      return bUsage - aUsage;
    });

    return stats;
  }

  private async getTransactionStatsForCategory(
    categoryId: string,
    shopId: string
  ): Promise<{
    count: number;
    totalAmount: number;
    lastUsedAt?: Date;
  }> {
    // Get account IDs assigned to this category
    const assignments = await this.prisma.categoryAccountAssignment.findMany({
      where: { categoryId, shopId },
      select: { accountId: true },
    });

    const accountIds = assignments.map(a => a.accountId);

    if (accountIds.length === 0) {
      return { count: 0, totalAmount: 0 };
    }

    // Get transaction statistics for these accounts
    const [countResult, amountResult, lastTransactionResult] = await Promise.all([
      // Count transactions
      this.prisma.transaction.count({
        where: {
          shopId,
          OR: [
            { debitAccountId: { in: accountIds } },
            { creditAccountId: { in: accountIds } },
          ],
        },
      }),

      // Sum transaction amounts (for expense accounts, usually debit side)
      this.prisma.transaction.aggregate({
        where: {
          shopId,
          debitAccountId: { in: accountIds },
        },
        _sum: {
          amount: true,
        },
      }),

      // Get last transaction date
      this.prisma.transaction.findFirst({
        where: {
          shopId,
          OR: [
            { debitAccountId: { in: accountIds } },
            { creditAccountId: { in: accountIds } },
          ],
        },
        select: {
          transactionDate: true,
        },
        orderBy: {
          transactionDate: 'desc',
        },
      }),
    ]);

    return {
      count: countResult,
      totalAmount: Number(amountResult._sum.amount || 0),
      lastUsedAt: lastTransactionResult?.transactionDate,
    };
  }

  async getCategoryUsageTrends(
    shopId: string,
    categoryId?: string,
    months: number = 12
  ): Promise<Array<{
    month: string;
    year: number;
    transactionCount: number;
    totalAmount: number;
  }>> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Build where clause
    let whereClause: any = {
      shopId,
      transactionDate: {
        gte: startDate,
      },
    };

    if (categoryId) {
      // Get account IDs for this category
      const assignments = await this.prisma.categoryAccountAssignment.findMany({
        where: { categoryId, shopId },
        select: { accountId: true },
      });

      const accountIds = assignments.map(a => a.accountId);

      if (accountIds.length === 0) {
        return [];
      }

      whereClause.debitAccountId = { in: accountIds };
    } else {
      // For all categories, get all expense account transactions
      const expenseAccounts = await this.prisma.account.findMany({
        where: { shopId, accountType: 'EXPENSE' },
        select: { id: true },
      });

      const accountIds = expenseAccounts.map(a => a.id);
      whereClause.debitAccountId = { in: accountIds };
    }

    // Get transactions grouped by month
    const transactions = await this.prisma.transaction.findMany({
      where: whereClause,
      select: {
        transactionDate: true,
        amount: true,
      },
      orderBy: {
        transactionDate: 'asc',
      },
    });

    // Group by month/year
    const monthlyStats = new Map<string, {
      month: string;
      year: number;
      transactionCount: number;
      totalAmount: number;
    }>();

    transactions.forEach(transaction => {
      const date = new Date(transaction.transactionDate);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

      if (!monthlyStats.has(monthKey)) {
        monthlyStats.set(monthKey, {
          month: date.toLocaleDateString('en-US', { month: 'long' }),
          year: date.getFullYear(),
          transactionCount: 0,
          totalAmount: 0,
        });
      }

      const stats = monthlyStats.get(monthKey)!;
      stats.transactionCount++;
      stats.totalAmount += Number(transaction.amount);
    });

    return Array.from(monthlyStats.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return new Date(`${a.month} 1, ${a.year}`).getMonth() - new Date(`${b.month} 1, ${b.year}`).getMonth();
    });
  }

  async getMostUsedCategories(
    shopId: string,
    limit: number = 10,
    timeRange?: {
      startDate: Date;
      endDate: Date;
    }
  ): Promise<CategoryUsageStats[]> {
    let dateFilter = {};
    if (timeRange) {
      dateFilter = {
        transactionDate: {
          gte: timeRange.startDate,
          lte: timeRange.endDate,
        },
      };
    }

    // Get categories with transaction counts
    const categoryStats = await this.prisma.expenseCategory.findMany({
      where: { shopId, isActive: true },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        code: true,
        accountAssignments: {
          select: {
            accountId: true,
            account: {
              select: {
                debitTransactions: {
                  where: {
                    shopId,
                    ...dateFilter,
                  },
                  select: {
                    amount: true,
                    transactionDate: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const usageStats: CategoryUsageStats[] = categoryStats.map(category => {
      let transactionCount = 0;
      let totalAmount = 0;
      let lastUsedAt: Date | undefined;

      category.accountAssignments.forEach(assignment => {
        assignment.account.debitTransactions.forEach(transaction => {
          transactionCount++;
          totalAmount += Number(transaction.amount);

          if (!lastUsedAt || transaction.transactionDate > lastUsedAt) {
            lastUsedAt = transaction.transactionDate;
          }
        });
      });

      return {
        categoryId: category.id,
        category: {
          nameAr: category.nameAr,
          nameEn: category.nameEn,
          code: category.code,
        },
        assignedAccountsCount: category.accountAssignments.length,
        transactionCount,
        totalAmount,
        lastUsedAt,
      };
    });

    // Sort by transaction count and total amount
    usageStats.sort((a, b) => {
      const aScore = a.transactionCount * 0.7 + (a.totalAmount / 1000) * 0.3;
      const bScore = b.transactionCount * 0.7 + (b.totalAmount / 1000) * 0.3;
      return bScore - aScore;
    });

    return usageStats.slice(0, limit);
  }

  async getUnusedCategories(shopId: string): Promise<Array<{
    id: string;
    nameAr: string;
    nameEn: string;
    code: string;
    level: number;
    createdAt: Date;
  }>> {
    // Categories with no account assignments or no transactions
    return this.prisma.expenseCategory.findMany({
      where: {
        shopId,
        isActive: true,
        OR: [
          // No account assignments
          {
            accountAssignments: {
              none: {},
            },
          },
          // Has assignments but no transactions
          {
            accountAssignments: {
              every: {
                account: {
                  debitTransactions: {
                    none: {},
                  },
                  creditTransactions: {
                    none: {},
                  },
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        code: true,
        level: true,
        createdAt: true,
      },
      orderBy: [
        { level: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }
}