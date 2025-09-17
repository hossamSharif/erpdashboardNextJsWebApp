import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AccountValidation, useAccountValidation } from '@/components/features/accounts/AccountValidation';
import { renderHook } from '@testing-library/react';
import type { Account } from '@erpdesk/shared';

const mockAccounts: Account[] = [
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
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    code: 'CURRENT-ASSETS',
    nameAr: 'الأصول المتداولة',
    nameEn: 'Current Assets',
    accountType: 'ASSET',
    level: 2,
    parentId: '1',
    shopId: 'shop1',
    isSystemAccount: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    code: 'CASH',
    nameAr: 'النقد',
    nameEn: 'Cash',
    accountType: 'ASSET',
    level: 3,
    parentId: '2',
    shopId: 'shop1',
    isSystemAccount: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

describe('AccountValidation', () => {
  it('shows success message when all accounts are valid', () => {
    render(
      <AccountValidation
        accounts={mockAccounts}
        language="ar"
      />
    );

    expect(screen.getByText('جميع الحسابات صحيحة')).toBeInTheDocument();
    expect(screen.getByText('لا توجد مشاكل في التسلسل الهرمي للحسابات')).toBeInTheDocument();
  });

  it('shows success message in English', () => {
    render(
      <AccountValidation
        accounts={mockAccounts}
        language="en"
      />
    );

    expect(screen.getByText('All accounts are valid')).toBeInTheDocument();
    expect(screen.getByText('No issues found in account hierarchy')).toBeInTheDocument();
  });

  it('shows validation error for circular reference', () => {
    const circularAccounts: Account[] = [
      {
        id: '1',
        code: 'ACC1',
        nameAr: 'حساب 1',
        nameEn: 'Account 1',
        accountType: 'ASSET',
        level: 1,
        parentId: '2',
        shopId: 'shop1',
        isSystemAccount: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        code: 'ACC2',
        nameAr: 'حساب 2',
        nameEn: 'Account 2',
        accountType: 'ASSET',
        level: 2,
        parentId: '1',
        shopId: 'shop1',
        isSystemAccount: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    render(
      <AccountValidation
        accounts={circularAccounts}
        language="ar"
      />
    );

    expect(screen.getByText('مرجع دائري')).toBeInTheDocument();
  });

  it('shows validation error for invalid level hierarchy', () => {
    const invalidLevelAccounts: Account[] = [
      {
        id: '1',
        code: 'PARENT',
        nameAr: 'الحساب الرئيسي',
        nameEn: 'Parent Account',
        accountType: 'ASSET',
        level: 1,
        shopId: 'shop1',
        isSystemAccount: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        code: 'CHILD',
        nameAr: 'الحساب الفرعي',
        nameEn: 'Child Account',
        accountType: 'ASSET',
        level: 3, // Should be level 2
        parentId: '1',
        shopId: 'shop1',
        isSystemAccount: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    render(
      <AccountValidation
        accounts={invalidLevelAccounts}
        language="ar"
      />
    );

    expect(screen.getByText('تضارب في المستوى')).toBeInTheDocument();
  });

  it('shows warning for orphaned accounts', () => {
    const orphanedAccounts: Account[] = [
      {
        id: '1',
        code: 'ORPHAN',
        nameAr: 'حساب يتيم',
        nameEn: 'Orphaned Account',
        accountType: 'ASSET',
        level: 2,
        parentId: 'nonexistent',
        shopId: 'shop1',
        isSystemAccount: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    render(
      <AccountValidation
        accounts={orphanedAccounts}
        language="ar"
      />
    );

    expect(screen.getByText('حساب يتيم')).toBeInTheDocument();
  });

  it('validates proposed parent change successfully', () => {
    render(
      <AccountValidation
        accounts={mockAccounts}
        currentAccount={mockAccounts[2]}
        newParentId="1"
        language="ar"
      />
    );

    expect(screen.getByText('التغيير المقترح صحيح')).toBeInTheDocument();
    expect(screen.getByText('يمكن تطبيق هذا التغيير بأمان')).toBeInTheDocument();
  });

  it('shows error for invalid parent change that would create circular reference', () => {
    render(
      <AccountValidation
        accounts={mockAccounts}
        currentAccount={mockAccounts[0]} // Parent account
        newParentId="3" // Child account
        language="ar"
      />
    );

    expect(screen.getByText('خطأ في التسلسل الهرمي')).toBeInTheDocument();
  });

  it('shows error for parent change that would exceed level limit', () => {
    render(
      <AccountValidation
        accounts={mockAccounts}
        currentAccount={mockAccounts[2]} // Level 3 account
        newParentId="3" // Would make it level 4
        language="ar"
      />
    );

    expect(screen.getByText('خطأ في مستوى الحساب')).toBeInTheDocument();
  });

  it('shows proper icons for different validation types', () => {
    const { container } = render(
      <AccountValidation
        accounts={mockAccounts}
        language="ar"
      />
    );

    // Success icon should be present
    const successIcon = container.querySelector('svg');
    expect(successIcon).toBeInTheDocument();
  });

  it('handles empty accounts array', () => {
    render(
      <AccountValidation
        accounts={[]}
        language="ar"
      />
    );

    expect(screen.getByText('جميع الحسابات صحيحة')).toBeInTheDocument();
  });
});

describe('useAccountValidation', () => {
  it('returns valid when no issues found', () => {
    const { result } = renderHook(() =>
      useAccountValidation(mockAccounts)
    );

    expect(result.current.isValid).toBe(true);
    expect(result.current.errors).toHaveLength(0);
  });

  it('returns invalid for circular reference', () => {
    const { result } = renderHook(() =>
      useAccountValidation(
        mockAccounts,
        mockAccounts[0], // Parent account
        '3' // Child account - would create circular reference
      )
    );

    expect(result.current.isValid).toBe(false);
    expect(result.current.errors.length).toBeGreaterThan(0);
  });

  it('returns invalid for level violation', () => {
    const { result } = renderHook(() =>
      useAccountValidation(
        mockAccounts,
        mockAccounts[2], // Level 3 account
        '3' // Same account as parent - would exceed max level
      )
    );

    expect(result.current.isValid).toBe(false);
    expect(result.current.errors.length).toBeGreaterThan(0);
  });

  it('returns valid for acceptable parent change', () => {
    const { result } = renderHook(() =>
      useAccountValidation(
        mockAccounts,
        mockAccounts[2], // Level 3 account
        '1' // Level 1 account - would make it level 2
      )
    );

    expect(result.current.isValid).toBe(true);
    expect(result.current.errors).toHaveLength(0);
  });

  it('updates validation when dependencies change', () => {
    const { result, rerender } = renderHook(
      ({ accounts, currentAccount, newParentId }) =>
        useAccountValidation(accounts, currentAccount, newParentId),
      {
        initialProps: {
          accounts: mockAccounts,
          currentAccount: mockAccounts[2],
          newParentId: '1'
        }
      }
    );

    expect(result.current.isValid).toBe(true);

    // Change to invalid parent
    rerender({
      accounts: mockAccounts,
      currentAccount: mockAccounts[0],
      newParentId: '3'
    });

    expect(result.current.isValid).toBe(false);
  });

  it('handles undefined current account', () => {
    const { result } = renderHook(() =>
      useAccountValidation(mockAccounts, undefined, '1')
    );

    expect(result.current.isValid).toBe(true);
    expect(result.current.errors).toHaveLength(0);
  });

  it('handles undefined new parent ID', () => {
    const { result } = renderHook(() =>
      useAccountValidation(mockAccounts, mockAccounts[0], undefined)
    );

    expect(result.current.isValid).toBe(true);
    expect(result.current.errors).toHaveLength(0);
  });
});