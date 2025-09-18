'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Building2, DollarSign, TrendingUp, Wallet, CreditCard } from 'lucide-react';
import type { AccountTreeNode, AccountType } from '@multi-shop/shared';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface AccountHierarchyTreeProps {
  accounts: AccountTreeNode[];
  onAccountSelect?: (account: AccountTreeNode) => void;
  selectedAccountId?: string;
  showInactive?: boolean;
  language?: 'ar' | 'en';
  searchQuery?: string;
  expandAll?: boolean;
  className?: string;
}

interface AccountTreeItemProps {
  account: AccountTreeNode;
  onAccountSelect?: (account: AccountTreeNode) => void;
  selectedAccountId?: string;
  language: 'ar' | 'en';
  searchQuery?: string;
  expandAll?: boolean;
}

// Account type icons mapping
const accountTypeIcons: Record<AccountType, React.ReactNode> = {
  ASSET: <Building2 className="h-4 w-4" />,
  LIABILITY: <CreditCard className="h-4 w-4" />,
  EQUITY: <DollarSign className="h-4 w-4" />,
  REVENUE: <TrendingUp className="h-4 w-4" />,
  EXPENSE: <Wallet className="h-4 w-4" />,
};

// Account type colors for badges
const accountTypeColors: Record<AccountType, string> = {
  ASSET: 'bg-green-100 text-green-800 border-green-200',
  LIABILITY: 'bg-red-100 text-red-800 border-red-200',
  EQUITY: 'bg-blue-100 text-blue-800 border-blue-200',
  REVENUE: 'bg-purple-100 text-purple-800 border-purple-200',
  EXPENSE: 'bg-orange-100 text-orange-800 border-orange-200',
};

// Account type Arabic names
const accountTypeNamesAr: Record<AccountType, string> = {
  ASSET: 'أصول',
  LIABILITY: 'خصوم',
  EQUITY: 'حقوق ملكية',
  REVENUE: 'إيرادات',
  EXPENSE: 'مصروفات',
};

// Account type English names
const accountTypeNamesEn: Record<AccountType, string> = {
  ASSET: 'Assets',
  LIABILITY: 'Liabilities',
  EQUITY: 'Equity',
  REVENUE: 'Revenue',
  EXPENSE: 'Expenses',
};

function AccountTreeItem({
  account,
  onAccountSelect,
  selectedAccountId,
  language,
  searchQuery,
  expandAll = false,
}: AccountTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(expandAll || account.isExpanded || false);

  // Handle expand/collapse
  React.useEffect(() => {
    if (expandAll !== undefined) {
      setIsExpanded(expandAll);
    }
  }, [expandAll]);

  const displayName = language === 'ar' ? account.nameAr : account.nameEn;
  const accountTypeName = language === 'ar'
    ? accountTypeNamesAr[account.accountType]
    : accountTypeNamesEn[account.accountType];

  // Highlight search matches
  const highlightedName = useMemo(() => {
    if (!searchQuery) return displayName;

    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = displayName.split(regex);

    return parts.map((part, index) => (
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 rounded-sm px-1">
          {part}
        </mark>
      ) : part
    ));
  }, [displayName, searchQuery]);

  const isSelected = selectedAccountId === account.id;
  const hasChildren = account.children && account.children.length > 0;

  // Indentation based on depth
  const indentationStyle = {
    [language === 'ar' ? 'paddingRight' : 'paddingLeft']: `${account.depth * 24}px`,
  };

  return (
    <div className="w-full">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div
          className={cn(
            'flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-accent/50',
            isSelected && 'bg-primary/10 border border-primary/20',
            !account.isActive && 'opacity-60'
          )}
          style={indentationStyle}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-transparent"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          )}

          {/* Spacer for accounts without children */}
          {!hasChildren && <div className="w-6" />}

          {/* Account Type Icon */}
          <div className={cn('p-1 rounded', accountTypeColors[account.accountType])}>
            {accountTypeIcons[account.accountType]}
          </div>

          {/* Account Details */}
          <div
            className="flex-1 cursor-pointer"
            onClick={() => onAccountSelect?.(account)}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {highlightedName}
              </span>
              <span className="text-xs text-muted-foreground">
                ({account.code})
              </span>

              {/* System Account Indicator */}
              {account.isSystemAccount && (
                <Badge variant="outline" className="text-xs">
                  {language === 'ar' ? 'نظام' : 'System'}
                </Badge>
              )}

              {/* Inactive Indicator */}
              {!account.isActive && (
                <Badge variant="secondary" className="text-xs">
                  {language === 'ar' ? 'غير نشط' : 'Inactive'}
                </Badge>
              )}
            </div>

            {/* Account Type Badge */}
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className={cn('text-xs', accountTypeColors[account.accountType])}
              >
                {accountTypeName}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {language === 'ar' ? `المستوى ${account.level}` : `Level ${account.level}`}
              </span>
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && (
          <CollapsibleContent className="space-y-1">
            {account.children.map((child) => (
              <AccountTreeItem
                key={child.id}
                account={child}
                onAccountSelect={onAccountSelect}
                selectedAccountId={selectedAccountId}
                language={language}
                searchQuery={searchQuery}
                expandAll={expandAll}
              />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}

export function AccountHierarchyTree({
  accounts,
  onAccountSelect,
  selectedAccountId,
  showInactive = true,
  language = 'ar',
  searchQuery,
  expandAll = false,
  className,
}: AccountHierarchyTreeProps) {
  // Filter accounts based on search and inactive status
  const filteredAccounts = useMemo(() => {
    const filterAccount = (account: AccountTreeNode): AccountTreeNode | null => {
      // Filter inactive accounts if not showing them
      if (!showInactive && !account.isActive) {
        return null;
      }

      // Filter children recursively
      const filteredChildren = account.children
        ?.map(filterAccount)
        .filter(Boolean) as AccountTreeNode[] || [];

      // Check if account matches search query
      const matchesSearch = !searchQuery ||
        account.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.code.toLowerCase().includes(searchQuery.toLowerCase());

      // Include account if it matches search or has matching children
      if (matchesSearch || filteredChildren.length > 0) {
        return {
          ...account,
          children: filteredChildren,
          hasChildren: filteredChildren.length > 0,
        };
      }

      return null;
    };

    return accounts
      .map(filterAccount)
      .filter(Boolean) as AccountTreeNode[];
  }, [accounts, showInactive, searchQuery]);

  if (filteredAccounts.length === 0) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-sm">
          {language === 'ar'
            ? 'لا توجد حسابات متاحة'
            : 'No accounts available'
          }
        </p>
        {searchQuery && (
          <p className="text-xs mt-2">
            {language === 'ar'
              ? 'جرب مصطلح بحث مختلف'
              : 'Try a different search term'
            }
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      {filteredAccounts.map((account) => (
        <AccountTreeItem
          key={account.id}
          account={account}
          onAccountSelect={onAccountSelect}
          selectedAccountId={selectedAccountId}
          language={language}
          searchQuery={searchQuery}
          expandAll={expandAll}
        />
      ))}
    </div>
  );
}