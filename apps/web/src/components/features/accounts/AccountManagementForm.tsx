'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Save, X, AlertCircle, Building2, DollarSign, TrendingUp, Wallet, CreditCard } from 'lucide-react';
import type { Account, AccountCreateInput, AccountUpdateInput, AccountType, AccountTreeNode } from '@multi-shop/shared';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface AccountManagementFormProps {
  account?: Account | null;
  accounts?: AccountTreeNode[];
  onSave: (data: AccountCreateInput | AccountUpdateInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  language?: 'ar' | 'en';
  shopId: string;
  className?: string;
}

interface FormData {
  code: string;
  nameAr: string;
  nameEn: string;
  accountType: AccountType | '';
  parentId?: string;
  isActive: boolean;
}

interface ValidationErrors {
  code?: string;
  nameAr?: string;
  nameEn?: string;
  accountType?: string;
  parentId?: string;
}

const accountTypeOptions = [
  { value: 'ASSET', labelAr: 'أصول', labelEn: 'Assets', icon: Building2 },
  { value: 'LIABILITY', labelAr: 'خصوم', labelEn: 'Liabilities', icon: CreditCard },
  { value: 'EQUITY', labelAr: 'حقوق ملكية', labelEn: 'Equity', icon: DollarSign },
  { value: 'REVENUE', labelAr: 'إيرادات', labelEn: 'Revenue', icon: TrendingUp },
  { value: 'EXPENSE', labelAr: 'مصروفات', labelEn: 'Expenses', icon: Wallet },
] as const;

export function AccountManagementForm({
  account,
  accounts = [],
  onSave,
  onCancel,
  isLoading = false,
  language = 'ar',
  shopId,
  className,
}: AccountManagementFormProps) {
  const [formData, setFormData] = useState<FormData>({
    code: '',
    nameAr: '',
    nameEn: '',
    accountType: '',
    parentId: undefined,
    isActive: true,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  const isEditing = !!account;

  // Initialize form data
  useEffect(() => {
    if (account) {
      setFormData({
        code: account.code,
        nameAr: account.nameAr,
        nameEn: account.nameEn,
        accountType: account.accountType,
        parentId: account.parentId,
        isActive: account.isActive,
      });
    } else {
      setFormData({
        code: '',
        nameAr: '',
        nameEn: '',
        accountType: '',
        parentId: undefined,
        isActive: true,
      });
    }
    setErrors({});
    setIsDirty(false);
  }, [account]);

  // Get available parent accounts (excluding current account and its children)
  const availableParentAccounts = useMemo(() => {
    const flattenAccounts = (accs: AccountTreeNode[]): AccountTreeNode[] => {
      return accs.reduce((flat, acc) => {
        flat.push(acc);
        if (acc.children) {
          flat.push(...flattenAccounts(acc.children));
        }
        return flat;
      }, [] as AccountTreeNode[]);
    };

    const flatAccounts = flattenAccounts(accounts);

    return flatAccounts.filter(acc => {
      // Exclude current account and its children
      if (isEditing && account) {
        if (acc.id === account.id) return false;
        // Check if this account is a child of the current account
        let parent = flatAccounts.find(p => p.id === acc.parentId);
        while (parent) {
          if (parent.id === account.id) return false;
          parent = flatAccounts.find(p => p.id === parent?.parentId);
        }
      }

      // Only show accounts that can have children (levels 1 and 2)
      return acc.level < 3 && acc.isActive;
    });
  }, [accounts, account, isEditing]);

  // Calculate account level based on parent
  const calculatedLevel = useMemo(() => {
    if (!formData.parentId) return 1;
    const parent = availableParentAccounts.find(acc => acc.id === formData.parentId);
    return parent ? parent.level + 1 : 1;
  }, [formData.parentId, availableParentAccounts]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = language === 'ar' ? 'رمز الحساب مطلوب' : 'Account code is required';
    } else if (!/^[A-Z0-9-]+$/.test(formData.code)) {
      newErrors.code = language === 'ar'
        ? 'يجب أن يحتوي رمز الحساب على أحرف كبيرة وأرقام وشرطات فقط'
        : 'Account code must contain only uppercase letters, numbers, and hyphens';
    }

    if (!formData.nameAr.trim()) {
      newErrors.nameAr = language === 'ar' ? 'الاسم العربي مطلوب' : 'Arabic name is required';
    }

    if (!formData.nameEn.trim()) {
      newErrors.nameEn = language === 'ar' ? 'الاسم الإنجليزي مطلوب' : 'English name is required';
    }

    if (!formData.accountType) {
      newErrors.accountType = language === 'ar' ? 'نوع الحساب مطلوب' : 'Account type is required';
    }

    if (calculatedLevel > 3) {
      newErrors.parentId = language === 'ar'
        ? 'لا يمكن أن يتجاوز عمق التسلسل الهرمي 3 مستويات'
        : 'Hierarchy depth cannot exceed 3 levels';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);

    // Clear field-specific error
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || isLoading) return;

    try {
      if (isEditing && account) {
        const updateData: AccountUpdateInput = {
          id: account.id,
          nameAr: formData.nameAr,
          nameEn: formData.nameEn,
          isActive: formData.isActive,
          parentId: formData.parentId,
        };
        await onSave(updateData);
      } else {
        const createData: AccountCreateInput = {
          code: formData.code,
          nameAr: formData.nameAr,
          nameEn: formData.nameEn,
          accountType: formData.accountType as AccountType,
          parentId: formData.parentId,
          shopId,
        };
        await onSave(createData);
      }
    } catch (error) {
      console.error('Failed to save account:', error);
    }
  };

  const selectedAccountType = accountTypeOptions.find(opt => opt.value === formData.accountType);

  return (
    <Card className={cn('w-full max-w-2xl', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {selectedAccountType && <selectedAccountType.icon className="h-5 w-5" />}
          {language === 'ar'
            ? (isEditing ? 'تعديل حساب' : 'إضافة حساب جديد')
            : (isEditing ? 'Edit Account' : 'Add New Account')
          }
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Code - Only for new accounts */}
          {!isEditing && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'ar' ? 'رمز الحساب' : 'Account Code'}
                <span className="text-destructive ml-1">*</span>
              </label>
              <Input
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                placeholder={language === 'ar' ? 'مثال: ACC-001' : 'Example: ACC-001'}
                className={errors.code ? 'border-destructive' : ''}
                dir="ltr"
              />
              {errors.code && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errors.code}
                </div>
              )}
            </div>
          )}

          {/* Arabic Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === 'ar' ? 'الاسم العربي' : 'Arabic Name'}
              <span className="text-destructive ml-1">*</span>
            </label>
            <Input
              value={formData.nameAr}
              onChange={(e) => handleInputChange('nameAr', e.target.value)}
              placeholder={language === 'ar' ? 'أدخل الاسم العربي' : 'Enter Arabic name'}
              className={errors.nameAr ? 'border-destructive' : ''}
              dir="rtl"
            />
            {errors.nameAr && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {errors.nameAr}
              </div>
            )}
          </div>

          {/* English Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === 'ar' ? 'الاسم الإنجليزي' : 'English Name'}
              <span className="text-destructive ml-1">*</span>
            </label>
            <Input
              value={formData.nameEn}
              onChange={(e) => handleInputChange('nameEn', e.target.value)}
              placeholder={language === 'ar' ? 'أدخل الاسم الإنجليزي' : 'Enter English name'}
              className={errors.nameEn ? 'border-destructive' : ''}
              dir="ltr"
            />
            {errors.nameEn && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {errors.nameEn}
              </div>
            )}
          </div>

          {/* Account Type - Only for new accounts */}
          {!isEditing && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'ar' ? 'نوع الحساب' : 'Account Type'}
                <span className="text-destructive ml-1">*</span>
              </label>
              <Select
                value={formData.accountType}
                onValueChange={(value) => handleInputChange('accountType', value)}
              >
                <SelectTrigger className={errors.accountType ? 'border-destructive' : ''}>
                  <SelectValue placeholder={
                    language === 'ar' ? 'اختر نوع الحساب' : 'Select account type'
                  } />
                </SelectTrigger>
                <SelectContent>
                  {accountTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        {language === 'ar' ? option.labelAr : option.labelEn}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.accountType && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errors.accountType}
                </div>
              )}
            </div>
          )}

          {/* Parent Account */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === 'ar' ? 'الحساب الرئيسي' : 'Parent Account'}
            </label>
            <Select
              value={formData.parentId || ''}
              onValueChange={(value) => handleInputChange('parentId', value || undefined)}
            >
              <SelectTrigger className={errors.parentId ? 'border-destructive' : ''}>
                <SelectValue placeholder={
                  language === 'ar' ? 'اختر الحساب الرئيسي (اختياري)' : 'Select parent account (optional)'
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  {language === 'ar' ? 'بدون حساب رئيسي' : 'No parent account'}
                </SelectItem>
                {availableParentAccounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        [{acc.code}]
                      </span>
                      {language === 'ar' ? acc.nameAr : acc.nameEn}
                      <Badge variant="outline" className="text-xs">
                        {language === 'ar' ? `المستوى ${acc.level}` : `Level ${acc.level}`}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.parentId && (
              <div className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {errors.parentId}
              </div>
            )}
            {formData.parentId && (
              <div className="text-sm text-muted-foreground">
                {language === 'ar'
                  ? `سيكون هذا الحساب في المستوى ${calculatedLevel}`
                  : `This account will be at level ${calculatedLevel}`
                }
              </div>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <label className="text-sm font-medium">
                {language === 'ar' ? 'حالة الحساب' : 'Account Status'}
              </label>
              <p className="text-sm text-muted-foreground">
                {language === 'ar'
                  ? 'تحديد ما إذا كان الحساب نشطًا أم لا'
                  : 'Determine whether the account is active or not'
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {formData.isActive
                  ? (language === 'ar' ? 'نشط' : 'Active')
                  : (language === 'ar' ? 'غير نشط' : 'Inactive')
                }
              </span>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
            </div>
          </div>

          {/* System Account Warning */}
          {isEditing && account?.isSystemAccount && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                {language === 'ar'
                  ? 'هذا حساب نظام. بعض الخصائص لا يمكن تعديلها.'
                  : 'This is a system account. Some properties cannot be modified.'
                }
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <Button
              type="submit"
              disabled={!isDirty || isLoading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading
                ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                : (language === 'ar' ? 'حفظ' : 'Save')
              }
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}