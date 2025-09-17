// Expense category management types for classification hierarchy

export interface ExpenseCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  parentId?: string;
  level: 1 | 2 | 3; // 1=main, 2=sub, 3=detail
  shopId: string;
  isActive: boolean;
  isSystemCategory: boolean;
  children?: ExpenseCategory[];
  parent?: ExpenseCategory;
  accountAssignments?: CategoryAccountAssignment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryAccountAssignment {
  id: string;
  categoryId: string;
  accountId: string;
  shopId: string;
  category?: ExpenseCategory;
  account?: {
    id: string;
    code: string;
    nameAr: string;
    nameEn: string;
  };
  createdAt: Date;
}

export interface ExpenseCategoryCreateInput {
  nameAr: string;
  nameEn: string;
  code: string;
  parentId?: string;
  shopId: string;
  isSystemCategory?: boolean;
}

export interface ExpenseCategoryUpdateInput {
  id: string;
  nameAr?: string;
  nameEn?: string;
  code?: string;
  parentId?: string;
  isActive?: boolean;
}

export interface ExpenseCategorySearchFilters {
  query?: string;
  level?: 1 | 2 | 3;
  isActive?: boolean;
  parentId?: string;
  isSystemCategory?: boolean;
}

export interface ExpenseCategoryTreeNode extends ExpenseCategory {
  children: ExpenseCategoryTreeNode[];
  depth: number;
  hasChildren: boolean;
  isExpanded?: boolean;
  assignedAccountsCount?: number;
}

export interface CategoryValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ExpenseCategoryOperationResult {
  success: boolean;
  category?: ExpenseCategory;
  errors?: CategoryValidationError[];
}

export interface CategoryAssignmentInput {
  categoryId: string;
  accountId: string;
  shopId: string;
}

export interface CategoryAssignmentResult {
  success: boolean;
  assignment?: CategoryAccountAssignment;
  errors?: CategoryValidationError[];
}

export interface BulkCategoryImportInput {
  categories: {
    nameAr: string;
    nameEn: string;
    code: string;
    parentCode?: string;
    level: 1 | 2 | 3;
  }[];
  shopId: string;
}

export interface BulkImportResult {
  success: boolean;
  createdCount: number;
  skippedCount: number;
  errorCount: number;
  categories?: ExpenseCategory[];
  errors?: CategoryValidationError[];
}

export interface CategoryUsageStats {
  categoryId: string;
  category: {
    nameAr: string;
    nameEn: string;
    code: string;
  };
  assignedAccountsCount: number;
  transactionCount: number;
  totalAmount: number;
  lastUsedAt?: Date;
}

// Category hierarchy display preferences
export interface CategoryDisplaySettings {
  showInactive: boolean;
  expandAll: boolean;
  language: 'ar' | 'en';
  sortBy: 'code' | 'nameAr' | 'nameEn' | 'level';
  showSystemCategories: boolean;
  showUsageStats: boolean;
}

// Default system categories template
export interface DefaultCategoryTemplate {
  nameAr: string;
  nameEn: string;
  code: string;
  parentCode?: string;
  level: 1 | 2 | 3;
  isSystemCategory: boolean;
}