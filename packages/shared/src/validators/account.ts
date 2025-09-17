import { z } from 'zod';
import { AccountType } from '../types/account';

// Account validation schemas
export const accountTypeSchema = z.nativeEnum(AccountType);

export const accountCreateSchema = z.object({
  code: z.string()
    .min(1, 'Account code is required')
    .max(20, 'Account code must be 20 characters or less')
    .regex(/^[A-Z0-9-]+$/, 'Account code must contain only uppercase letters, numbers, and hyphens'),
  nameAr: z.string()
    .min(1, 'Arabic name is required')
    .max(100, 'Arabic name must be 100 characters or less'),
  nameEn: z.string()
    .min(1, 'English name is required')
    .max(100, 'English name must be 100 characters or less'),
  accountType: accountTypeSchema,
  parentId: z.string().uuid().optional(),
  shopId: z.string().uuid('Valid shop ID is required'),
});

export const accountUpdateSchema = z.object({
  id: z.string().uuid('Valid account ID is required'),
  nameAr: z.string()
    .min(1, 'Arabic name is required')
    .max(100, 'Arabic name must be 100 characters or less')
    .optional(),
  nameEn: z.string()
    .min(1, 'English name is required')
    .max(100, 'English name must be 100 characters or less')
    .optional(),
  isActive: z.boolean().optional(),
  parentId: z.string().uuid().optional(),
});

export const accountSearchSchema = z.object({
  query: z.string().optional(),
  accountType: accountTypeSchema.optional(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  isActive: z.boolean().optional(),
  parentId: z.string().uuid().optional(),
});

// Account hierarchy validation
export const validateAccountHierarchy = (
  accounts: Array<{ id: string; parentId?: string }>,
  newParentId?: string,
  accountId?: string
): { isValid: boolean; error?: string } => {
  if (!newParentId) return { isValid: true };

  // Prevent self-reference
  if (accountId && newParentId === accountId) {
    return { isValid: false, error: 'Account cannot be its own parent' };
  }

  // Check for circular references
  const checkCircular = (currentId: string, targetId: string, visited = new Set()): boolean => {
    if (visited.has(currentId)) return true;
    if (currentId === targetId) return true;

    visited.add(currentId);
    const parent = accounts.find(acc => acc.id === currentId)?.parentId;
    if (!parent) return false;

    return checkCircular(parent, targetId, visited);
  };

  if (accountId && checkCircular(newParentId, accountId)) {
    return { isValid: false, error: 'This would create a circular reference' };
  }

  return { isValid: true };
};

// Account level validation
export const validateAccountLevel = (
  parentAccount?: { level: number },
  newLevel?: number
): { isValid: boolean; error?: string } => {
  if (!parentAccount) {
    // Root level account must be level 1
    if (newLevel && newLevel !== 1) {
      return { isValid: false, error: 'Root accounts must be level 1' };
    }
    return { isValid: true };
  }

  const expectedLevel = parentAccount.level + 1;
  if (newLevel && newLevel !== expectedLevel) {
    return {
      isValid: false,
      error: `Account level must be ${expectedLevel} for this parent`
    };
  }

  if (expectedLevel > 3) {
    return { isValid: false, error: 'Maximum account hierarchy depth is 3 levels' };
  }

  return { isValid: true };
};

// Export all schemas for tRPC integration
export type AccountCreateInput = z.infer<typeof accountCreateSchema>;
export type AccountUpdateInput = z.infer<typeof accountUpdateSchema>;
export type AccountSearchFilters = z.infer<typeof accountSearchSchema>;