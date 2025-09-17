import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AccountType } from '@prisma/client';
import { AccountGenerationService } from '../../../src/server/services/account-generation.service';

describe('AccountGenerationService', () => {
  describe('generateAccountSuffix', () => {
    it('should generate correct bilingual account suffixes', () => {
      const shopCode = 'ELEC';
      const baseNameAr = 'المبيعات';
      const baseNameEn = 'Sales';

      const result = AccountGenerationService.generateAccountSuffix(
        shopCode,
        baseNameAr,
        baseNameEn
      );

      expect(result.nameAr).toBe('المبيعات-ELEC');
      expect(result.nameEn).toBe('Sales-ELEC');
    });

    it('should handle empty base names', () => {
      const shopCode = 'TEST';
      const baseNameAr = '';
      const baseNameEn = '';

      const result = AccountGenerationService.generateAccountSuffix(
        shopCode,
        baseNameAr,
        baseNameEn
      );

      expect(result.nameAr).toBe('-TEST');
      expect(result.nameEn).toBe('-TEST');
    });
  });

  describe('generateAccountCode', () => {
    it('should generate correct account code with shop prefix', () => {
      const shopCode = 'ELEC';
      const baseCode = 'REV-DSALES';

      const result = AccountGenerationService.generateAccountCode(shopCode, baseCode);

      expect(result).toBe('REV-DSALES-ELEC');
    });

    it('should handle special characters in codes', () => {
      const shopCode = 'TEST_1';
      const baseCode = 'EXP-DPURCH';

      const result = AccountGenerationService.generateAccountCode(shopCode, baseCode);

      expect(result).toBe('EXP-DPURCH-TEST_1');
    });
  });

  describe('getDefaultAccountsForShop', () => {
    it('should return correct number of default accounts', () => {
      const shopCode = 'ELEC';

      const accounts = AccountGenerationService.getDefaultAccountsForShop(shopCode);

      expect(accounts).toHaveLength(9); // 5 level-1 accounts + 4 level-2 accounts
    });

    it('should create accounts with correct hierarchy levels', () => {
      const shopCode = 'ELEC';

      const accounts = AccountGenerationService.getDefaultAccountsForShop(shopCode);

      const level1Accounts = accounts.filter(acc => acc.level === 1);
      const level2Accounts = accounts.filter(acc => acc.level === 2);

      expect(level1Accounts).toHaveLength(5); // REV, EXP, ASSET, LIAB, EQUITY
      expect(level2Accounts).toHaveLength(4); // DSALES, DPURCH, CASH, AP
    });

    it('should create accounts with correct account types', () => {
      const shopCode = 'ELEC';

      const accounts = AccountGenerationService.getDefaultAccountsForShop(shopCode);

      const revenueAccounts = accounts.filter(acc => acc.accountType === AccountType.REVENUE);
      const expenseAccounts = accounts.filter(acc => acc.accountType === AccountType.EXPENSE);
      const assetAccounts = accounts.filter(acc => acc.accountType === AccountType.ASSET);
      const liabilityAccounts = accounts.filter(acc => acc.accountType === AccountType.LIABILITY);
      const equityAccounts = accounts.filter(acc => acc.accountType === AccountType.EQUITY);

      expect(revenueAccounts).toHaveLength(2); // REV + DSALES
      expect(expenseAccounts).toHaveLength(2); // EXP + DPURCH
      expect(assetAccounts).toHaveLength(2); // ASSET + CASH
      expect(liabilityAccounts).toHaveLength(2); // LIAB + AP
      expect(equityAccounts).toHaveLength(1); // EQUITY only
    });

    it('should generate correct codes for all accounts', () => {
      const shopCode = 'ELEC';

      const accounts = AccountGenerationService.getDefaultAccountsForShop(shopCode);

      const expectedCodes = [
        'REV-ELEC',
        'REV-DSALES-ELEC',
        'EXP-ELEC',
        'EXP-DPURCH-ELEC',
        'ASSET-ELEC',
        'ASSET-CASH-ELEC',
        'LIAB-ELEC',
        'LIAB-AP-ELEC',
        'EQUITY-ELEC'
      ];

      const actualCodes = accounts.map(acc => acc.code).sort();
      expect(actualCodes).toEqual(expectedCodes.sort());
    });

    it('should generate bilingual names with shop suffix', () => {
      const shopCode = 'ELEC';

      const accounts = AccountGenerationService.getDefaultAccountsForShop(shopCode);

      const directSalesAccount = accounts.find(acc => acc.code === 'REV-DSALES-ELEC');

      expect(directSalesAccount?.nameAr).toBe('المبيعات المباشرة-ELEC');
      expect(directSalesAccount?.nameEn).toBe('Direct Sales-ELEC');
    });
  });

  describe('Static validation methods', () => {
    it('should validate Arabic text in account names', () => {
      const accounts = AccountGenerationService.getDefaultAccountsForShop('TEST');

      accounts.forEach(account => {
        expect(account.nameAr).toMatch(/[\u0600-\u06FF]/); // Contains Arabic characters
        expect(account.nameEn).toMatch(/[a-zA-Z]/); // Contains English characters
      });
    });

    it('should ensure all codes are uppercase', () => {
      const accounts = AccountGenerationService.getDefaultAccountsForShop('test');

      accounts.forEach(account => {
        expect(account.code).toEqual(account.code.toUpperCase());
      });
    });

    it('should validate account type consistency', () => {
      const accounts = AccountGenerationService.getDefaultAccountsForShop('ELEC');

      // Group accounts by type
      const accountsByType = accounts.reduce((acc, account) => {
        if (!acc[account.accountType]) {
          acc[account.accountType] = [];
        }
        acc[account.accountType].push(account);
        return acc;
      }, {} as Record<AccountType, any[]>);

      // Each type should have at least one level 1 account
      Object.values(AccountType).forEach(type => {
        if (accountsByType[type]) {
          const level1Account = accountsByType[type].find(acc => acc.level === 1);
          expect(level1Account).toBeDefined();
        }
      });
    });
  });

  describe('Error handling', () => {
    it('should handle empty shop codes gracefully', () => {
      const shopCode = '';

      const accounts = AccountGenerationService.getDefaultAccountsForShop(shopCode);

      expect(accounts).toHaveLength(9);
      accounts.forEach(account => {
        expect(account.code).toContain('-'); // Should still have separator
      });
    });

    it('should handle special characters in shop codes', () => {
      const shopCode = 'TEST-123_ABC';

      const accounts = AccountGenerationService.getDefaultAccountsForShop(shopCode);

      expect(accounts).toHaveLength(9);
      accounts.forEach(account => {
        expect(account.code).toContain(shopCode);
      });
    });
  });
});