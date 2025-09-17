import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccountHierarchyTree } from '@/components/features/accounts/AccountHierarchyTree';
import type { AccountTreeNode } from '@erpdesk/shared';

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
        hasChildren: false,
        children: [],
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
    isActive: false,
    depth: 0,
    hasChildren: false,
    children: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

describe('AccountHierarchyTree', () => {
  it('renders account tree with Arabic names by default', () => {
    render(
      <AccountHierarchyTree
        accounts={mockAccounts}
        language="ar"
      />
    );

    expect(screen.getByText('الأصول')).toBeInTheDocument();
    expect(screen.getByText('الخصوم')).toBeInTheDocument();
  });

  it('renders account tree with English names when language is en', () => {
    render(
      <AccountHierarchyTree
        accounts={mockAccounts}
        language="en"
      />
    );

    expect(screen.getByText('Assets')).toBeInTheDocument();
    expect(screen.getByText('Liabilities')).toBeInTheDocument();
  });

  it('displays account codes correctly', () => {
    render(
      <AccountHierarchyTree
        accounts={mockAccounts}
        language="ar"
      />
    );

    expect(screen.getByText('(ASSETS)')).toBeInTheDocument();
    expect(screen.getByText('(LIABILITIES)')).toBeInTheDocument();
  });

  it('shows system account indicators', () => {
    render(
      <AccountHierarchyTree
        accounts={mockAccounts}
        language="ar"
      />
    );

    const systemBadges = screen.getAllByText('نظام');
    expect(systemBadges).toHaveLength(2);
  });

  it('shows inactive account indicators', () => {
    render(
      <AccountHierarchyTree
        accounts={mockAccounts}
        language="ar"
        showInactive={true}
      />
    );

    expect(screen.getByText('غير نشط')).toBeInTheDocument();
  });

  it('hides inactive accounts when showInactive is false', () => {
    render(
      <AccountHierarchyTree
        accounts={mockAccounts}
        language="ar"
        showInactive={false}
      />
    );

    expect(screen.queryByText('الخصوم')).not.toBeInTheDocument();
  });

  it('calls onAccountSelect when account is clicked', () => {
    const onAccountSelect = vi.fn();

    render(
      <AccountHierarchyTree
        accounts={mockAccounts}
        language="ar"
        onAccountSelect={onAccountSelect}
      />
    );

    fireEvent.click(screen.getByText('الأصول'));
    expect(onAccountSelect).toHaveBeenCalledWith(mockAccounts[0]);
  });

  it('highlights selected account', () => {
    render(
      <AccountHierarchyTree
        accounts={mockAccounts}
        language="ar"
        selectedAccountId="1"
      />
    );

    const selectedElement = screen.getByText('الأصول').closest('div');
    expect(selectedElement).toHaveClass('bg-primary/10');
  });

  it('expands and collapses account children', () => {
    render(
      <AccountHierarchyTree
        accounts={mockAccounts}
        language="ar"
      />
    );

    // Initially expanded, should show child
    expect(screen.getByText('الأصول المتداولة')).toBeInTheDocument();

    // Find and click the collapse button
    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);

    // Child should be hidden after collapse
    expect(screen.queryByText('الأصول المتداولة')).not.toBeInTheDocument();
  });

  it('highlights search matches', () => {
    render(
      <AccountHierarchyTree
        accounts={mockAccounts}
        language="ar"
        searchQuery="أصول"
      />
    );

    const highlightedText = screen.getByText('أصول');
    expect(highlightedText.tagName).toBe('MARK');
  });

  it('displays account type badges correctly', () => {
    render(
      <AccountHierarchyTree
        accounts={mockAccounts}
        language="ar"
      />
    );

    expect(screen.getByText('أصول')).toBeInTheDocument();
    expect(screen.getByText('خصوم')).toBeInTheDocument();
  });

  it('shows level indicators', () => {
    render(
      <AccountHierarchyTree
        accounts={mockAccounts}
        language="ar"
      />
    );

    expect(screen.getAllByText('المستوى 1')).toHaveLength(2);
    expect(screen.getByText('المستوى 2')).toBeInTheDocument();
  });

  it('displays no accounts message when list is empty', () => {
    render(
      <AccountHierarchyTree
        accounts={[]}
        language="ar"
      />
    );

    expect(screen.getByText('لا توجد حسابات متاحة')).toBeInTheDocument();
  });

  it('displays no search results message when filtered list is empty', () => {
    render(
      <AccountHierarchyTree
        accounts={mockAccounts}
        language="ar"
        searchQuery="nonexistent"
      />
    );

    expect(screen.getByText('جرب مصطلح بحث مختلف')).toBeInTheDocument();
  });

  it('applies proper RTL styling for Arabic', () => {
    const { container } = render(
      <AccountHierarchyTree
        accounts={mockAccounts}
        language="ar"
      />
    );

    // Check if proper indentation is applied for Arabic (right padding)
    const treeItems = container.querySelectorAll('[style*="paddingRight"]');
    expect(treeItems.length).toBeGreaterThan(0);
  });

  it('applies proper LTR styling for English', () => {
    const { container } = render(
      <AccountHierarchyTree
        accounts={mockAccounts}
        language="en"
      />
    );

    // Check if proper indentation is applied for English (left padding)
    const treeItems = container.querySelectorAll('[style*="paddingLeft"]');
    expect(treeItems.length).toBeGreaterThan(0);
  });

  it('expands all accounts when expandAll is true', () => {
    render(
      <AccountHierarchyTree
        accounts={mockAccounts}
        language="ar"
        expandAll={true}
      />
    );

    // All children should be visible
    expect(screen.getByText('الأصول المتداولة')).toBeInTheDocument();
  });

  it('handles keyboard navigation properly', () => {
    render(
      <AccountHierarchyTree
        accounts={mockAccounts}
        language="ar"
      />
    );

    const expandButton = screen.getByRole('button');

    // Test Enter key
    fireEvent.keyDown(expandButton, { key: 'Enter', code: 'Enter' });

    // Test Space key
    fireEvent.keyDown(expandButton, { key: ' ', code: 'Space' });

    // Component should handle keyboard events without errors
    expect(expandButton).toBeInTheDocument();
  });
});