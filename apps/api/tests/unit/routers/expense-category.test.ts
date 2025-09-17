import { describe, it, expect, beforeEach, vi } from 'vitest';
import { expenseCategoryRouter } from '../../../src/server/routers/expense-category';
import { createInnerTRPCContext } from '../../../src/server/trpc';
import { PrismaClient } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { TRPCError } from '@trpc/server';

vi.mock('@prisma/client', () => {
  const PrismaClient = vi.fn();
  PrismaClient.prototype.expenseCategory = {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  };
  PrismaClient.prototype.categoryAccountAssignment = {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  };
  PrismaClient.prototype.account = {
    findFirst: vi.fn(),
    findMany: vi.fn(),
  };
  PrismaClient.prototype.transaction = {
    findMany: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  };
  PrismaClient.prototype.$transaction = vi.fn();

  return { PrismaClient };
});

vi.mock('../../../src/server/db/repositories/expenseCategory', () => ({
  ExpenseCategoryRepository: vi.fn(() => ({
    create: vi.fn(),
    findById: vi.fn(),
    findByCode: vi.fn(),
    findAllByShop: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    hasChildren: vi.fn(),
  })),
}));

vi.mock('../../../src/server/services/category-hierarchy.service', () => ({
  CategoryHierarchyService: vi.fn(() => ({
    calculateCategoryLevel: vi.fn(),
    wouldCreateCircularReference: vi.fn(),
    bulkImportCategories: vi.fn(),
    buildCategoryTree: vi.fn(),
  })),
}));

vi.mock('../../../src/server/services/category-assignment.service', () => ({
  CategoryAssignmentService: vi.fn(() => ({
    assignCategoryToAccount: vi.fn(),
    removeCategoryAssignment: vi.fn(),
  })),
}));

vi.mock('../../../src/server/services/category-usage.service', () => ({
  CategoryUsageService: vi.fn(() => ({
    getCategoryUsageStats: vi.fn(),
  })),
}));

