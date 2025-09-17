import { PrismaClient, CategoryAccountAssignment } from '@prisma/client';
import { CategoryAssignmentResult } from '@packages/shared/src/types/expenseCategory';

export class CategoryAssignmentService {
  constructor(private readonly prisma: PrismaClient) {}

  async assignCategoryToAccount(
    categoryId: string,
    accountId: string,
    shopId: string
  ): Promise<CategoryAccountAssignment> {
    // Validate that both category and account exist and belong to the shop
    const [category, account] = await Promise.all([
      this.prisma.expenseCategory.findFirst({
        where: { id: categoryId, shopId },
      }),
      this.prisma.account.findFirst({
        where: { id: accountId, shopId, accountType: 'EXPENSE' },
      }),
    ]);

    if (!category) {
      throw new Error('Category not found or does not belong to this shop');
    }

    if (!account) {
      throw new Error('Expense account not found or does not belong to this shop');
    }

    // Check if assignment already exists
    const existingAssignment = await this.prisma.categoryAccountAssignment.findFirst({
      where: {
        categoryId,
        accountId,
        shopId,
      },
    });

    if (existingAssignment) {
      throw new Error('Category is already assigned to this account');
    }

    // Create the assignment
    return this.prisma.categoryAccountAssignment.create({
      data: {
        categoryId,
        accountId,
        shopId,
      },
      include: {
        category: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            code: true,
          },
        },
        account: {
          select: {
            id: true,
            code: true,
            nameAr: true,
            nameEn: true,
          },
        },
      },
    });
  }

  async removeCategoryAssignment(
    categoryId: string,
    accountId: string,
    shopId: string
  ): Promise<void> {
    const assignment = await this.prisma.categoryAccountAssignment.findFirst({
      where: {
        categoryId,
        accountId,
        shopId,
      },
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    await this.prisma.categoryAccountAssignment.delete({
      where: {
        id: assignment.id,
      },
    });
  }

  async getCategoryAssignments(
    categoryId: string,
    shopId: string
  ): Promise<CategoryAccountAssignment[]> {
    return this.prisma.categoryAccountAssignment.findMany({
      where: {
        categoryId,
        shopId,
      },
      include: {
        account: {
          select: {
            id: true,
            code: true,
            nameAr: true,
            nameEn: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        account: {
          code: 'asc',
        },
      },
    });
  }

  async getAccountAssignments(
    accountId: string,
    shopId: string
  ): Promise<CategoryAccountAssignment[]> {
    return this.prisma.categoryAccountAssignment.findMany({
      where: {
        accountId,
        shopId,
      },
      include: {
        category: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            code: true,
            level: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        category: {
          code: 'asc',
        },
      },
    });
  }

  async bulkAssignCategoriesToAccount(
    accountId: string,
    categoryIds: string[],
    shopId: string
  ): Promise<CategoryAssignmentResult[]> {
    const results: CategoryAssignmentResult[] = [];

    // Validate account exists and is an expense account
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, shopId, accountType: 'EXPENSE' },
    });

    if (!account) {
      throw new Error('Expense account not found or does not belong to this shop');
    }

    for (const categoryId of categoryIds) {
      try {
        const assignment = await this.assignCategoryToAccount(categoryId, accountId, shopId);
        results.push({
          success: true,
          assignment,
        });
      } catch (error) {
        results.push({
          success: false,
          errors: [{
            field: 'categoryId',
            message: error instanceof Error ? error.message : 'Failed to assign category',
            code: 'ASSIGNMENT_FAILED',
          }],
        });
      }
    }

    return results;
  }

  async bulkRemoveCategoryAssignments(
    accountId: string,
    categoryIds: string[],
    shopId: string
  ): Promise<{ success: boolean; removedCount: number; errors: string[] }> {
    let removedCount = 0;
    const errors: string[] = [];

    for (const categoryId of categoryIds) {
      try {
        await this.removeCategoryAssignment(categoryId, accountId, shopId);
        removedCount++;
      } catch (error) {
        errors.push(
          `Failed to remove assignment for category ${categoryId}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }

    return {
      success: errors.length === 0,
      removedCount,
      errors,
    };
  }

  async getUnassignedExpenseAccounts(shopId: string): Promise<Array<{
    id: string;
    code: string;
    nameAr: string;
    nameEn: string;
  }>> {
    return this.prisma.account.findMany({
      where: {
        shopId,
        accountType: 'EXPENSE',
        isActive: true,
        categoryAssignments: {
          none: {},
        },
      },
      select: {
        id: true,
        code: true,
        nameAr: true,
        nameEn: true,
      },
      orderBy: {
        code: 'asc',
      },
    });
  }

  async getCategoriesWithoutAccounts(shopId: string): Promise<Array<{
    id: string;
    nameAr: string;
    nameEn: string;
    code: string;
    level: number;
  }>> {
    return this.prisma.expenseCategory.findMany({
      where: {
        shopId,
        isActive: true,
        accountAssignments: {
          none: {},
        },
      },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        code: true,
        level: true,
      },
      orderBy: [
        { level: 'asc' },
        { code: 'asc' },
      ],
    });
  }

  async validateAssignment(
    categoryId: string,
    accountId: string,
    shopId: string
  ): Promise<{ isValid: boolean; error?: string }> {
    // Check if category exists and is active
    const category = await this.prisma.expenseCategory.findFirst({
      where: {
        id: categoryId,
        shopId,
        isActive: true,
      },
    });

    if (!category) {
      return {
        isValid: false,
        error: 'Category not found or is inactive',
      };
    }

    // Check if account exists, is active, and is an expense account
    const account = await this.prisma.account.findFirst({
      where: {
        id: accountId,
        shopId,
        accountType: 'EXPENSE',
        isActive: true,
      },
    });

    if (!account) {
      return {
        isValid: false,
        error: 'Account not found, is inactive, or is not an expense account',
      };
    }

    // Check if assignment already exists
    const existingAssignment = await this.prisma.categoryAccountAssignment.findFirst({
      where: {
        categoryId,
        accountId,
        shopId,
      },
    });

    if (existingAssignment) {
      return {
        isValid: false,
        error: 'Category is already assigned to this account',
      };
    }

    return { isValid: true };
  }
}