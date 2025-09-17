import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AccountSearch } from '@/components/features/accounts/AccountSearch';
import type { AccountSearchFilters } from '@erpdesk/shared';

describe('AccountSearch', () => {
  const mockOnSearch = vi.fn();
  const defaultFilters: AccountSearchFilters = {};

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  it('renders search input with Arabic placeholder', () => {
    render(
      <AccountSearch
        onSearch={mockOnSearch}
        filters={defaultFilters}
        language="ar"
      />
    );

    expect(screen.getByPlaceholderText('ابحث عن الحسابات... (اسم، رمز)')).toBeInTheDocument();
  });

  it('renders search input with English placeholder', () => {
    render(
      <AccountSearch
        onSearch={mockOnSearch}
        filters={defaultFilters}
        language="en"
      />
    );

    expect(screen.getByPlaceholderText('Search accounts... (name, code)')).toBeInTheDocument();
  });

  it('calls onSearch with debounced query when typing', async () => {
    render(
      <AccountSearch
        onSearch={mockOnSearch}
        filters={defaultFilters}
        language="ar"
      />
    );

    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'أصول' } });

    // Wait for debounced call
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        query: 'أصول'
      });
    }, { timeout: 500 });
  });

  it('shows clear button when search has value', () => {
    render(
      <AccountSearch
        onSearch={mockOnSearch}
        filters={{ query: 'test' }}
        language="ar"
      />
    );

    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);
    expect(mockOnSearch).toHaveBeenCalledWith({});
  });

  it('shows advanced filters when enabled', () => {
    render(
      <AccountSearch
        onSearch={mockOnSearch}
        filters={defaultFilters}
        language="ar"
        showAdvancedFilters={true}
      />
    );

    expect(screen.getByText('فلاتر متقدمة')).toBeInTheDocument();
  });

  it('toggles advanced filters panel', () => {
    render(
      <AccountSearch
        onSearch={mockOnSearch}
        filters={defaultFilters}
        language="ar"
        showAdvancedFilters={true}
      />
    );

    const filtersButton = screen.getByText('فلاتر متقدمة');
    fireEvent.click(filtersButton);

    expect(screen.getByText('نوع الحساب')).toBeInTheDocument();
    expect(screen.getByText('المستوى')).toBeInTheDocument();
    expect(screen.getByText('الحالة')).toBeInTheDocument();
  });

  it('filters by account type', () => {
    render(
      <AccountSearch
        onSearch={mockOnSearch}
        filters={defaultFilters}
        language="ar"
        showAdvancedFilters={true}
      />
    );

    // Open filters
    fireEvent.click(screen.getByText('فلاتر متقدمة'));

    // Click on ASSET type
    fireEvent.click(screen.getByText('أصول'));

    expect(mockOnSearch).toHaveBeenCalledWith({
      accountType: 'ASSET'
    });
  });

  it('filters by account level', () => {
    render(
      <AccountSearch
        onSearch={mockOnSearch}
        filters={defaultFilters}
        language="ar"
        showAdvancedFilters={true}
      />
    );

    // Open filters
    fireEvent.click(screen.getByText('فلاتر متقدمة'));

    // Click on Level 1
    fireEvent.click(screen.getByText('المستوى الأول'));

    expect(mockOnSearch).toHaveBeenCalledWith({
      level: 1
    });
  });

  it('filters by active status', () => {
    render(
      <AccountSearch
        onSearch={mockOnSearch}
        filters={defaultFilters}
        language="ar"
        showAdvancedFilters={true}
      />
    );

    // Open filters
    fireEvent.click(screen.getByText('فلاتر متقدمة'));

    // Click on Active status
    fireEvent.click(screen.getByText('نشط'));

    expect(mockOnSearch).toHaveBeenCalledWith({
      isActive: true
    });
  });

  it('displays active filter chips', () => {
    const filtersWithValues: AccountSearchFilters = {
      accountType: 'ASSET',
      level: 1,
      isActive: true
    };

    render(
      <AccountSearch
        onSearch={mockOnSearch}
        filters={filtersWithValues}
        language="ar"
      />
    );

    expect(screen.getByText('النوع: أصول')).toBeInTheDocument();
    expect(screen.getByText('المستوى: المستوى الأول')).toBeInTheDocument();
    expect(screen.getByText('الحالة: نشط')).toBeInTheDocument();
  });

  it('removes filter when chip is clicked', () => {
    const filtersWithValues: AccountSearchFilters = {
      accountType: 'ASSET'
    };

    render(
      <AccountSearch
        onSearch={mockOnSearch}
        filters={filtersWithValues}
        language="ar"
      />
    );

    const chipRemoveButton = screen.getByRole('button');
    fireEvent.click(chipRemoveButton);

    expect(mockOnSearch).toHaveBeenCalledWith({});
  });

  it('shows clear all button when filters are active', () => {
    const filtersWithValues: AccountSearchFilters = {
      accountType: 'ASSET',
      level: 1
    };

    render(
      <AccountSearch
        onSearch={mockOnSearch}
        filters={filtersWithValues}
        language="ar"
        showAdvancedFilters={true}
      />
    );

    expect(screen.getByText('مسح الكل')).toBeInTheDocument();

    fireEvent.click(screen.getByText('مسح الكل'));
    expect(mockOnSearch).toHaveBeenCalledWith({});
  });

  it('handles English translations correctly', () => {
    const filtersWithValues: AccountSearchFilters = {
      accountType: 'ASSET',
      level: 1,
      isActive: true
    };

    render(
      <AccountSearch
        onSearch={mockOnSearch}
        filters={filtersWithValues}
        language="en"
      />
    );

    expect(screen.getByText('Type: Assets')).toBeInTheDocument();
    expect(screen.getByText('Level: Level 1')).toBeInTheDocument();
    expect(screen.getByText('Status: Active')).toBeInTheDocument();
  });

  it('toggles filter selection properly', () => {
    render(
      <AccountSearch
        onSearch={mockOnSearch}
        filters={defaultFilters}
        language="ar"
        showAdvancedFilters={true}
      />
    );

    // Open filters
    fireEvent.click(screen.getByText('فلاتر متقدمة'));

    // Click ASSET type
    fireEvent.click(screen.getByText('أصول'));
    expect(mockOnSearch).toHaveBeenCalledWith({ accountType: 'ASSET' });

    // Click ASSET type again to deselect
    mockOnSearch.mockClear();
    fireEvent.click(screen.getByText('أصول'));
    expect(mockOnSearch).toHaveBeenCalledWith({});
  });

  it('applies RTL direction for Arabic search input', () => {
    render(
      <AccountSearch
        onSearch={mockOnSearch}
        filters={defaultFilters}
        language="ar"
      />
    );

    const searchInput = screen.getByRole('textbox');
    expect(searchInput).toHaveAttribute('dir', 'rtl');
  });

  it('applies LTR direction for English search input', () => {
    render(
      <AccountSearch
        onSearch={mockOnSearch}
        filters={defaultFilters}
        language="en"
      />
    );

    const searchInput = screen.getByRole('textbox');
    expect(searchInput).toHaveAttribute('dir', 'ltr');
  });

  it('positions search icon correctly for RTL', () => {
    const { container } = render(
      <AccountSearch
        onSearch={mockOnSearch}
        filters={defaultFilters}
        language="ar"
      />
    );

    const searchIcon = container.querySelector('.right-3');
    expect(searchIcon).toBeInTheDocument();
  });

  it('positions search icon correctly for LTR', () => {
    const { container } = render(
      <AccountSearch
        onSearch={mockOnSearch}
        filters={defaultFilters}
        language="en"
      />
    );

    const searchIcon = container.querySelector('.left-3');
    expect(searchIcon).toBeInTheDocument();
  });

  it('accepts custom placeholder', () => {
    render(
      <AccountSearch
        onSearch={mockOnSearch}
        filters={defaultFilters}
        language="ar"
        placeholder="بحث مخصص"
      />
    );

    expect(screen.getByPlaceholderText('بحث مخصص')).toBeInTheDocument();
  });

  it('handles multiple filter selections', () => {
    render(
      <AccountSearch
        onSearch={mockOnSearch}
        filters={defaultFilters}
        language="ar"
        showAdvancedFilters={true}
      />
    );

    // Open filters
    fireEvent.click(screen.getByText('فلاتر متقدمة'));

    // Select ASSET type
    fireEvent.click(screen.getByText('أصول'));
    expect(mockOnSearch).toHaveBeenLastCalledWith({ accountType: 'ASSET' });

    // Select Level 1 (should merge with existing filters)
    mockOnSearch.mockClear();
    fireEvent.click(screen.getByText('المستوى الأول'));

    // Check if the call includes both filters
    const lastCall = mockOnSearch.mock.calls[mockOnSearch.mock.calls.length - 1];
    expect(lastCall[0]).toEqual({ accountType: 'ASSET', level: 1 });
  });
});