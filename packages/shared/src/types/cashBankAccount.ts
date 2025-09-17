import type { Decimal } from 'decimal.js';

export enum AccountCategory {
  CASH = 'CASH',
  BANK = 'BANK',
}

export interface CashAccount {
  id: string;
  nameAr: string;
  nameEn: string;
  shopId: string;
  openingBalance: Decimal | string | number;
  currentBalance: Decimal | string | number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BankAccount {
  id: string;
  nameAr: string;
  nameEn: string;
  accountNumber: string;
  bankName: string;
  iban?: string | null;
  shopId: string;
  openingBalance: Decimal | string | number;
  currentBalance: Decimal | string | number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BalanceHistory {
  id: string;
  accountType: AccountCategory;
  accountId: string;
  previousBalance: Decimal | string | number;
  newBalance: Decimal | string | number;
  changeAmount: Decimal | string | number;
  changeReason: string;
  userId: string;
  shopId: string;
  createdAt: Date | string;
}

export interface CreateCashAccountInput {
  nameAr: string;
  nameEn: string;
  openingBalance: number;
  isDefault?: boolean;
}

export interface CreateBankAccountInput {
  nameAr: string;
  nameEn: string;
  accountNumber: string;
  bankName: string;
  iban?: string;
  openingBalance: number;
  isDefault?: boolean;
}

export interface UpdateAccountBalanceInput {
  accountId: string;
  accountType: AccountCategory;
  newBalance: number;
  changeReason: string;
}

export interface SetDefaultPaymentAccountInput {
  accountId: string;
  accountType: AccountCategory;
}