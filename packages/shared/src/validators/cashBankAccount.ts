import { z } from 'zod';
import { AccountCategory } from '../types/cashBankAccount';

export const createCashAccountSchema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  openingBalance: z.number().refine((val) => !isNaN(val), 'Opening balance must be a valid number'),
  isDefault: z.boolean().optional().default(false),
});

export const createBankAccountSchema = z.object({
  nameAr: z.string().min(1, 'Arabic name is required'),
  nameEn: z.string().min(1, 'English name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  iban: z.string().optional().nullable(),
  openingBalance: z.number().refine((val) => !isNaN(val), 'Opening balance must be a valid number'),
  isDefault: z.boolean().optional().default(false),
});

export const updateAccountBalanceSchema = z.object({
  accountId: z.string().uuid('Invalid account ID'),
  accountType: z.nativeEnum(AccountCategory),
  newBalance: z.number().refine((val) => !isNaN(val), 'Balance must be a valid number'),
  changeReason: z.string().min(1, 'Change reason is required'),
});

export const setDefaultPaymentAccountSchema = z.object({
  accountId: z.string().uuid('Invalid account ID'),
  accountType: z.nativeEnum(AccountCategory),
});

export type CreateCashAccountInput = z.infer<typeof createCashAccountSchema>;
export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>;
export type UpdateAccountBalanceInput = z.infer<typeof updateAccountBalanceSchema>;
export type SetDefaultPaymentAccountInput = z.infer<typeof setDefaultPaymentAccountSchema>;