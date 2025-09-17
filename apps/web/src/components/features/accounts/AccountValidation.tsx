'use client';

import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import type { Account, AccountTreeNode } from '@erpdesk/shared';
import { validateAccountHierarchy, validateAccountLevel } from '@erpdesk/shared';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AccountValidationProps {
  accounts: Account[] | AccountTreeNode[];
  currentAccount?: Account;
  newParentId?: string;
  language?: 'ar' | 'en';
  className?: string;
}

interface ValidationIssueProps {
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  details?: string;
  language: 'ar' | 'en';
}

function ValidationIssue({ type, message, details, language }: ValidationIssueProps) {
  const icons = {
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle,
  };

  const colors = {
    error: 'text-destructive',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
    success: 'text-green-600',
  };

  const backgrounds = {
    error: 'bg-destructive/10 border-destructive/20',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
  };

  const Icon = icons[type];

  return (
    <div className={cn('p-3 border rounded-lg', backgrounds[type])}>
      <div className="flex items-start gap-2">
        <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', colors[type])} />
        <div className="flex-1 space-y-1">
          <p className={cn('text-sm font-medium', colors[type])}>
            {message}
          </p>
          {details && (
            <p className="text-sm text-muted-foreground">
              {details}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function AccountValidation({
  accounts,
  currentAccount,
  newParentId,
  language = 'ar',
  className,
}: AccountValidationProps) {
  // Convert to simple account format for validation
  const simpleAccounts = useMemo(() => {
    return accounts.map(acc => ({
      id: acc.id,
      parentId: acc.parentId,
      level: acc.level,
    }));
  }, [accounts]);

  // Perform hierarchy validation
  const hierarchyValidation = useMemo(() => {
    if (!newParentId && !currentAccount) {
      return { isValid: true };
    }

    return validateAccountHierarchy(
      simpleAccounts,
      newParentId,
      currentAccount?.id
    );
  }, [simpleAccounts, newParentId, currentAccount]);

  // Perform level validation
  const levelValidation = useMemo(() => {
    if (!newParentId) {
      return validateAccountLevel(undefined, 1);
    }

    const parentAccount = accounts.find(acc => acc.id === newParentId);
    if (!parentAccount) {
      return { isValid: false, error: 'Parent account not found' };
    }

    return validateAccountLevel(
      { level: parentAccount.level },
      parentAccount.level + 1
    );
  }, [accounts, newParentId]);

  // Check for potential circular references in the entire tree
  const circularReferenceCheck = useMemo(() => {
    const issues: string[] = [];

    const checkCircular = (accountId: string, visited = new Set<string>()): boolean => {
      if (visited.has(accountId)) {
        return true; // Circular reference found
      }

      visited.add(accountId);
      const account = simpleAccounts.find(acc => acc.id === accountId);

      if (account?.parentId) {
        return checkCircular(account.parentId, visited);
      }

      return false;
    };

    // Check all accounts for circular references
    simpleAccounts.forEach(account => {
      if (account.parentId && checkCircular(account.id)) {
        const accountDetails = accounts.find(acc => acc.id === account.id);
        const accountName = accountDetails ?
          (language === 'ar' ? accountDetails.nameAr : accountDetails.nameEn) :
          account.id;

        issues.push(
          language === 'ar'
            ? `تم العثور على مرجع دائري في الحساب: ${accountName}`
            : `Circular reference found in account: ${accountName}`
        );
      }
    });

    return issues;
  }, [simpleAccounts, accounts, language]);

  // Check for orphaned accounts (accounts with non-existent parents)
  const orphanedAccountsCheck = useMemo(() => {
    const orphans: string[] = [];

    simpleAccounts.forEach(account => {
      if (account.parentId) {
        const parentExists = simpleAccounts.some(acc => acc.id === account.parentId);
        if (!parentExists) {
          const accountDetails = accounts.find(acc => acc.id === account.id);
          const accountName = accountDetails ?
            (language === 'ar' ? accountDetails.nameAr : accountDetails.nameEn) :
            account.id;

          orphans.push(
            language === 'ar'
              ? `الحساب ${accountName} يشير إلى حساب رئيسي غير موجود`
              : `Account ${accountName} references non-existent parent`
          );
        }
      }
    });

    return orphans;
  }, [simpleAccounts, accounts, language]);

  // Check for level inconsistencies
  const levelInconsistencies = useMemo(() => {
    const issues: string[] = [];

    simpleAccounts.forEach(account => {
      if (account.parentId) {
        const parent = simpleAccounts.find(acc => acc.id === account.parentId);
        if (parent) {
          const expectedLevel = parent.level + 1;
          if (account.level !== expectedLevel) {
            const accountDetails = accounts.find(acc => acc.id === account.id);
            const accountName = accountDetails ?
              (language === 'ar' ? accountDetails.nameAr : accountDetails.nameEn) :
              account.id;

            issues.push(
              language === 'ar'
                ? `مستوى الحساب ${accountName} غير صحيح. متوقع: ${expectedLevel}, فعلي: ${account.level}`
                : `Account ${accountName} has incorrect level. Expected: ${expectedLevel}, Actual: ${account.level}`
            );
          }
        }
      } else if (account.level !== 1) {
        const accountDetails = accounts.find(acc => acc.id === account.id);
        const accountName = accountDetails ?
          (language === 'ar' ? accountDetails.nameAr : accountDetails.nameEn) :
          account.id;

        issues.push(
          language === 'ar'
            ? `الحساب الجذر ${accountName} يجب أن يكون في المستوى 1`
            : `Root account ${accountName} must be at level 1`
        );
      }
    });

    return issues;
  }, [simpleAccounts, accounts, language]);

  const hasIssues = !hierarchyValidation.isValid ||
                   !levelValidation.isValid ||
                   circularReferenceCheck.length > 0 ||
                   orphanedAccountsCheck.length > 0 ||
                   levelInconsistencies.length > 0;

  if (!hasIssues && !newParentId && !currentAccount) {
    return (
      <div className={cn('space-y-2', className)}>
        <ValidationIssue
          type="success"
          message={
            language === 'ar'
              ? 'جميع الحسابات صحيحة'
              : 'All accounts are valid'
          }
          details={
            language === 'ar'
              ? 'لا توجد مشاكل في التسلسل الهرمي للحسابات'
              : 'No issues found in account hierarchy'
          }
          language={language}
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Hierarchy validation errors */}
      {!hierarchyValidation.isValid && hierarchyValidation.error && (
        <ValidationIssue
          type="error"
          message={
            language === 'ar'
              ? 'خطأ في التسلسل الهرمي'
              : 'Hierarchy Error'
          }
          details={hierarchyValidation.error}
          language={language}
        />
      )}

      {/* Level validation errors */}
      {!levelValidation.isValid && levelValidation.error && (
        <ValidationIssue
          type="error"
          message={
            language === 'ar'
              ? 'خطأ في مستوى الحساب'
              : 'Account Level Error'
          }
          details={levelValidation.error}
          language={language}
        />
      )}

      {/* Circular reference issues */}
      {circularReferenceCheck.map((issue, index) => (
        <ValidationIssue
          key={`circular-${index}`}
          type="error"
          message={
            language === 'ar'
              ? 'مرجع دائري'
              : 'Circular Reference'
          }
          details={issue}
          language={language}
        />
      ))}

      {/* Orphaned accounts */}
      {orphanedAccountsCheck.map((issue, index) => (
        <ValidationIssue
          key={`orphan-${index}`}
          type="warning"
          message={
            language === 'ar'
              ? 'حساب يتيم'
              : 'Orphaned Account'
          }
          details={issue}
          language={language}
        />
      ))}

      {/* Level inconsistencies */}
      {levelInconsistencies.map((issue, index) => (
        <ValidationIssue
          key={`level-${index}`}
          type="warning"
          message={
            language === 'ar'
              ? 'تضارب في المستوى'
              : 'Level Inconsistency'
          }
          details={issue}
          language={language}
        />
      ))}

      {/* Success message for valid changes */}
      {hierarchyValidation.isValid && levelValidation.isValid && newParentId && (
        <ValidationIssue
          type="success"
          message={
            language === 'ar'
              ? 'التغيير المقترح صحيح'
              : 'Proposed change is valid'
          }
          details={
            language === 'ar'
              ? 'يمكن تطبيق هذا التغيير بأمان'
              : 'This change can be applied safely'
          }
          language={language}
        />
      )}
    </div>
  );
}

// Hook for using validation in forms
export function useAccountValidation(
  accounts: Account[] | AccountTreeNode[],
  currentAccount?: Account,
  newParentId?: string
) {
  const simpleAccounts = useMemo(() => {
    return accounts.map(acc => ({
      id: acc.id,
      parentId: acc.parentId,
    }));
  }, [accounts]);

  const isValid = useMemo(() => {
    const hierarchyResult = validateAccountHierarchy(
      simpleAccounts,
      newParentId,
      currentAccount?.id
    );

    if (!hierarchyResult.isValid) {
      return false;
    }

    if (newParentId) {
      const parentAccount = accounts.find(acc => acc.id === newParentId);
      if (parentAccount) {
        const levelResult = validateAccountLevel(
          { level: parentAccount.level },
          parentAccount.level + 1
        );
        return levelResult.isValid;
      }
    }

    return true;
  }, [simpleAccounts, accounts, currentAccount, newParentId]);

  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    const hierarchyResult = validateAccountHierarchy(
      simpleAccounts,
      newParentId,
      currentAccount?.id
    );

    if (!hierarchyResult.isValid && hierarchyResult.error) {
      errors.push(hierarchyResult.error);
    }

    if (newParentId) {
      const parentAccount = accounts.find(acc => acc.id === newParentId);
      if (parentAccount) {
        const levelResult = validateAccountLevel(
          { level: parentAccount.level },
          parentAccount.level + 1
        );
        if (!levelResult.isValid && levelResult.error) {
          errors.push(levelResult.error);
        }
      }
    }

    return errors;
  }, [simpleAccounts, accounts, currentAccount, newParentId]);

  return {
    isValid,
    errors: validationErrors,
  };
}