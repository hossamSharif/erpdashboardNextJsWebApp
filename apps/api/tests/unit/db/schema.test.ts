import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test data setup
const testShopId = '550e8400-e29b-41d4-a716-446655440001';
const testShop2Id = '550e8400-e29b-41d4-a716-446655440002';
const testUserId = '550e8400-e29b-41d4-a716-446655440003';
const testFinancialYearId = '550e8400-e29b-41d4-a716-446655440005';

describe('Database Schema Tests', () => {
  beforeAll(async () => {
    // Clean up any existing test data
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await cleanupTestData();
    await createBaseTestData();
  });

  describe('Shop Model', () => {
    it('should create a shop with bilingual fields', async () => {
      const shop = await prisma.shop.findUnique({
        where: { id: testShopId },
      });

      expect(shop).toBeDefined();
      expect(shop?.nameAr).toBe('متجر اختبار');
      expect(shop?.nameEn).toBe('Test Shop');
      expect(shop?.isActive).toBe(true);
    });

    it('should have unique shop identification', async () => {
      const shops = await prisma.shop.findMany();
      const shopIds = shops.map(shop => shop.id);
      const uniqueIds = [...new Set(shopIds)];

      expect(shopIds.length).toBe(uniqueIds.length);
    });
  });

  describe('Multi-tenant Isolation', () => {
    it('should isolate user data by shop', async () => {
      // Create users for different shops
      const shop1User = await prisma.user.create({
        data: {
          email: 'user1@shop1.com',
          name: 'Shop 1 User',
          shopId: testShopId,
          role: 'USER',
        },
      });

      const shop2User = await prisma.user.create({
        data: {
          email: 'user2@shop2.com',
          name: 'Shop 2 User',
          shopId: testShop2Id,
          role: 'USER',
        },
      });

      // Query users for shop 1 only
      const shop1Users = await prisma.user.findMany({
        where: { shopId: testShopId },
      });

      expect(shop1Users).toHaveLength(2); // admin + shop1User
      expect(shop1Users.map(u => u.id)).not.toContain(shop2User.id);
      expect(shop1Users.some(u => u.id === shop1User.id)).toBe(true);
    });

    it('should enforce unique constraints within shop context', async () => {
      // Create account with code '1000' in first shop
      await prisma.account.create({
        data: {
          code: '1000',
          nameAr: 'حساب اختبار 1',
          nameEn: 'Test Account 1',
          accountType: 'ASSET',
          shopId: testShopId,
        },
      });

      // Should be able to create same code in different shop
      await expect(
        prisma.account.create({
          data: {
            code: '1000',
            nameAr: 'حساب اختبار 2',
            nameEn: 'Test Account 2',
            accountType: 'ASSET',
            shopId: testShop2Id,
          },
        })
      ).resolves.toBeDefined();

      // Should NOT be able to create same code in same shop
      await expect(
        prisma.account.create({
          data: {
            code: '1000',
            nameAr: 'حساب اختبار 3',
            nameEn: 'Test Account 3',
            accountType: 'ASSET',
            shopId: testShopId,
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Account Hierarchy', () => {
    it('should support hierarchical account structure', async () => {
      // Create parent account
      const parentAccount = await prisma.account.create({
        data: {
          code: '1000',
          nameAr: 'الأصول',
          nameEn: 'Assets',
          accountType: 'ASSET',
          level: 0,
          shopId: testShopId,
        },
      });

      // Create child account
      const childAccount = await prisma.account.create({
        data: {
          code: '1100',
          nameAr: 'النقدية',
          nameEn: 'Cash',
          accountType: 'ASSET',
          level: 1,
          parentId: parentAccount.id,
          shopId: testShopId,
        },
      });

      // Verify relationship
      const accountWithChildren = await prisma.account.findUnique({
        where: { id: parentAccount.id },
        include: { children: true },
      });

      const accountWithParent = await prisma.account.findUnique({
        where: { id: childAccount.id },
        include: { parent: true },
      });

      expect(accountWithChildren?.children).toHaveLength(1);
      expect(accountWithChildren?.children[0].id).toBe(childAccount.id);
      expect(accountWithParent?.parent?.id).toBe(parentAccount.id);
    });
  });

  describe('Transaction Double-Entry System', () => {
    it('should create valid double-entry transactions', async () => {
      // Create necessary accounts
      const cashAccount = await prisma.account.create({
        data: {
          code: '1100',
          nameAr: 'النقدية',
          nameEn: 'Cash',
          accountType: 'ASSET',
          shopId: testShopId,
        },
      });

      const salesAccount = await prisma.account.create({
        data: {
          code: '4100',
          nameAr: 'المبيعات',
          nameEn: 'Sales',
          accountType: 'REVENUE',
          shopId: testShopId,
        },
      });

      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          transactionType: 'SALE',
          amount: 1000.00,
          description: 'Test sale transaction',
          transactionDate: new Date(),
          debitAccountId: cashAccount.id,
          creditAccountId: salesAccount.id,
          debitUserId: testUserId,
          creditUserId: testUserId,
          shopId: testShopId,
          financialYearId: testFinancialYearId,
        },
      });

      expect(transaction.amount.toNumber()).toBe(1000.00);
      expect(transaction.debitAccountId).toBe(cashAccount.id);
      expect(transaction.creditAccountId).toBe(salesAccount.id);
    });
  });

  describe('Bilingual Support', () => {
    it('should store Arabic and English content correctly', async () => {
      const notification = await prisma.notification.create({
        data: {
          titleAr: 'عنوان باللغة العربية',
          titleEn: 'English Title',
          messageAr: 'رسالة باللغة العربية مع أرقام ١٢٣',
          messageEn: 'English message with numbers 123',
          notificationType: 'SYSTEM_UPDATE',
          userId: testUserId,
          shopId: testShopId,
        },
      });

      expect(notification.titleAr).toBe('عنوان باللغة العربية');
      expect(notification.titleEn).toBe('English Title');
      expect(notification.messageAr).toBe('رسالة باللغة العربية مع أرقام ١٢٣');
      expect(notification.messageEn).toBe('English message with numbers 123');
    });
  });

  describe('Cascade Deletion', () => {
    it('should cascade delete shop-related data', async () => {
      // Create additional data for a shop
      const shop = await prisma.shop.create({
        data: {
          nameAr: 'متجر للحذف',
          nameEn: 'Shop to Delete',
          ownerId: '550e8400-e29b-41d4-a716-446655440099',
        },
      });

      const user = await prisma.user.create({
        data: {
          email: 'todelete@example.com',
          name: 'User to Delete',
          shopId: shop.id,
          role: 'USER',
        },
      });

      const account = await prisma.account.create({
        data: {
          code: '9999',
          nameAr: 'حساب للحذف',
          nameEn: 'Account to Delete',
          accountType: 'ASSET',
          shopId: shop.id,
        },
      });

      // Verify data exists
      expect(await prisma.user.findUnique({ where: { id: user.id } })).toBeDefined();
      expect(await prisma.account.findUnique({ where: { id: account.id } })).toBeDefined();

      // Delete shop
      await prisma.shop.delete({ where: { id: shop.id } });

      // Verify cascaded deletion
      expect(await prisma.user.findUnique({ where: { id: user.id } })).toBeNull();
      expect(await prisma.account.findUnique({ where: { id: account.id } })).toBeNull();
    });
  });

  describe('Database Indexes', () => {
    it('should efficiently query by shopId', async () => {
      // Create multiple accounts for performance testing
      const accounts = [];
      for (let i = 0; i < 10; i++) {
        accounts.push({
          code: `TEST${i.toString().padStart(3, '0')}`,
          nameAr: `حساب اختبار ${i}`,
          nameEn: `Test Account ${i}`,
          accountType: 'ASSET' as const,
          shopId: testShopId,
        });
      }

      await prisma.account.createMany({
        data: accounts,
      });

      const start = Date.now();
      const shopAccounts = await prisma.account.findMany({
        where: { shopId: testShopId },
      });
      const queryTime = Date.now() - start;

      expect(shopAccounts.length).toBeGreaterThanOrEqual(10);
      expect(queryTime).toBeLessThan(100); // Should be fast with index
    });
  });
});

// Helper functions
async function createBaseTestData() {
  // Create test shops
  await prisma.shop.create({
    data: {
      id: testShopId,
      nameAr: 'متجر اختبار',
      nameEn: 'Test Shop',
      ownerId: '550e8400-e29b-41d4-a716-446655440000',
      isActive: true,
    },
  });

  await prisma.shop.create({
    data: {
      id: testShop2Id,
      nameAr: 'متجر اختبار ٢',
      nameEn: 'Test Shop 2',
      ownerId: '550e8400-e29b-41d4-a716-446655440000',
      isActive: true,
    },
  });

  // Create test user
  await prisma.user.create({
    data: {
      id: testUserId,
      email: 'test@example.com',
      name: 'Test User',
      role: 'ADMIN',
      shopId: testShopId,
      isActive: true,
    },
  });

  // Create financial year
  await prisma.financialYear.create({
    data: {
      id: testFinancialYearId,
      year: new Date().getFullYear(),
      startDate: new Date(`${new Date().getFullYear()}-01-01`),
      endDate: new Date(`${new Date().getFullYear()}-12-31`),
      isCurrent: true,
      shopId: testShopId,
    },
  });
}

async function cleanupTestData() {
  // Delete in reverse dependency order to avoid foreign key constraints
  await prisma.transaction.deleteMany();
  await prisma.syncLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.financialYear.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.shop.deleteMany();
}