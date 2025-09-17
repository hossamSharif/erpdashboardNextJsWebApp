import { PrismaClient, CashAccount, Prisma } from '@prisma/client';
import { AccountCategory } from '@packages/shared/src/types/cashBankAccount';

export class CashAccountRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: {
    nameAr: string;
    nameEn: string;
    shopId: string;
    openingBalance: Prisma.Decimal | number;
    isDefault?: boolean;
  }): Promise<CashAccount> {
    if (data.isDefault) {
      await this.prisma.cashAccount.updateMany({
        where: {
          shopId: data.shopId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    return this.prisma.cashAccount.create({
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        shopId: data.shopId,
        openingBalance: data.openingBalance,
        currentBalance: data.openingBalance,
        isDefault: data.isDefault || false,
      },
    });
  }

  async findById(id: string, shopId: string): Promise<CashAccount | null> {
    return this.prisma.cashAccount.findFirst({
      where: {
        id,
        shopId,
      },
    });
  }

  async findAllByShop(shopId: string): Promise<CashAccount[]> {
    return this.prisma.cashAccount.findMany({
      where: {
        shopId,
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async update(
    id: string,
    shopId: string,
    data: Partial<{
      nameAr: string;
      nameEn: string;
      isActive: boolean;
      isDefault: boolean;
    }>
  ): Promise<CashAccount> {
    if (data.isDefault) {
      await this.prisma.cashAccount.updateMany({
        where: {
          shopId,
          isDefault: true,
          NOT: { id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    return this.prisma.cashAccount.update({
      where: {
        id,
      },
      data,
    });
  }

  async updateBalance(
    id: string,
    shopId: string,
    newBalance: Prisma.Decimal | number,
    changeReason: string,
    userId: string
  ): Promise<CashAccount> {
    const account = await this.findById(id, shopId);
    if (!account) {
      throw new Error('Cash account not found');
    }

    const [updatedAccount] = await this.prisma.$transaction([
      this.prisma.cashAccount.update({
        where: { id },
        data: {
          currentBalance: newBalance,
        },
      }),
      this.prisma.balanceHistory.create({
        data: {
          accountType: AccountCategory.CASH,
          accountId: id,
          previousBalance: account.currentBalance,
          newBalance,
          changeAmount: new Prisma.Decimal(newBalance).sub(account.currentBalance),
          changeReason,
          userId,
          shopId,
        },
      }),
    ]);

    return updatedAccount;
  }

  async getDefaultAccount(shopId: string): Promise<CashAccount | null> {
    return this.prisma.cashAccount.findFirst({
      where: {
        shopId,
        isDefault: true,
      },
    });
  }

  async delete(id: string, shopId: string): Promise<void> {
    await this.prisma.cashAccount.delete({
      where: {
        id,
      },
    });
  }
}