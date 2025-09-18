import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../../../../src/components/features/dashboard/EmptyState';
import { useAuthStore } from '../../../../src/stores/auth-store';

// Mock dependencies
vi.mock('../../../../src/stores/auth-store');
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockUseAuthStore = vi.mocked(useAuthStore);

describe('EmptyState', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuthStore.mockReturnValue({
      language: 'en',
      user: null,
      isLoading: false,
      error: null,
      setUser: vi.fn(),
      setLanguage: vi.fn(),
      reset: vi.fn(),
    });
  });

  it('renders empty state message correctly', () => {
    render(<EmptyState />);

    expect(screen.getByText('Daily Transactions')).toBeInTheDocument();
    expect(screen.getByText('No transactions for this date')).toBeInTheDocument();
    expect(screen.getByText(/No financial transactions have been recorded/)).toBeInTheDocument();
  });

  it('has add transaction button', () => {
    render(<EmptyState />);

    const addButton = screen.getByRole('button', { name: /Add Transaction/i });
    expect(addButton).toBeInTheDocument();
  });

  it('calls onAddTransaction when add button is clicked', () => {
    const mockOnAddTransaction = vi.fn();
    render(<EmptyState onAddTransaction={mockOnAddTransaction} />);

    const addButton = screen.getByRole('button', { name: /Add Transaction/i });
    fireEvent.click(addButton);

    expect(mockOnAddTransaction).toHaveBeenCalled();
  });

  it('logs to console when no callback provided', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    render(<EmptyState />);

    const addButton = screen.getByRole('button', { name: /Add Transaction/i });
    fireEvent.click(addButton);

    expect(consoleSpy).toHaveBeenCalledWith('Add new transaction');
  });

  it('renders in Arabic correctly', () => {
    mockUseAuthStore.mockReturnValue({
      language: 'ar',
      user: null,
      isLoading: false,
      error: null,
      setUser: vi.fn(),
      setLanguage: vi.fn(),
      reset: vi.fn(),
    });

    render(<EmptyState />);

    expect(screen.getByText('المعاملات اليومية')).toBeInTheDocument();
    expect(screen.getByText('لا توجد معاملات لهذا اليوم')).toBeInTheDocument();
    expect(screen.getByText(/لم يتم تسجيل أي معاملات مالية/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /إضافة معاملة/i })).toBeInTheDocument();
  });

  it('displays transaction type color legend', () => {
    render(<EmptyState />);

    expect(screen.getByText('Sales - Green')).toBeInTheDocument();
    expect(screen.getByText('Purchases - Red')).toBeInTheDocument();
    expect(screen.getByText('Expenses - Orange')).toBeInTheDocument();
    expect(screen.getByText('Transfer - Blue')).toBeInTheDocument();
  });

  it('displays transaction type icons', () => {
    render(<EmptyState />);

    // Should have SVG icons for each transaction type
    const svgElements = screen.getAllByRole('img', { hidden: true });
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it('has proper styling and layout', () => {
    render(<EmptyState />);

    const container = screen.getByText('No transactions for this date').closest('div');
    expect(container).toHaveClass('text-center');
  });

  it('shows helpful illustration', () => {
    render(<EmptyState />);

    // Should have the main illustration/icon
    const illustration = screen.getByText('No transactions for this date')
      .closest('div')
      ?.querySelector('svg');
    expect(illustration).toBeInTheDocument();
  });

  it('provides clear call to action', () => {
    render(<EmptyState />);

    const description = screen.getByText(/No financial transactions have been recorded/);
    expect(description).toBeInTheDocument();

    const addButton = screen.getByRole('button', { name: /Add Transaction/i });
    expect(addButton).toHaveClass('bg-blue-600');
  });
});