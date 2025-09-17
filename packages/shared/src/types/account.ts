// Account management types for financial hierarchy

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export interface Account {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  accountType: AccountType;
  level: 1 | 2 | 3; // 1=main, 2=sub, 3=detail
  parentId?: string;
  shopId: string;
  isSystemAccount: boolean;
  isActive: boolean;
  children?: Account[];
  parent?: Account;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountCreateInput {
  code: string;
  nameAr: string;
  nameEn: string;
  accountType: AccountType;
  parentId?: string;
  shopId: string;
}

export interface AccountUpdateInput {
  id: string;
  nameAr?: string;
  nameEn?: string;
  isActive?: boolean;
  parentId?: string;
}

export interface AccountSearchFilters {
  query?: string;
  accountType?: AccountType;
  level?: 1 | 2 | 3;
  isActive?: boolean;
  parentId?: string;
}

export interface AccountTreeNode extends Account {
  children: AccountTreeNode[];
  depth: number;
  hasChildren: boolean;
  isExpanded?: boolean;
}

export interface AccountValidationError {
  field: string;
  message: string;
  code: string;
}

export interface AccountOperationResult {
  success: boolean;
  account?: Account;
  errors?: AccountValidationError[];
}

// Account hierarchy display preferences
export interface AccountDisplaySettings {
  showInactive: boolean;
  expandAll: boolean;
  language: 'ar' | 'en';
  sortBy: 'code' | 'nameAr' | 'nameEn' | 'accountType';
  groupByType: boolean;
}