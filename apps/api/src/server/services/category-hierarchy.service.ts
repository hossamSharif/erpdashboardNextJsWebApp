import { PrismaClient, ExpenseCategory } from '@prisma/client';
import { ExpenseCategoryTreeNode, BulkImportResult, DefaultCategoryTemplate } from '@packages/shared/src/types/expenseCategory';
import { ExpenseCategoryRepository } from '../db/repositories/expenseCategory';

export class CategoryHierarchyService {
  private expenseCategoryRepo: ExpenseCategoryRepository;

  constructor(private readonly prisma: PrismaClient) {
    this.expenseCategoryRepo = new ExpenseCategoryRepository(prisma);
  }

  async buildCategoryTree(shopId: string): Promise<ExpenseCategoryTreeNode[]> {
    const categories = await this.expenseCategoryRepo.findAllByShop(shopId);

    // Convert to tree structure
    const categoryMap = new Map<string, ExpenseCategoryTreeNode>();
    const rootCategories: ExpenseCategoryTreeNode[] = [];

    // Initialize all categories as tree nodes
    categories.forEach(category => {
      const treeNode: ExpenseCategoryTreeNode = {
        ...category,
        children: [],
        depth: category.level - 1, // 0-based depth
        hasChildren: false,
        isExpanded: false,
        assignedAccountsCount: category.accountAssignments?.length || 0,
      };
      categoryMap.set(category.id, treeNode);
    });

    // Build tree structure
    categories.forEach(category => {
      const treeNode = categoryMap.get(category.id)!;

      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(treeNode);
          parent.hasChildren = true;
        }
      } else {
        rootCategories.push(treeNode);
      }
    });

    // Sort children at each level
    const sortChildren = (nodes: ExpenseCategoryTreeNode[]) => {
      nodes.sort((a, b) => {
        // System categories first
        if (a.isSystemCategory !== b.isSystemCategory) {
          return a.isSystemCategory ? -1 : 1;
        }
        // Then by code
        return a.code.localeCompare(b.code);
      });

      nodes.forEach(node => {
        if (node.children.length > 0) {
          sortChildren(node.children);
        }
      });
    };

    sortChildren(rootCategories);
    return rootCategories;
  }

  async calculateCategoryLevel(parentId: string, shopId: string): Promise<number> {
    const parent = await this.expenseCategoryRepo.findById(parentId, shopId);
    if (!parent) {
      throw new Error('Parent category not found');
    }
    return parent.level + 1;
  }

  async wouldCreateCircularReference(
    categoryId: string,
    newParentId: string,
    shopId: string
  ): Promise<boolean> {
    // Get all categories for the shop
    const categories = await this.expenseCategoryRepo.findAllByShop(shopId);

    // Build a parent-child map
    const parentMap = new Map<string, string>();
    categories.forEach(cat => {
      if (cat.parentId) {
        parentMap.set(cat.id, cat.parentId);
      }
    });

    // Check if setting newParentId as parent of categoryId would create a cycle
    let currentId = newParentId;
    const visited = new Set<string>();

    while (currentId) {
      if (visited.has(currentId)) {
        // Already visited this node, there's a cycle
        return true;
      }

      if (currentId === categoryId) {
        // We've reached the category we're trying to move
        return true;
      }

      visited.add(currentId);
      currentId = parentMap.get(currentId) || '';
    }

    return false;
  }

  async validateHierarchyDepth(parentId: string, shopId: string): Promise<boolean> {
    if (!parentId) return true; // Root level is always valid

    const parent = await this.expenseCategoryRepo.findById(parentId, shopId);
    if (!parent) return false;

    return parent.level < 3; // Maximum depth is 3 levels
  }

  async bulkImportCategories(
    categoryTemplates: DefaultCategoryTemplate[],
    shopId: string
  ): Promise<BulkImportResult> {
    const result: BulkImportResult = {
      success: false,
      createdCount: 0,
      skippedCount: 0,
      errorCount: 0,
      categories: [],
      errors: [],
    };

    try {
      // First pass: Create categories without parents (level 1)
      const rootCategories = categoryTemplates.filter(t => !t.parentCode);
      const childCategories = categoryTemplates.filter(t => t.parentCode);

      const codeToIdMap = new Map<string, string>();
      const createdCategories: ExpenseCategory[] = [];

      // Create root categories
      for (const template of rootCategories) {
        try {
          // Check if category already exists
          const existing = await this.expenseCategoryRepo.findByCode(template.code, shopId);
          if (existing) {
            result.skippedCount++;
            codeToIdMap.set(template.code, existing.id);
            continue;
          }

          const category = await this.expenseCategoryRepo.create({
            nameAr: template.nameAr,
            nameEn: template.nameEn,
            code: template.code,
            level: template.level,
            shopId,
            isSystemCategory: template.isSystemCategory,
          });

          createdCategories.push(category);
          codeToIdMap.set(template.code, category.id);
          result.createdCount++;
        } catch (error) {
          result.errorCount++;
          result.errors?.push({
            field: 'code',
            message: `Failed to create category ${template.code}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            code: 'CREATION_FAILED',
          });
        }
      }

      // Sort child categories by level to create parents before children
      childCategories.sort((a, b) => a.level - b.level);

      // Create child categories
      for (const template of childCategories) {
        try {
          // Check if category already exists
          const existing = await this.expenseCategoryRepo.findByCode(template.code, shopId);
          if (existing) {
            result.skippedCount++;
            continue;
          }

          const parentId = template.parentCode ? codeToIdMap.get(template.parentCode) : undefined;
          if (template.parentCode && !parentId) {
            result.errorCount++;
            result.errors?.push({
              field: 'parentCode',
              message: `Parent category ${template.parentCode} not found for ${template.code}`,
              code: 'PARENT_NOT_FOUND',
            });
            continue;
          }

          const category = await this.expenseCategoryRepo.create({
            nameAr: template.nameAr,
            nameEn: template.nameEn,
            code: template.code,
            parentId,
            level: template.level,
            shopId,
            isSystemCategory: template.isSystemCategory,
          });

          createdCategories.push(category);
          codeToIdMap.set(template.code, category.id);
          result.createdCount++;
        } catch (error) {
          result.errorCount++;
          result.errors?.push({
            field: 'code',
            message: `Failed to create category ${template.code}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            code: 'CREATION_FAILED',
          });
        }
      }

      result.categories = createdCategories;
      result.success = result.errorCount === 0;

    } catch (error) {
      result.success = false;
      result.errors?.push({
        field: 'general',
        message: `Bulk import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'BULK_IMPORT_FAILED',
      });
    }

    return result;
  }

  async getDefaultCategoryTemplates(): Promise<DefaultCategoryTemplate[]> {
    return [
      {
        nameAr: 'المرتبات والأجور',
        nameEn: 'Salaries and Wages',
        code: 'SALARIES',
        level: 1,
        isSystemCategory: true,
      },
      {
        nameAr: 'المرافق العامة',
        nameEn: 'Utilities',
        code: 'UTILITIES',
        level: 1,
        isSystemCategory: true,
      },
      {
        nameAr: 'الكهرباء',
        nameEn: 'Electricity',
        code: 'UTILITIES_ELECTRIC',
        parentCode: 'UTILITIES',
        level: 2,
        isSystemCategory: true,
      },
      {
        nameAr: 'المياه',
        nameEn: 'Water',
        code: 'UTILITIES_WATER',
        parentCode: 'UTILITIES',
        level: 2,
        isSystemCategory: true,
      },
      {
        nameAr: 'اللوازم المكتبية',
        nameEn: 'Office Supplies',
        code: 'SUPPLIES',
        level: 1,
        isSystemCategory: true,
      },
      {
        nameAr: 'النقل والمواصلات',
        nameEn: 'Transportation',
        code: 'TRANSPORT',
        level: 1,
        isSystemCategory: true,
      },
      {
        nameAr: 'الوقود',
        nameEn: 'Fuel',
        code: 'TRANSPORT_FUEL',
        parentCode: 'TRANSPORT',
        level: 2,
        isSystemCategory: true,
      },
      {
        nameAr: 'صيانة المركبات',
        nameEn: 'Vehicle Maintenance',
        code: 'TRANSPORT_MAINTENANCE',
        parentCode: 'TRANSPORT',
        level: 2,
        isSystemCategory: true,
      },
      {
        nameAr: 'أخرى',
        nameEn: 'Other',
        code: 'OTHER',
        level: 1,
        isSystemCategory: true,
      },
    ];
  }

  async createDefaultCategories(shopId: string): Promise<BulkImportResult> {
    const templates = await this.getDefaultCategoryTemplates();
    return this.bulkImportCategories(templates, shopId);
  }
}