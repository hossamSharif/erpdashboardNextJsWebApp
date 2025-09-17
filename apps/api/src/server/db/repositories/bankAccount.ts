import { PrismaClient, BankAccount, Prisma } from '@prisma/client';
import { AccountCategory } from '@packages/shared/src/types/cashBankAccount';

export class BankAccountRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: {
    nameAr: string;
    nameEn: string;
    accountNumber: string;
    bankName: string;
    iban?: string | null;
    shopId: string;
    openingBalance: Prisma.Decimal | number;
    isDefault?: boolean;
  }): Promise<BankAccount> {
    if (data.isDefault) {
      await this.prisma.bankAccount.updateMany({
        where: {
          shopId: data.shopId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    return this.prisma.bankAccount.create({
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        accountNumber: data.accountNumber,
        bankName: data.bankName,
        iban: data.iban,
        shopId: data.shopId,
        openingBalance: data.openingBalance,
        currentBalance: data.openingBalance,
        isDefault: data.isDefault || false,
      },
    });
  }

  async findById(id: string, shopId: string): Promise<BankAccount | null> {
    return this.prisma.bankAccount.findFirst({
      where: {
        id,
        shopId,
      },
    });
  }

  async findAllByShop(shopId: string): Promise<BankAccount[]> {
    return this.prisma.bankAccount.findMany({
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
      accountNumber: string;
      bankName: string;
      iban: string | null;
      isActive: boolean;
      isDefault: boolean;
    }>
  ): Promise<BankAccount> {
    if (data.isDefault) {
      await this.prisma.bankAccount.updateMany({
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

    return this.prisma.bankAccount.update({
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
  ): Promise<BankAccount> {
    const account = await this.findById(id, shopId);
    if (!account) {
      throw new Error('Bank account not found');
    }

    const [updatedAccount] = await this.prisma.$transaction([
      this.prisma.bankAccount.update({
        where: { id },
        data: {
          currentBalance: newBalance,
        },
      }),
      this.prisma.balanceHistory.create({
        data: {
          accountType: AccountCategory.BANK,
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

  async getDefaultAccount(shopId: string): Promise<BankAccount | null> {
    return this.prisma.bankAccount.findFirst({
      where: {
        shopId,
        isDefault: true,
      },
    });
  }

  async delete(id: string, shopId: string): Promise<void> {
    await this.prisma.bankAccount.delete({
      where: {
        id,
      },
    });
  }
}