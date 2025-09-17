import { PrismaClient, AccountType } from '@prisma/client';
import { TRPCError } from '@trpc/server';

const prisma = new PrismaClient();

interface DefaultAccount {
  code: string;
  nameAr: string;
  nameEn: string;
  accountType: AccountType;
  level: number;
  parentId?: string;
}

export class AccountGenerationService {
  /**
   * Generate bilingual account name suffixes for shop-specific accounts
   */
  static generateAccountSuffix(shopCode: string, baseNameAr: string, baseNameEn: string): {
    nameAr: string;
    nameEn: string;
  } {
    return {
      nameAr: `${baseNameAr}-${shopCode}`,
      nameEn: `${baseNameEn}-${shopCode}`
    };
  }

  /**
   * Generate account code with shop-specific prefix
   */
  static generateAccountCode(shopCode: string, baseCode: string): string {
    return `${baseCode}-${shopCode}`;
  }

  /**
   * Get default accounts to be created for a new shop
   */
  static getDefaultAccountsForShop(shopCode: string): DefaultAccount[] {
    const defaultAccounts: DefaultAccount[] = [
      // Level 1: Main Revenue Account
      {
        code: this.generateAccountCode(shopCode, 'REV'),
        nameAr: this.generateAccountSuffix(shopCode, 'الإيرادات', 'Revenue').nameAr,
        nameEn: this.generateAccountSuffix(shopCode, 'الإيرادات', 'Revenue').nameEn,
        accountType: AccountType.REVENUE,
        level: 1
      },
      // Level 2: Direct Sales Account
      {
        code: this.generateAccountCode(shopCode, 'REV-DSALES'),
        nameAr: this.generateAccountSuffix(shopCode, 'المبيعات المباشرة', 'Direct Sales').nameAr,
        nameEn: this.generateAccountSuffix(shopCode, 'المبيعات المباشرة', 'Direct Sales').nameEn,
        accountType: AccountType.REVENUE,
        level: 2
      },
      // Level 1: Main Expense Account
      {
        code: this.generateAccountCode(shopCode, 'EXP'),
        nameAr: this.generateAccountSuffix(shopCode, 'المصروفات', 'Expenses').nameAr,
        nameEn: this.generateAccountSuffix(shopCode, 'المصروفات', 'Expenses').nameEn,
        accountType: AccountType.EXPENSE,
        level: 1
      },
      // Level 2: Direct Purchase Account
      {
        code: this.generateAccountCode(shopCode, 'EXP-DPURCH'),
        nameAr: this.generateAccountSuffix(shopCode, 'المشتريات المباشرة', 'Direct Purchases').nameAr,
        nameEn: this.generateAccountSuffix(shopCode, 'المشتريات المباشرة', 'Direct Purchases').nameEn,
        accountType: AccountType.EXPENSE,
        level: 2
      },
      // Level 1: Main Asset Account
      {
        code: this.generateAccountCode(shopCode, 'ASSET'),
        nameAr: this.generateAccountSuffix(shopCode, 'الأصول', 'Assets').nameAr,
        nameEn: this.generateAccountSuffix(shopCode, 'الأصول', 'Assets').nameEn,
        accountType: AccountType.ASSET,
        level: 1
      },
      // Level 2: Cash Account
      {
        code: this.generateAccountCode(shopCode, 'ASSET-CASH'),
        nameAr: this.generateAccountSuffix(shopCode, 'النقد', 'Cash').nameAr,
        nameEn: this.generateAccountSuffix(shopCode, 'النقد', 'Cash').nameEn,
        accountType: AccountType.ASSET,
        level: 2
      },
      // Level 1: Main Liability Account
      {
        code: this.generateAccountCode(shopCode, 'LIAB'),
        nameAr: this.generateAccountSuffix(shopCode, 'الخصوم', 'Liabilities').nameAr,
        nameEn: this.generateAccountSuffix(shopCode, 'الخصوم', 'Liabilities').nameEn,
        accountType: AccountType.LIABILITY,
        level: 1
      },
      // Level 2: Accounts Payable
      {
        code: this.generateAccountCode(shopCode, 'LIAB-AP'),
        nameAr: this.generateAccountSuffix(shopCode, 'الذمم الدائنة', 'Accounts Payable').nameAr,
        nameEn: this.generateAccountSuffix(shopCode, 'الذمم الدائنة', 'Accounts Payable').nameEn,
        accountType: AccountType.LIABILITY,
        level: 2
      },
      // Level 1: Equity Account
      {
        code: this.generateAccountCode(shopCode, 'EQUITY'),
        nameAr: this.generateAccountSuffix(shopCode, 'حقوق الملكية', 'Equity').nameAr,
        nameEn: this.generateAccountSuffix(shopCode, 'حقوق الملكية', 'Equity').nameEn,
        accountType: AccountType.EQUITY,
        level: 1
      }
    ];

    return defaultAccounts;
  }