describe('expenseCategoryRouter', () => {
  let prisma: PrismaClient;
  let ctx: ReturnType<typeof createInnerTRPCContext>;
  let caller: ReturnType<typeof expenseCategoryRouter.createCaller>;

  beforeEach(() => {
    prisma = new PrismaClient();

    ctx = createInnerTRPCContext({
      session: {
        user: {
          id: 'test-user-id',
          email: 'admin@test.com',
          name: 'Test Admin',
          role: UserRole.ADMIN,
          shopId: 'test-shop-id',
        },
      },
      prisma,
    });

    caller = expenseCategoryRouter.createCaller(ctx);
    vi.clearAllMocks();
  });

  describe('createExpenseCategory', () => {
    it('should create a new expense category successfully', async () => {
      const mockCategory = {
        id: 'test-category-id',
        nameAr: 'تصنيف المصاريف',
        nameEn: 'Expense Category',
        code: 'EXP_TEST',
        level: 1,
        shopId: 'test-shop-id',
        isActive: true,
        isSystemCategory: false,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { ExpenseCategoryRepository } = await import('../../../src/server/db/repositories/expenseCategory');
      const mockRepo = new ExpenseCategoryRepository(prisma);
      (mockRepo.create as any).mockResolvedValue(mockCategory);

      const input = {
        nameAr: 'تصنيف المصاريف',
        nameEn: 'Expense Category',
        code: 'EXP_TEST',
        shopId: 'test-shop-id',
      };

      const result = await caller.createExpenseCategory(input);

      expect(result).toEqual(mockCategory);
      expect(mockRepo.create).toHaveBeenCalledWith({
        ...input,
        level: 1,
      });
    });

    it('should create a subcategory with correct level', async () => {
      const mockParent = {
        id: 'parent-id',
        level: 1,
        shopId: 'test-shop-id',
      };

      const mockSubcategory = {
        id: 'sub-category-id',
        nameAr: 'تصنيف فرعي',
        nameEn: 'Subcategory',
        code: 'EXP_SUB',
        level: 2,
        parentId: 'parent-id',
        shopId: 'test-shop-id',
        isActive: true,
        isSystemCategory: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { ExpenseCategoryRepository } = await import('../../../src/server/db/repositories/expenseCategory');
      const { CategoryHierarchyService } = await import('../../../src/server/services/category-hierarchy.service');

      const mockRepo = new ExpenseCategoryRepository(prisma);
      const mockHierarchyService = new CategoryHierarchyService(prisma);

      (mockRepo.findById as any).mockResolvedValue(mockParent);
      (mockHierarchyService.calculateCategoryLevel as any).mockResolvedValue(2);
      (mockRepo.create as any).mockResolvedValue(mockSubcategory);

      const input = {
        nameAr: 'تصنيف فرعي',
        nameEn: 'Subcategory',
        code: 'EXP_SUB',
        parentId: 'parent-id',
        shopId: 'test-shop-id',
      };

      const result = await caller.createExpenseCategory(input);

      expect(result).toEqual(mockSubcategory);
      expect(mockRepo.findById).toHaveBeenCalledWith('parent-id', 'test-shop-id');
      expect(mockHierarchyService.calculateCategoryLevel).toHaveBeenCalledWith('parent-id', 'test-shop-id');
    });

    it('should throw error if parent category not found', async () => {
      const { ExpenseCategoryRepository } = await import('../../../src/server/db/repositories/expenseCategory');
      const mockRepo = new ExpenseCategoryRepository(prisma);
      (mockRepo.findById as any).mockResolvedValue(null);

      const input = {
        nameAr: 'تصنيف فرعي',
        nameEn: 'Subcategory',
        code: 'EXP_SUB',
        parentId: 'non-existent-parent',
        shopId: 'test-shop-id',
      };

      await expect(caller.createExpenseCategory(input)).rejects.toThrow('Parent category not found');
    });

    it('should throw error if parent is at maximum depth', async () => {
      const mockParent = {
        id: 'parent-id',
        level: 3,
        shopId: 'test-shop-id',
      };

      const { ExpenseCategoryRepository } = await import('../../../src/server/db/repositories/expenseCategory');
      const mockRepo = new ExpenseCategoryRepository(prisma);
      (mockRepo.findById as any).mockResolvedValue(mockParent);

      const input = {
        nameAr: 'تصنيف عميق',
        nameEn: 'Deep Category',
        code: 'EXP_DEEP',
        parentId: 'parent-id',
        shopId: 'test-shop-id',
      };

      await expect(caller.createExpenseCategory(input)).rejects.toThrow('Maximum category hierarchy depth is 3 levels');
    });
  });

  describe('updateExpenseCategory', () => {
    it('should update an existing category', async () => {
      const mockExistingCategory = {
        id: 'test-category-id',
        nameAr: 'تصنيف قديم',
        nameEn: 'Old Category',
        code: 'OLD_CAT',
        level: 1,
        parentId: null,
        shopId: 'test-shop-id',
        isActive: true,
        isSystemCategory: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedCategory = {
        ...mockExistingCategory,
        nameEn: 'Updated Category',
      };

      const { ExpenseCategoryRepository } = await import('../../../src/server/db/repositories/expenseCategory');
      const mockRepo = new ExpenseCategoryRepository(prisma);
      (mockRepo.findById as any).mockResolvedValue(mockExistingCategory);
      (mockRepo.update as any).mockResolvedValue(mockUpdatedCategory);

      const input = {
        id: 'test-category-id',
        nameEn: 'Updated Category',
      };

      const result = await caller.updateExpenseCategory(input);

      expect(result).toEqual(mockUpdatedCategory);
      expect(mockRepo.update).toHaveBeenCalledWith('test-category-id', 'test-shop-id', input);
    });

    it('should throw error if category not found', async () => {
      const { ExpenseCategoryRepository } = await import('../../../src/server/db/repositories/expenseCategory');
      const mockRepo = new ExpenseCategoryRepository(prisma);
      (mockRepo.findById as any).mockResolvedValue(null);

      const input = {
        id: 'non-existent-id',
        nameEn: 'Updated Category',
      };

      await expect(caller.updateExpenseCategory(input)).rejects.toThrow('Category not found');
    });

    it('should validate circular references when changing parent', async () => {
      const mockExistingCategory = {
        id: 'test-category-id',
        parentId: null,
        shopId: 'test-shop-id',
      };

      const { ExpenseCategoryRepository } = await import('../../../src/server/db/repositories/expenseCategory');
      const { CategoryHierarchyService } = await import('../../../src/server/services/category-hierarchy.service');

      const mockRepo = new ExpenseCategoryRepository(prisma);
      const mockHierarchyService = new CategoryHierarchyService(prisma);

      (mockRepo.findById as any).mockResolvedValue(mockExistingCategory);
      (mockHierarchyService.wouldCreateCircularReference as any).mockResolvedValue(true);

      const input = {
        id: 'test-category-id',
        parentId: 'new-parent-id',
      };

      await expect(caller.updateExpenseCategory(input)).rejects.toThrow('This would create a circular reference');
    });
  });

  describe('deleteExpenseCategory', () => {
    it('should delete a non-system category without children', async () => {
      const mockCategory = {
        id: 'test-category-id',
        isSystemCategory: false,
        shopId: 'test-shop-id',
      };

      const { ExpenseCategoryRepository } = await import('../../../src/server/db/repositories/expenseCategory');
      const mockRepo = new ExpenseCategoryRepository(prisma);
      (mockRepo.findById as any).mockResolvedValue(mockCategory);
      (mockRepo.hasChildren as any).mockResolvedValue(false);
      (mockRepo.delete as any).mockResolvedValue(undefined);

      const result = await caller.deleteExpenseCategory({ id: 'test-category-id' });

      expect(result).toEqual({ success: true });
      expect(mockRepo.delete).toHaveBeenCalledWith('test-category-id', 'test-shop-id');
    });

    it('should throw error when trying to delete system category', async () => {
      const mockCategory = {
        id: 'test-category-id',
        isSystemCategory: true,
        shopId: 'test-shop-id',
      };

      const { ExpenseCategoryRepository } = await import('../../../src/server/db/repositories/expenseCategory');
      const mockRepo = new ExpenseCategoryRepository(prisma);
      (mockRepo.findById as any).mockResolvedValue(mockCategory);

      await expect(caller.deleteExpenseCategory({ id: 'test-category-id' })).rejects.toThrow(
        'System categories cannot be deleted'
      );
    });

    it('should throw error when trying to delete category with children', async () => {
      const mockCategory = {
        id: 'test-category-id',
        isSystemCategory: false,
        shopId: 'test-shop-id',
      };

      const { ExpenseCategoryRepository } = await import('../../../src/server/db/repositories/expenseCategory');
      const mockRepo = new ExpenseCategoryRepository(prisma);
      (mockRepo.findById as any).mockResolvedValue(mockCategory);
      (mockRepo.hasChildren as any).mockResolvedValue(true);

      await expect(caller.deleteExpenseCategory({ id: 'test-category-id' })).rejects.toThrow(
        'Cannot delete category with subcategories'
      );
    });
  });

  describe('toggleCategoryStatus', () => {
    it('should toggle status of non-system category', async () => {
      const mockCategory = {
        id: 'test-category-id',
        isSystemCategory: false,
        isActive: true,
        shopId: 'test-shop-id',
      };

      const mockUpdatedCategory = {
        ...mockCategory,
        isActive: false,
      };

      const { ExpenseCategoryRepository } = await import('../../../src/server/db/repositories/expenseCategory');
      const mockRepo = new ExpenseCategoryRepository(prisma);
      (mockRepo.findById as any).mockResolvedValue(mockCategory);
      (mockRepo.update as any).mockResolvedValue(mockUpdatedCategory);

      const result = await caller.toggleCategoryStatus({
        id: 'test-category-id',
        isActive: false,
      });

      expect(result).toEqual(mockUpdatedCategory);
      expect(mockRepo.update).toHaveBeenCalledWith('test-category-id', 'test-shop-id', { isActive: false });
    });

    it('should throw error when trying to deactivate system category', async () => {
      const mockCategory = {
        id: 'test-category-id',
        isSystemCategory: true,
        isActive: true,
        shopId: 'test-shop-id',
      };

      const { ExpenseCategoryRepository } = await import('../../../src/server/db/repositories/expenseCategory');
      const mockRepo = new ExpenseCategoryRepository(prisma);
      (mockRepo.findById as any).mockResolvedValue(mockCategory);

      await expect(
        caller.toggleCategoryStatus({
          id: 'test-category-id',
          isActive: false,
        })
      ).rejects.toThrow('System categories cannot be deactivated');
    });
  });

  describe('bulkImportCategories', () => {
    it('should import categories successfully', async () => {
      const mockResult = {
        success: true,
        createdCount: 2,
        skippedCount: 0,
        errorCount: 0,
        categories: [],
        errors: [],
      };

      const { CategoryHierarchyService } = await import('../../../src/server/services/category-hierarchy.service');
      const mockHierarchyService = new CategoryHierarchyService(prisma);
      (mockHierarchyService.bulkImportCategories as any).mockResolvedValue(mockResult);

      const input = {
        categories: [
          {
            nameAr: 'تصنيف 1',
            nameEn: 'Category 1',
            code: 'CAT1',
            level: 1,
          },
          {
            nameAr: 'تصنيف 2',
            nameEn: 'Category 2',
            code: 'CAT2',
            level: 1,
          },
        ],
        shopId: 'test-shop-id',
      };

      const result = await caller.bulkImportCategories(input);

      expect(result).toEqual(mockResult);
      expect(mockHierarchyService.bulkImportCategories).toHaveBeenCalledWith(input.categories, 'test-shop-id');
    });
  });

  describe('getExpenseCategories', () => {
    it('should return all categories for shop', async () => {
      const mockCategories = [
        {
          id: 'cat1',
          nameAr: 'تصنيف 1',
          nameEn: 'Category 1',
          code: 'CAT1',
          level: 1,
          shopId: 'test-shop-id',
          isActive: true,
        },
        {
          id: 'cat2',
          nameAr: 'تصنيف 2',
          nameEn: 'Category 2',
          code: 'CAT2',
          level: 1,
          shopId: 'test-shop-id',
          isActive: true,
        },
      ];

      const { ExpenseCategoryRepository } = await import('../../../src/server/db/repositories/expenseCategory');
      const mockRepo = new ExpenseCategoryRepository(prisma);
      (mockRepo.findAllByShop as any).mockResolvedValue(mockCategories);

      const result = await caller.getExpenseCategories();

      expect(result).toEqual(mockCategories);
      expect(mockRepo.findAllByShop).toHaveBeenCalledWith('test-shop-id', undefined);
    });

    it('should apply search filters', async () => {
      const mockCategories = [
        {
          id: 'cat1',
          nameAr: 'تصنيف المرافق',
          nameEn: 'Utilities',
          code: 'UTILITIES',
          level: 1,
          shopId: 'test-shop-id',
          isActive: true,
        },
      ];

      const { ExpenseCategoryRepository } = await import('../../../src/server/db/repositories/expenseCategory');
      const mockRepo = new ExpenseCategoryRepository(prisma);
      (mockRepo.findAllByShop as any).mockResolvedValue(mockCategories);

      const filters = {
        query: 'utilities',
        level: 1 as 1,
        isActive: true,
      };

      const result = await caller.getExpenseCategories(filters);

      expect(result).toEqual(mockCategories);
      expect(mockRepo.findAllByShop).toHaveBeenCalledWith('test-shop-id', filters);
    });
  });

  describe('getCategoryTree', () => {
    it('should return hierarchical category tree', async () => {
      const mockTree = [
        {
          id: 'parent',
          nameAr: 'تصنيف رئيسي',
          nameEn: 'Parent Category',
          code: 'PARENT',
          level: 1,
          children: [
            {
              id: 'child',
              nameAr: 'تصنيف فرعي',
              nameEn: 'Child Category',
              code: 'CHILD',
              level: 2,
              children: [],
            },
          ],
        },
      ];

      const { CategoryHierarchyService } = await import('../../../src/server/services/category-hierarchy.service');
      const mockHierarchyService = new CategoryHierarchyService(prisma);
      (mockHierarchyService.buildCategoryTree as any).mockResolvedValue(mockTree);

      const result = await caller.getCategoryTree();

      expect(result).toEqual(mockTree);
      expect(mockHierarchyService.buildCategoryTree).toHaveBeenCalledWith('test-shop-id');
    });
  });

  describe('assignCategoryToAccount', () => {
    it('should assign category to account successfully', async () => {
      const mockAssignment = {
        id: 'assignment-id',
        categoryId: 'category-id',
        accountId: 'account-id',
        shopId: 'test-shop-id',
        createdAt: new Date(),
      };

      const { CategoryAssignmentService } = await import('../../../src/server/services/category-assignment.service');
      const mockAssignmentService = new CategoryAssignmentService(prisma);
      (mockAssignmentService.assignCategoryToAccount as any).mockResolvedValue(mockAssignment);

      const input = {
        categoryId: 'category-id',
        accountId: 'account-id',
        shopId: 'test-shop-id',
      };

      const result = await caller.assignCategoryToAccount(input);

      expect(result).toEqual(mockAssignment);
      expect(mockAssignmentService.assignCategoryToAccount).toHaveBeenCalledWith(
        'category-id',
        'account-id',
        'test-shop-id'
      );
    });
  });

  describe('getCategoryUsageStats', () => {
    it('should return usage statistics', async () => {
      const mockStats = [
        {
          categoryId: 'cat1',
          category: {
            nameAr: 'تصنيف 1',
            nameEn: 'Category 1',
            code: 'CAT1',
          },
          assignedAccountsCount: 2,
          transactionCount: 10,
          totalAmount: 1000,
          lastUsedAt: new Date(),
        },
      ];

      const { CategoryUsageService } = await import('../../../src/server/services/category-usage.service');
      const mockUsageService = new CategoryUsageService(prisma);
      (mockUsageService.getCategoryUsageStats as any).mockResolvedValue(mockStats);

      const input = {
        categoryId: 'cat1',
        limit: 50,
      };

      const result = await caller.getCategoryUsageStats(input);

      expect(result).toEqual(mockStats);
      expect(mockUsageService.getCategoryUsageStats).toHaveBeenCalledWith('test-shop-id', 'cat1', 50);
    });
  });
});