import type { Shop, Transaction } from '@prisma/client';

export interface FinancialYear {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  openingStockValue: number;
  closingStockValue: number | null;
  isCurrent: boolean;
  isClosed: boolean;
  shopId: string;
  createdAt: Date;
  updatedAt: Date;
  // Navigation properties
  shop?: Shop;
  transactions?: Transaction[];
}

export interface FinancialYearWithCounts extends FinancialYear {
  _count: {
    transactions: number;
  };
}

export interface CreateFinancialYearInput {
  name: string;
  startDate: Date;
  endDate: Date;
  openingStockValue: number;
  shopId: string;
}

export interface UpdateFinancialYearInput {
  id: string;
  name?: string;
  startDate?: Date;
  endDate?: Date;
  openingStockValue?: number;
}

export interface CloseFinancialYearInput {
  id: string;
  closingStockValue: number;
}

export interface UpdateOpeningStockValueInput {
  shopId: string;
  financialYearId: string;
  openingStockValue: number;
}

export interface UpdateClosingStockValueInput {
  shopId: string;
  financialYearId: string;
  closingStockValue: number;
}

export interface BulkUpdateStockValuesInput {
  shopId: string;
  financialYearId: string;
  openingStockValue?: number;
  closingStockValue?: number;
}

export interface StockValueHistory {
  id: string;
  financialYearId: string;
  fieldChanged: 'openingStockValue' | 'closingStockValue';
  oldValue: number | null;
  newValue: number;
  changedBy: string;
  changedAt: Date;
  reason?: string;
}

export interface FinancialYearSummary {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  isClosed: boolean;
  transactionCount: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

export const FINANCIAL_YEAR_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  CLOSED: 'closed',
} as const;

export type FinancialYearStatus = typeof FINANCIAL_YEAR_STATUS[keyof typeof FINANCIAL_YEAR_STATUS];