import { z } from 'zod';
import { createTRPCRouter, adminProcedure, protectedProcedure } from '../trpc';
import { ExpenseCategoryRepository } from '../db/repositories/expenseCategory';
import { CategoryHierarchyService } from '../services/category-hierarchy.service';
import { CategoryUsageService } from '../services/category-usage.service';
import { CategoryAssignmentService } from '../services/category-assignment.service';
import {
  expenseCategoryCreateSchema,
  expenseCategoryUpdateSchema,
  expenseCategorySearchSchema,
  categoryAssignmentSchema,
  bulkCategoryImportSchema,
  toggleCategoryStatusSchema,
} from '@packages/shared/src/validators/expenseCategory';
import { TRPCError } from '@trpc/server';

export const expenseCategoryRouter = createTRPCRouter({
  createExpenseCategory: adminProcedure
    .input(expenseCategoryCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx;
      const shopId = session.user.shopId;

      const expenseCategoryRepo = new ExpenseCategoryRepository(prisma);
      const hierarchyService = new CategoryHierarchyService(prisma);

      try {
        // Validate hierarchy if parent is specified
        if (input.parentId) {
          const parent = await expenseCategoryRepo.findById(input.parentId, shopId);
          if (!parent) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Parent category not found',
            });
          }

          if (parent.level >= 3) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Maximum category hierarchy depth is 3 levels',
            });
          }
        }

        // Calculate level based on parent
        const level = input.parentId ?
          await hierarchyService.calculateCategoryLevel(input.parentId, shopId) : 1;

        const category = await expenseCategoryRepo.create({
          ...input,
          shopId,
          level,
        });

        return category;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        // Handle unique constraint violations
        if (error instanceof Error && error.message.includes('unique')) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Category code already exists in this shop',
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create expense category',
        });
      }
    }),

  updateExpenseCategory: adminProcedure
    .input(expenseCategoryUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx;
      const shopId = session.user.shopId;

      const expenseCategoryRepo = new ExpenseCategoryRepository(prisma);
      const hierarchyService = new CategoryHierarchyService(prisma);

      try {
        // Check if category exists and belongs to shop
        const existingCategory = await expenseCategoryRepo.findById(input.id, shopId);
        if (!existingCategory) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found',
          });
        }

        // Validate hierarchy changes
        if (input.parentId && input.parentId !== existingCategory.parentId) {
          const wouldCreateCircular = await hierarchyService.wouldCreateCircularReference(
            input.id,
            input.parentId,
            shopId
          );

          if (wouldCreateCircular) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'This would create a circular reference',
            });
          }
        }

        const updatedCategory = await expenseCategoryRepo.update(input.id, shopId, input);
        return updatedCategory;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update expense category',
        });
      }
    }),

  deleteExpenseCategory: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx;
      const shopId = session.user.shopId;

      const expenseCategoryRepo = new ExpenseCategoryRepository(prisma);

      try {
        const category = await expenseCategoryRepo.findById(input.id, shopId);
        if (!category) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found',
          });
        }

        if (category.isSystemCategory) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'System categories cannot be deleted',
          });
        }

        // Check if category has children
        const hasChildren = await expenseCategoryRepo.hasChildren(input.id, shopId);
        if (hasChildren) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot delete category with subcategories',
          });
        }

        await expenseCategoryRepo.delete(input.id, shopId);
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete expense category',
        });
      }
    }),

  toggleCategoryStatus: adminProcedure
    .input(toggleCategoryStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx;
      const shopId = session.user.shopId;

      const expenseCategoryRepo = new ExpenseCategoryRepository(prisma);

      try {
        const category = await expenseCategoryRepo.findById(input.id, shopId);
        if (!category) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found',
          });
        }

        if (category.isSystemCategory && !input.isActive) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'System categories cannot be deactivated',
          });
        }

        const updatedCategory = await expenseCategoryRepo.update(
          input.id,
          shopId,
          { isActive: input.isActive }
        );

        return updatedCategory;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to toggle category status',
        });
      }
    }),

  bulkImportCategories: adminProcedure
    .input(bulkCategoryImportSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx;
      const shopId = session.user.shopId;

      const expenseCategoryRepo = new ExpenseCategoryRepository(prisma);
      const hierarchyService = new CategoryHierarchyService(prisma);

      try {
        const result = await hierarchyService.bulkImportCategories(
          input.categories,
          shopId
        );

        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to import categories',
        });
      }
    }),

  getExpenseCategories: protectedProcedure
    .input(expenseCategorySearchSchema.optional())
    .query(async ({ ctx, input }) => {
      const { session, prisma } = ctx;
      const shopId = session.user.shopId;

      const expenseCategoryRepo = new ExpenseCategoryRepository(prisma);

      try {
        const categories = await expenseCategoryRepo.findAllByShop(shopId, input);
        return categories;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch expense categories',
        });
      }
    }),

  getCategoryTree: protectedProcedure
    .query(async ({ ctx }) => {
      const { session, prisma } = ctx;
      const shopId = session.user.shopId;

      const hierarchyService = new CategoryHierarchyService(prisma);

      try {
        const categoryTree = await hierarchyService.buildCategoryTree(shopId);
        return categoryTree;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch category tree',
        });
      }
    }),

  assignCategoryToAccount: adminProcedure
    .input(categoryAssignmentSchema)
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx;
      const shopId = session.user.shopId;

      const assignmentService = new CategoryAssignmentService(prisma);

      try {
        const assignment = await assignmentService.assignCategoryToAccount(
          input.categoryId,
          input.accountId,
          shopId
        );

        return assignment;
      } catch (error) {
        if (error instanceof Error && error.message.includes('unique')) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Category is already assigned to this account',
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to assign category to account',
        });
      }
    }),

  removeCategoryAssignment: adminProcedure
    .input(z.object({
      categoryId: z.string().uuid(),
      accountId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx;
      const shopId = session.user.shopId;

      const assignmentService = new CategoryAssignmentService(prisma);

      try {
        await assignmentService.removeCategoryAssignment(
          input.categoryId,
          input.accountId,
          shopId
        );

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove category assignment',
        });
      }
    }),

  getCategoryUsageStats: protectedProcedure
    .input(z.object({
      categoryId: z.string().uuid().optional(),
      limit: z.number().optional().default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { session, prisma } = ctx;
      const shopId = session.user.shopId;

      const usageService = new CategoryUsageService(prisma);

      try {
        const stats = await usageService.getCategoryUsageStats(
          shopId,
          input.categoryId,
          input.limit
        );

        return stats;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch category usage statistics',
        });
      }
    }),
});