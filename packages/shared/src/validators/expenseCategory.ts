import { z } from 'zod';

// Expense category validation schemas
export const expenseCategoryCreateSchema = z.object({
  nameAr: z.string()
    .min(1, 'Arabic name is required')
    .max(100, 'Arabic name must be 100 characters or less'),
  nameEn: z.string()
    .min(1, 'English name is required')
    .max(100, 'English name must be 100 characters or less'),
  code: z.string()
    .min(1, 'Category code is required')
    .max(20, 'Category code must be 20 characters or less')
    .regex(/^[A-Z0-9-_]+$/, 'Category code must contain only uppercase letters, numbers, hyphens, and underscores'),
  parentId: z.string().uuid().optional(),
  shopId: z.string().uuid('Valid shop ID is required'),
  isSystemCategory: z.boolean().optional().default(false),
});

export const expenseCategoryUpdateSchema = z.object({
  id: z.string().uuid('Valid category ID is required'),
  nameAr: z.string()
    .min(1, 'Arabic name is required')
    .max(100, 'Arabic name must be 100 characters or less')
    .optional(),
  nameEn: z.string()
    .min(1, 'English name is required')
    .max(100, 'English name must be 100 characters or less')
    .optional(),
  code: z.string()
    .min(1, 'Category code is required')
    .max(20, 'Category code must be 20 characters or less')
    .regex(/^[A-Z0-9-_]+$/, 'Category code must contain only uppercase letters, numbers, hyphens, and underscores')
    .optional(),
  parentId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

export const expenseCategorySearchSchema = z.object({
  query: z.string().optional(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  isActive: z.boolean().optional(),
  parentId: z.string().uuid().optional(),
  isSystemCategory: z.boolean().optional(),
});

export const categoryAssignmentSchema = z.object({
  categoryId: z.string().uuid('Valid category ID is required'),
  accountId: z.string().uuid('Valid account ID is required'),
  shopId: z.string().uuid('Valid shop ID is required'),
});

export const bulkCategoryImportSchema = z.object({
  categories: z.array(z.object({
    nameAr: z.string().min(1, 'Arabic name is required').max(100),
    nameEn: z.string().min(1, 'English name is required').max(100),
    code: z.string()
      .min(1, 'Category code is required')
      .max(20, 'Category code must be 20 characters or less')
      .regex(/^[A-Z0-9-_]+$/, 'Category code must contain only uppercase letters, numbers, hyphens, and underscores'),
    parentCode: z.string().optional(),
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  })).min(1, 'At least one category is required'),
  shopId: z.string().uuid('Valid shop ID is required'),
});

export const toggleCategoryStatusSchema = z.object({
  id: z.string().uuid('Valid category ID is required'),
  isActive: z.boolean(),
});

// Category hierarchy validation
export const validateCategoryHierarchy = (
  categories: Array<{ id: string; parentId?: string }>,
  newParentId?: string,
  categoryId?: string
): { isValid: boolean; error?: string } => {
  if (!newParentId) return { isValid: true };

  // Prevent self-reference
  if (categoryId && newParentId === categoryId) {
    return { isValid: false, error: 'Category cannot be its own parent' };
  }

  // Check for circular references
  const checkCircular = (currentId: string, targetId: string, visited = new Set()): boolean => {
    if (visited.has(currentId)) return true;
    if (currentId === targetId) return true;

    visited.add(currentId);
    const parent = categories.find(cat => cat.id === currentId)?.parentId;
    if (!parent) return false;

    return checkCircular(parent, targetId, visited);
  };

  if (categoryId && checkCircular(newParentId, categoryId)) {
    return { isValid: false, error: 'This would create a circular reference' };
  }

  return { isValid: true };
};

// Category level validation
export const validateCategoryLevel = (
  parentCategory?: { level: number },
  newLevel?: number
): { isValid: boolean; error?: string } => {
  if (!parentCategory) {
    // Root level category must be level 1
    if (newLevel && newLevel !== 1) {
      return { isValid: false, error: 'Root categories must be level 1' };
    }
    return { isValid: true };
  }

  const expectedLevel = parentCategory.level + 1;
  if (newLevel && newLevel !== expectedLevel) {
    return {
      isValid: false,
      error: `Category level must be ${expectedLevel} for this parent`
    };
  }

  if (expectedLevel > 3) {
    return { isValid: false, error: 'Maximum category hierarchy depth is 3 levels' };
  }

  return { isValid: true };
};

// Validate category code uniqueness within shop
export const validateCategoryCodeUniqueness = (
  existingCategories: Array<{ code: string; id?: string }>,
  newCode: string,
  categoryId?: string
): { isValid: boolean; error?: string } => {
  const duplicate = existingCategories.find(
    cat => cat.code === newCode && cat.id !== categoryId
  );

  if (duplicate) {
    return { isValid: false, error: 'Category code must be unique within the shop' };
  }

  return { isValid: true };
};

// Validate system category deletion/modification
export const validateSystemCategoryOperation = (
  isSystemCategory: boolean,
  operation: 'delete' | 'deactivate' | 'modify'
): { isValid: boolean; error?: string } => {
  if (!isSystemCategory) return { isValid: true };

  switch (operation) {
    case 'delete':
      return { isValid: false, error: 'System categories cannot be deleted' };
    case 'deactivate':
      return { isValid: false, error: 'System categories cannot be deactivated' };
    case 'modify':
      // Allow modification of names but not core properties
      return { isValid: true };
    default:
      return { isValid: true };
  }
};

// Export all schemas for tRPC integration
export type ExpenseCategoryCreateInput = z.infer<typeof expenseCategoryCreateSchema>;
export type ExpenseCategoryUpdateInput = z.infer<typeof expenseCategoryUpdateSchema>;
export type ExpenseCategorySearchFilters = z.infer<typeof expenseCategorySearchSchema>;
export type CategoryAssignmentInput = z.infer<typeof categoryAssignmentSchema>;
export type BulkCategoryImportInput = z.infer<typeof bulkCategoryImportSchema>;
export type ToggleCategoryStatusInput = z.infer<typeof toggleCategoryStatusSchema>;