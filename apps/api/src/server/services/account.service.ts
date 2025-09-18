import { PrismaClient, AccountType } from '@prisma/client';
import { TRPCError } from '@trpc/server';

const prisma = new PrismaClient();

export class AccountService {
  static async getCustomers(shopId: string, searchTerm?: string) {
    const whereCondition: any = {
      shopId,
      accountType: 'LIABILITY', // Customer accounts are liability accounts
      isActive: true
    };

    if (searchTerm) {
      whereCondition.OR = [
        {
          nameAr: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          nameEn: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          code: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        }
      ];
    }

    const customers = await prisma.account.findMany({
      where: whereCondition,
      select: {
        id: true,
        code: true,
        nameAr: true,
        nameEn: true,
        balance: true
      },
      orderBy: [
        { code: 'asc' },
        { nameEn: 'asc' }
      ]
    });

    // Ensure default customer exists
    const defaultCustomerId = `direct-sales-${shopId}`;
    const hasDefault = customers.some(customer => customer.id === defaultCustomerId);

    if (!hasDefault) {
      // Create default customer if it doesn't exist
      await this.createDefaultCustomer(shopId);

      // Add it to the results
      customers.unshift({
        id: defaultCustomerId,
        code: 'DS-001',
        nameAr: 'مبيعات مباشرة',
        nameEn: 'Direct Sales',
        balance: 0
      });
    }

    return customers;
  }

  static async getCashBankAccounts(shopId: string) {
    const accounts = await prisma.account.findMany({
      where: {
        shopId,
        accountType: AccountType.ASSET,
        isActive: true,
        OR: [
          {
            nameEn: {
              contains: 'cash',
              mode: 'insensitive'
            }
          },
          {
            nameEn: {
              contains: 'bank',
              mode: 'insensitive'
            }
          },
          {
            nameAr: {
              contains: 'نقدية',
              mode: 'insensitive'
            }
          },
          {
            nameAr: {
              contains: 'بنك',
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        code: true,
        nameAr: true,
        nameEn: true,
        balance: true
      },
      orderBy: [
        { code: 'asc' }
      ]
    });

    return accounts;
  }

  static async createCustomer(data: {
    shopId: string;
    nameAr: string;
    nameEn: string;
    code?: string;
  }) {
    // Generate code if not provided
    if (!data.code) {
      const lastCustomer = await prisma.account.findFirst({
        where: {
          shopId: data.shopId,
          accountType: AccountType.LIABILITY,
          code: {
            startsWith: 'CUST-'
          }
        },
        orderBy: {
          code: 'desc'
        }
      });

      const nextNumber = lastCustomer
        ? parseInt(lastCustomer.code.split('-')[1]) + 1
        : 1;

      data.code = `CUST-${nextNumber.toString().padStart(3, '0')}`;
    }

    const customer = await prisma.account.create({
      data: {
        ...data,
        accountType: AccountType.LIABILITY,
        level: 2, // Customer accounts are typically level 2
        isActive: true,
        balance: 0
      },
      select: {
        id: true,
        code: true,
        nameAr: true,
        nameEn: true,
        balance: true
      }
    });

    return customer;
  }

  static async createDefaultCustomer(shopId: string) {
    const defaultCustomerId = `direct-sales-${shopId}`;

    // Check if it already exists
    const existing = await prisma.account.findUnique({
      where: { id: defaultCustomerId }
    });

    if (existing) {
      return existing;
    }

    // Create default customer
    const defaultCustomer = await prisma.account.create({
      data: {
        id: defaultCustomerId,
        code: 'DS-001',
        nameAr: 'مبيعات مباشرة',
        nameEn: 'Direct Sales',
        accountType: AccountType.LIABILITY,
        level: 2,
        shopId,
        isActive: true,
        balance: 0
      }
    });

    return defaultCustomer;
  }

  static async getAccountById(accountId: string, shopId: string) {
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        shopId,
        isActive: true
      },
      select: {
        id: true,
        code: true,
        nameAr: true,
        nameEn: true,
        accountType: true,
        balance: true
      }
    });

    if (!account) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Account not found'
      });
    }

    return account;
  }
}