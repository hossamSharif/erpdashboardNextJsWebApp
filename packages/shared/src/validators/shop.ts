import { z } from 'zod';
import { SHOP_CONSTANTS } from '../types/shop';

export const createShopSchema = z.object({
  nameAr: z
    .string()
    .min(SHOP_CONSTANTS.NAME.MIN_LENGTH, 'Arabic name is required')
    .max(SHOP_CONSTANTS.NAME.MAX_LENGTH, 'Arabic name is too long')
    .trim(),
  nameEn: z
    .string()
    .min(SHOP_CONSTANTS.NAME.MIN_LENGTH, 'English name is required')
    .max(SHOP_CONSTANTS.NAME.MAX_LENGTH, 'English name is too long')
    .trim(),
  code: z
    .string()
    .min(SHOP_CONSTANTS.CODE.MIN_LENGTH, 'Shop code is required')
    .max(SHOP_CONSTANTS.CODE.MAX_LENGTH, 'Shop code is too long')
    .regex(SHOP_CONSTANTS.CODE.PATTERN, 'Shop code must contain only uppercase letters, numbers, underscores and hyphens')
    .transform(val => val.toUpperCase()),
  assignedUserIds: z.array(z.string().uuid()).optional()
});

export const updateShopSchema = z.object({
  id: z.string().uuid(),
  nameAr: z
    .string()
    .min(SHOP_CONSTANTS.NAME.MIN_LENGTH)
    .max(SHOP_CONSTANTS.NAME.MAX_LENGTH)
    .trim()
    .optional(),
  nameEn: z
    .string()
    .min(SHOP_CONSTANTS.NAME.MIN_LENGTH)
    .max(SHOP_CONSTANTS.NAME.MAX_LENGTH)
    .trim()
    .optional(),
  code: z
    .string()
    .min(SHOP_CONSTANTS.CODE.MIN_LENGTH)
    .max(SHOP_CONSTANTS.CODE.MAX_LENGTH)
    .regex(SHOP_CONSTANTS.CODE.PATTERN)
    .transform(val => val.toUpperCase())
    .optional(),
  isActive: z.boolean().optional()
});

export const shopIdSchema = z.object({
  id: z.string().uuid()
});

export const shopListSchema = z.object({
  search: z.string().optional(),
  includeInactive: z.boolean().default(false),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0)
});

export type CreateShopInput = z.infer<typeof createShopSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
export type ShopIdInput = z.infer<typeof shopIdSchema>;
export type ShopListInput = z.infer<typeof shopListSchema>;