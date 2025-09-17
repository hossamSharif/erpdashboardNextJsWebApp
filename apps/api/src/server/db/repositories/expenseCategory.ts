import { PrismaClient, ExpenseCategory } from '@prisma/client';
import { ExpenseCategorySearchFilters } from '@packages/shared/src/validators/expenseCategory';

export class ExpenseCategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: {
    nameAr: string;
    nameEn: string;
    code: string;
    parentId?: string;
    level: number;
    shopId: string;
    isSystemCategory?: boolean;
  }): Promise<ExpenseCategory> {
    return this.prisma.expenseCategory.create({
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        code: data.code,
        parentId: data.parentId,
        level: data.level,
        shopId: data.shopId,
        isSystemCategory: data.isSystemCategory || false,
      },
      include: {
        parent: true,
        children: true,
        accountAssignments: {
          include: {
            account: {
              select: {
                id: true,
                code: true,
                nameAr: true,
                nameEn: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string, shopId: string): Promise<ExpenseCategory | null> {
    return this.prisma.expenseCategory.findFirst({
      where: {
        id,
        shopId,
      },
      include: {
        parent: true,
        children: true,
        accountAssignments: {
          include: {
            account: {
              select: {
                id: true,
                code: true,
                nameAr: true,
                nameEn: true,
              },
            },
          },
        },
      },
    });
  }

  async findByCode(code: string, shopId: string): Promise<ExpenseCategory | null> {
    return this.prisma.expenseCategory.findFirst({
      where: {
        code,
        shopId,
      },
    });
  }

  async findAllByShop(
    shopId: string,
    filters?: ExpenseCategorySearchFilters
  ): Promise<ExpenseCategory[]> {
    const where: any = {
      shopId,
    };

    if (filters?.query) {
      where.OR = [
        { nameAr: { contains: filters.query, mode: 'insensitive' } },
        { nameEn: { contains: filters.query, mode: 'insensitive' } },
        { code: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    if (filters?.level !== undefined) {
      where.level = filters.level;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.parentId !== undefined) {
      where.parentId = filters.parentId;
    }

    if (filters?.isSystemCategory !== undefined) {
      where.isSystemCategory = filters.isSystemCategory;
    }

    return this.prisma.expenseCategory.findMany({
      where,
      include: {
        parent: true,
        children: true,
        accountAssignments: {
          include: {
            account: {
              select: {
                id: true,
                code: true,
                nameAr: true,
                nameEn: true,
              },
            },
          },
        },
      },
      orderBy: [
        { level: 'asc' },
        { code: 'asc' },
        { nameEn: 'asc' },
      ],
    });
  }

  async findRootCategories(shopId: string): Promise<ExpenseCategory[]> {
    return this.prisma.expenseCategory.findMany({
      where: {
        shopId,
        parentId: null,
        isActive: true,
      },
      include: {
        children: {
          include: {
            children: true,
          },
        },
      },
      orderBy: [
        { code: 'asc' },
        { nameEn: 'asc' },
      ],
    });
  }

  async findChildren(parentId: string, shopId: string): Promise<ExpenseCategory[]> {
    return this.prisma.expenseCategory.findMany({
      where: {
        parentId,
        shopId,
      },
      include: {
        children: true,
        accountAssignments: {
          include: {
            account: {
              select: {
                id: true,
                code: true,
                nameAr: true,
                nameEn: true,
              },
            },
          },
        },
      },
      orderBy: [
        { code: 'asc' },
        { nameEn: 'asc' },
      ],
    });
  }

  async hasChildren(id: string, shopId: string): Promise<boolean> {
    const count = await this.prisma.expenseCategory.count({
      where: {
        parentId: id,
        shopId,
      },
    });
    return count > 0;
  }

  async update(
    id: string,
    shopId: string,
    data: Partial<{
      nameAr: string;
      nameEn: string;
      code: string;
      parentId: string;
      isActive: boolean;
    }>
  ): Promise<ExpenseCategory> {
    return this.prisma.expenseCategory.update({
      where: {
        id,
      },
      data,
      include: {
        parent: true,
        children: true,
        accountAssignments: {
          include: {
            account: {
              select: {
                id: true,
                code: true,
                nameAr: true,
                nameEn: true,
              },
            },
          },
        },
      },
    });
  }

  async delete(id: string, shopId: string): Promise<void> {
    // First check if category exists and belongs to shop
    const category = await this.findById(id, shopId);
    if (!category) {
      throw new Error('Category not found');
    }

    // Delete the category (cascade will handle assignments)
    await this.prisma.expenseCategory.delete({
      where: {
        id,
      },
    });
  }

  async count(shopId: string, filters?: ExpenseCategorySearchFilters): Promise<number> {
    const where: any = {
      shopId,
    };

    if (filters?.query) {
      where.OR = [
        { nameAr: { contains: filters.query, mode: 'insensitive' } },
        { nameEn: { contains: filters.query, mode: 'insensitive' } },
        { code: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    if (filters?.level !== undefined) {
      where.level = filters.level;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.isSystemCategory !== undefined) {
      where.isSystemCategory = filters.isSystemCategory;
    }

    return this.prisma.expenseCategory.count({
      where,
    });
  }

  async bulkCreate(
    categories: Array<{
      nameAr: string;
      nameEn: string;
      code: string;
      parentId?: string;
      level: number;
      shopId: string;
      isSystemCategory?: boolean;
    }>
  ): Promise<ExpenseCategory[]> {
    const created: ExpenseCategory[] = [];

    // Use transaction to ensure all-or-nothing creation
    await this.prisma.$transaction(async (tx) => {
      for (const categoryData of categories) {
        const category = await tx.expenseCategory.create({
          data: categoryData,
          include: {
            parent: true,
            children: true,
          },
        });
        created.push(category);
      }
    });

    return created;
  }

  async getSystemCategories(shopId: string): Promise<ExpenseCategory[]> {
    return this.prisma.expenseCategory.findMany({
      where: {
        shopId,
        isSystemCategory: true,
      },
      orderBy: [
        { level: 'asc' },
        { code: 'asc' },
      ],
    });
  }
}