import { z } from 'zod';
import type { Account } from './account';
import type { User } from './auth';

export enum TransactionType {
  SALE = 'SALE',
  PURCHASE = 'PURCHASE',
  PAYMENT = 'PAYMENT',
  RECEIPT = 'RECEIPT',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER',
  OPENING_BALANCE = 'OPENING_BALANCE',
  CLOSING_BALANCE = 'CLOSING_BALANCE'
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK = 'BANK'
}

export interface Transaction {
  id: string;
  transactionType: TransactionType;
  amount: number | string;
  amountPaid?: number | string | null;
  change?: number | string | null;
  description?: string | null;
  notes?: string | null;
  transactionDate: Date | string;
  debitAccountId: string;
  creditAccountId: string;
  debitUserId: string;
  creditUserId: string;
  shopId: string;
  financialYearId: string;
  isSynced: boolean;
  syncedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Populated relationships
  debitAccount?: Account;
  creditAccount?: Account;
  debitUser?: User;
  creditUser?: User;
}

export interface CreateTransactionData {
  transactionType: TransactionType;
  amount: number;
  amountPaid?: number;
  change?: number;
  description?: string;
  notes?: string;
  accountId: string; // Customer/supplier account
  counterAccountId: string; // Cash/Bank account
  paymentMethod: PaymentMethod;
  transactionDate?: Date;
}

export interface SalesTransactionFormData {
  totalAmount: number;
  customerId: string;
  amountPaid: number;
  change: number;
  paymentMethod: PaymentMethod;
  invoiceComment?: string;
}