'use client';

import React, { useState, useMemo } from 'react';
import { Plus, RefreshCw, Search, ExpandAll, CollapseAll, Settings, ChevronLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/ui/page-header';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

import {
  AccountHierarchyTree,
  AccountSearch,
  AccountManagementForm,
  AccountValidation,
} from '@/components/features/accounts';

import type {
  Account,
  AccountTreeNode,
  AccountSearchFilters,
  AccountCreateInput,
  AccountUpdateInput,
} from '@erpdesk/shared';

// Mock data for demonstration - replace with actual tRPC calls
const mockAccounts: AccountTreeNode[] = [
  {
    id: '1',
    code: 'ASSETS',
    nameAr: 'الأصول',
    nameEn: 'Assets',
    accountType: 'ASSET',
    level: 1,
    shopId: 'shop1',
    isSystemAccount: true,
    isActive: true,
    depth: 0,
    hasChildren: true,
    isExpanded: true,
    children: [
      {
        id: '1.1',
        code: 'CURRENT-ASSETS',
        nameAr: 'الأصول المتداولة',
        nameEn: 'Current Assets',
        accountType: 'ASSET',
        level: 2,
        parentId: '1',
        shopId: 'shop1',
        isSystemAccount: true,
        isActive: true,
        depth: 1,
        hasChildren: true,
        isExpanded: false,
        children: [
          {
            id: '1.1.1',
            code: 'CASH',
            nameAr: 'النقد',
            nameEn: 'Cash',
            accountType: 'ASSET',
            level: 3,
            parentId: '1.1',
            shopId: 'shop1',
            isSystemAccount: false,
            isActive: true,
            depth: 2,
            hasChildren: false,
            children: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    code: 'LIABILITIES',
    nameAr: 'الخصوم',
    nameEn: 'Liabilities',
    accountType: 'LIABILITY',
    level: 1,
    shopId: 'shop1',
    isSystemAccount: true,
    isActive: true,
    depth: 0,
    hasChildren: false,
    children: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export default function AccountsPage() {
  const [accounts] = useState<AccountTreeNode[]>(mockAccounts);
  const [selectedAccount, setSelectedAccount] = useState<AccountTreeNode | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showInactive, setShowInactive] = useState(true);
  const [expandAll, setExpandAll] = useState(false);
  const [searchFilters, setSearchFilters] = useState<AccountSearchFilters>({});
  const [language] = useState<'ar' | 'en'>('ar');
  const [isLoading] = useState(false);

  // Mock shop ID - replace with actual shop context
  const shopId = 'shop1';

  // Filter accounts based on search and settings
  const filteredAccounts = useMemo(() => {
    // This would normally be handled by tRPC query parameters
    return accounts;
  }, [accounts, searchFilters, showInactive]);

  // Handle account selection
  const handleAccountSelect = (account: AccountTreeNode) => {
    setSelectedAccount(account);
  };

  // Handle new account creation
  const handleNewAccount = () => {
    setEditingAccount(null);
    setShowForm(true);
  };

  // Handle account editing
  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  // Handle form save
  const handleFormSave = async (data: AccountCreateInput | AccountUpdateInput) => {
    try {
      // Mock API call - replace with tRPC mutation
      console.log('Saving account:', data);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setShowForm(false);
      setEditingAccount(null);

      // Show success message
      // toast.success(language === 'ar' ? 'تم حفظ الحساب بنجاح' : 'Account saved successfully');
    } catch (error) {
      console.error('Failed to save account:', error);
      // toast.error(language === 'ar' ? 'فشل في حفظ الحساب' : 'Failed to save account');
    }
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  // Handle refresh
  const handleRefresh = () => {
    // Mock refresh - replace with tRPC refetch
    console.log('Refreshing accounts...');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <PageHeader>
        <div className="flex items-center justify-between">
          <div>
            <PageHeaderHeading>
              {language === 'ar' ? 'إدارة الحسابات' : 'Account Management'}
            </PageHeaderHeading>
            <PageHeaderDescription>
              {language === 'ar'
                ? 'إدارة التسلسل الهرمي للحسابات وتكوين نظام المحاسبة'
                : 'Manage account hierarchy and configure accounting system'
              }
            </PageHeaderDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={handleNewAccount}>
              <Plus className="h-4 w-4" />
              {language === 'ar' ? 'حساب جديد' : 'New Account'}
            </Button>
          </div>
        </div>
      </PageHeader>

      <Separator />

      {/* Main Content */}
      {showForm ? (
        /* Account Form */
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFormCancel}
            >
              <ChevronLeft className="h-4 w-4" />
              {language === 'ar' ? 'العودة' : 'Back'}
            </Button>
            <h2 className="text-lg font-semibold">
              {editingAccount
                ? (language === 'ar' ? 'تعديل حساب' : 'Edit Account')
                : (language === 'ar' ? 'حساب جديد' : 'New Account')
              }
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AccountManagementForm
                account={editingAccount}
                accounts={accounts}
                onSave={handleFormSave}
                onCancel={handleFormCancel}
                isLoading={isLoading}
                language={language}
                shopId={shopId}
              />
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {language === 'ar' ? 'التحقق من صحة البيانات' : 'Validation'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AccountValidation
                    accounts={accounts}
                    currentAccount={editingAccount || undefined}
                    language={language}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        /* Account List View */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Search & Controls */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  {language === 'ar' ? 'البحث والفلاتر' : 'Search & Filters'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AccountSearch
                  onSearch={setSearchFilters}
                  filters={searchFilters}
                  language={language}
                  showAdvancedFilters={true}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {language === 'ar' ? 'خيارات العرض' : 'Display Options'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Show Inactive Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {language === 'ar' ? 'إظهار غير النشطة' : 'Show Inactive'}
                  </label>
                  <Switch
                    checked={showInactive}
                    onCheckedChange={setShowInactive}
                  />
                </div>

                {/* Expand All Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {language === 'ar' ? 'توسيع الكل' : 'Expand All'}
                  </label>
                  <Switch
                    checked={expandAll}
                    onCheckedChange={setExpandAll}
                  />
                </div>

                <Separator />

                {/* Quick Actions */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setExpandAll(true)}
                  >
                    <ExpandAll className="h-4 w-4" />
                    {language === 'ar' ? 'توسيع الكل' : 'Expand All'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setExpandAll(false)}
                  >
                    <CollapseAll className="h-4 w-4" />
                    {language === 'ar' ? 'طي الكل' : 'Collapse All'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Details */}
            {selectedAccount && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {language === 'ar' ? 'تفاصيل الحساب' : 'Account Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">
                      {language === 'ar' ? 'الرمز' : 'Code'}
                    </label>
                    <p className="text-sm font-medium">{selectedAccount.code}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">
                      {language === 'ar' ? 'الاسم' : 'Name'}
                    </label>
                    <p className="text-sm font-medium">
                      {language === 'ar' ? selectedAccount.nameAr : selectedAccount.nameEn}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">
                      {language === 'ar' ? 'النوع' : 'Type'}
                    </label>
                    <p className="text-sm font-medium">{selectedAccount.accountType}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">
                      {language === 'ar' ? 'المستوى' : 'Level'}
                    </label>
                    <p className="text-sm font-medium">{selectedAccount.level}</p>
                  </div>

                  {!selectedAccount.isSystemAccount && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleEditAccount(selectedAccount)}
                    >
                      {language === 'ar' ? 'تعديل' : 'Edit'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content - Account Tree */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'ar' ? 'التسلسل الهرمي للحسابات' : 'Account Hierarchy'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AccountHierarchyTree
                  accounts={filteredAccounts}
                  onAccountSelect={handleAccountSelect}
                  selectedAccountId={selectedAccount?.id}
                  showInactive={showInactive}
                  language={language}
                  searchQuery={searchFilters.query}
                  expandAll={expandAll}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}