  /**
   * Create default accounts for a shop with proper hierarchy
   */
  static async createDefaultAccountsForShop(shopId: string, shopCode: string): Promise<void> {
    try {
      const defaultAccounts = this.getDefaultAccountsForShop(shopCode);

      // Create accounts in transaction to ensure consistency
      await prisma.$transaction(async (tx) => {
        // First pass: Create level 1 accounts (parents)
        const level1Accounts = defaultAccounts.filter(acc => acc.level === 1);
        const createdLevel1: Record<string, string> = {};

        for (const account of level1Accounts) {
          const created = await tx.account.create({
            data: {
              code: account.code,
              nameAr: account.nameAr,
              nameEn: account.nameEn,
              accountType: account.accountType,
              level: account.level,
              shopId,
              isSystemAccount: true,
              isActive: true
            }
          });
          createdLevel1[account.accountType] = created.id;
        }

        // Second pass: Create level 2 accounts (children) with parent references
        const level2Accounts = defaultAccounts.filter(acc => acc.level === 2);

        for (const account of level2Accounts) {
          const parentId = createdLevel1[account.accountType];

          await tx.account.create({
            data: {
              code: account.code,
              nameAr: account.nameAr,
              nameEn: account.nameEn,
              accountType: account.accountType,
              level: account.level,
              parentId,
              shopId,
              isSystemAccount: true,
              isActive: true
            }
          });
        }
      });

    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create default accounts for shop',
        cause: error
      });
    }
  }

  /**
   * Get specific system accounts for a shop (used for transactions)
   */
  static async getShopSystemAccounts(shopId: string): Promise<{
    directSales: string | null;
    directPurchases: string | null;
    cash: string | null;
  }> {
    try {
      const accounts = await prisma.account.findMany({
        where: {
          shopId,
          isSystemAccount: true,
          isActive: true,
          code: {
            in: [
              `REV-DSALES-${shopId}`, // This will need to be adjusted based on actual shop code
              `EXP-DPURCH-${shopId}`,
              `ASSET-CASH-${shopId}`
            ]
          }
        },
        select: {
          id: true,
          code: true
        }
      });

      const result = {
        directSales: null as string | null,
        directPurchases: null as string | null,
        cash: null as string | null
      };

      accounts.forEach(account => {
        if (account.code.includes('REV-DSALES')) {
          result.directSales = account.id;
        } else if (account.code.includes('EXP-DPURCH')) {
          result.directPurchases = account.id;
        } else if (account.code.includes('ASSET-CASH')) {
          result.cash = account.id;
        }
      });

      return result;

    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch shop system accounts',
        cause: error
      });
    }
  }

  /**
   * Validate account hierarchy consistency
   */
  static async validateAccountHierarchy(shopId: string): Promise<boolean> {
    try {
      const accounts = await prisma.account.findMany({
        where: {
          shopId,
          isSystemAccount: true
        },
        include: {
          children: true,
          parent: true
        }
      });

      // Check that all level 2 accounts have level 1 parents
      const level2Accounts = accounts.filter(acc => acc.level === 2);

      for (const account of level2Accounts) {
        if (!account.parent || account.parent.level !== 1) {
          return false;
        }

        // Check that parent has the same account type
        if (account.parent.accountType !== account.accountType) {
          return false;
        }
      }

      return true;

    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to validate account hierarchy',
        cause: error
      });
    }
  }

  /**
   * Get account tree structure for a shop
   */
  static async getShopAccountTree(shopId: string): Promise<any[]> {
    try {
      const accounts = await prisma.account.findMany({
        where: {
          shopId,
          level: 1
        },
        include: {
          children: {
            include: {
              children: true
            }
          }
        },
        orderBy: [
          { accountType: 'asc' },
          { code: 'asc' }
        ]
      });

      return accounts;

    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch shop account tree',
        cause: error
      });
    }
  }
}