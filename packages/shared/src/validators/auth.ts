import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: 'Invalid email format' })
    .min(1, { message: 'Email is required' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(100, { message: 'Password is too long' }),
  shopId: z.string().uuid().optional()
});

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  nameAr: z.string().min(1, { message: 'Arabic name is required' }),
  nameEn: z.string().min(1, { message: 'English name is required' }),
  role: z.enum(['ADMIN', 'USER']),
  shopId: z.string().uuid().nullable(),
  isActive: z.boolean(),
  lastSyncAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const shopSchema = z.object({
  id: z.string().uuid(),
  nameAr: z.string().min(1, { message: 'Arabic shop name is required' }),
  nameEn: z.string().min(1, { message: 'English shop name is required' }),
  ownerId: z.string().uuid(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const authSessionSchema = z.object({
  user: userSchema,
  shop: shopSchema.optional(),
  expiresAt: z.date()
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UserData = z.infer<typeof userSchema>;
export type ShopData = z.infer<typeof shopSchema>;
export type AuthSessionData = z.infer<typeof authSessionSchema>;