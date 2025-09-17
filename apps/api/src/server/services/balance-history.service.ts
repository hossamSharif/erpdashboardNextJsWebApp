import { PrismaClient, BalanceHistory, Prisma } from '@prisma/client';
import { AccountCategory } from '@packages/shared/src/types/cashBankAccount';

export class BalanceHistoryService {
  constructor(private readonly prisma: PrismaClient) {}

  async getAccountHistory(
    accountId: string,
    accountType: AccountCategory,
    shopId: string,
    options?: {
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<BalanceHistory[]> {
    const where: Prisma.BalanceHistoryWhereInput = {
      accountId,
      accountType,
      shopId,
    };

    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options.startDate) {
        where.createdAt.gte = options.startDate;
      }
      if (options.endDate) {
        where.createdAt.lte = options.endDate;
      }
    }

    return this.prisma.balanceHistory.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: options?.limit,
      skip: options?.offset,
    });
  }

  async getShopHistory(
    shopId: string,
    options?: {
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
      accountType?: AccountCategory;
    }
  ): Promise<BalanceHistory[]> {
    const where: Prisma.BalanceHistoryWhereInput = {
      shopId,
    };

    if (options?.accountType) {
      where.accountType = options.accountType;
    }

    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options.startDate) {
        where.createdAt.gte = options.startDate;
      }
      if (options.endDate) {
        where.createdAt.lte = options.endDate;
      }
    }

    return this.prisma.balanceHistory.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: options?.limit,
      skip: options?.offset,
    });
  }

  async recordBalanceChange(data: {
    accountType: AccountCategory;
    accountId: string;
    previousBalance: Prisma.Decimal | number;
    newBalance: Prisma.Decimal | number;
    changeReason: string;
    userId: string;
    shopId: string;
  }): Promise<BalanceHistory> {
    const changeAmount = new Prisma.Decimal(data.newBalance).sub(data.previousBalance);

    return this.prisma.balanceHistory.create({
      data: {
        accountType: data.accountType,
        accountId: data.accountId,
        previousBalance: data.previousBalance,
        newBalance: data.newBalance,
        changeAmount,
        changeReason: data.changeReason,
        userId: data.userId,
        shopId: data.shopId,
      },
    });
  }

  async getLatestBalance(
    accountId: string,
    accountType: AccountCategory,
    shopId: string
  ): Promise<BalanceHistory | null> {
    return this.prisma.balanceHistory.findFirst({
      where: {
        accountId,
        accountType,
        shopId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}