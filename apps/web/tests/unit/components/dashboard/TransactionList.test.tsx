import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { TransactionList } from '../../../../src/components/features/dashboard/TransactionList';
import { useAuthStore } from '../../../../src/stores/auth-store';
import { useDashboardStore } from '../../../../src/stores/dashboard-store';
import { trpc } from '../../../../src/utils/trpc';

// Mock dependencies
vi.mock('next-auth/react');
vi.mock('../../../../src/stores/auth-store');
vi.mock('../../../../src/stores/dashboard-store');
vi.mock('../../../../src/utils/trpc');
vi.mock('../../../../src/components/features/dashboard/TransactionActions', () => ({
  TransactionActions: ({ transaction }: { transaction: any }) => (
    <div data-testid={`actions-${transaction.id}`}>Actions</div>
  ),
}));
vi.mock('../../../../src/components/features/dashboard/EmptyState', () => ({
  EmptyState: () => <div data-testid="empty-state">No transactions</div>,
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));
vi.mock('date-fns', () => ({
  format: vi.fn(() => '10:30'),
}));
vi.mock('date-fns/locale', () => ({
  ar: {},
  enUS: {},
}));

const mockUseSession = vi.mocked(useSession);
const mockUseAuthStore = vi.mocked(useAuthStore);
const mockUseDashboardStore = vi.mocked(useDashboardStore);
const mockTrpc = vi.mocked(trpc);

describe('TransactionList', () => {
  const mockSession = {
    user: {
      id: 'user-1',
      email: 'test@example.com',
      shopId: 'shop-1',
      role: 'USER',
      nameAr: 'مستخدم تجريبي',
      nameEn: 'Test User',
      isActive: true,
    },
    expires: '2024-12-31',
  };

  const mockTransactions = [
    {
      id: 'tx-1',
      transactionType: 'SALE',
      amount: '1000.00',
      amountPaid: '1000.00',
      description: 'Sale of products',
      createdAt: new Date('2023-09-18T10:30:00Z'),
      debitAccount: {
        id: 'acc-1',
        nameAr: 'الصندوق',
        nameEn: 'Cash',
        code: 'CASH-001',
      },
      creditAccount: {
        id: 'acc-2',
        nameAr: 'المبيعات',
        nameEn: 'Sales',
        code: 'SALES-001',
      },
      debitUser: {
        id: 'user-1',
        nameAr: 'مستخدم تجريبي',
        nameEn: 'Test User',
      },
      creditUser: {
        id: 'user-1',
        nameAr: 'مستخدم تجريبي',
        nameEn: 'Test User',
      },
    },
    {
      id: 'tx-2',
      transactionType: 'PURCHASE',
      amount: '500.00',
      amountPaid: '500.00',
      description: 'Purchase of inventory',
      createdAt: new Date('2023-09-18T09:15:00Z'),
      debitAccount: {
        id: 'acc-3',
        nameAr: 'المشتريات',
        nameEn: 'Purchases',
        code: 'PURCH-001',
      },
      creditAccount: {
        id: 'acc-1',
        nameAr: 'الصندوق',
        nameEn: 'Cash',
        code: 'CASH-001',
      },
      debitUser: {
        id: 'user-1',
        nameAr: 'مستخدم تجريبي',
        nameEn: 'Test User',
      },
      creditUser: {
        id: 'user-1',
        nameAr: 'مستخدم تجريبي',
        nameEn: 'Test User',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: vi.fn(),
    });

    mockUseAuthStore.mockReturnValue({
      language: 'en',
      user: null,
      isLoading: false,
      error: null,
      setUser: vi.fn(),
      setLanguage: vi.fn(),
      reset: vi.fn(),
    });

    mockUseDashboardStore.mockReturnValue({
      selectedDate: new Date('2023-09-18'),
      isLoading: false,
      cashBalance: 5000,
      bankBalance: 15000,
      todayStats: {
        sales: 2000,
        purchases: 800,
        expenses: 300,
        netCashFlow: 900,
      },
      pendingSyncCount: 2,
      lastSyncAt: new Date('2023-09-18T10:00:00Z'),
      setSelectedDate: vi.fn(),
      setIsLoading: vi.fn(),
      updateBalances: vi.fn(),
      updateTodayStats: vi.fn(),
      updateSyncStatus: vi.fn(),
      reset: vi.fn(),
    });

    mockTrpc.transaction.getDaily.useQuery.mockReturnValue({
      data: mockTransactions,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('renders transaction list correctly', () => {
    render(<TransactionList />);

    expect(screen.getByText('Daily Transactions')).toBeInTheDocument();
    expect(screen.getByText('2 transactions')).toBeInTheDocument();
    expect(screen.getByText('Sale of products')).toBeInTheDocument();
    expect(screen.getByText('Purchase of inventory')).toBeInTheDocument();
  });

  it('displays transaction types with correct badges', () => {
    render(<TransactionList />);

    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('Purchase')).toBeInTheDocument();
  });

  it('shows transaction amounts correctly', () => {
    render(<TransactionList />);

    expect(screen.getByText('SAR 1,000')).toBeInTheDocument();
    expect(screen.getByText('SAR 500')).toBeInTheDocument();
  });

  it('displays account information', () => {
    render(<TransactionList />);

    expect(screen.getByText(/From: Cash/)).toBeInTheDocument();
    expect(screen.getByText(/To: Sales/)).toBeInTheDocument();
    expect(screen.getByText(/From: Purchases/)).toBeInTheDocument();
  });

  it('shows transaction times', () => {
    render(<TransactionList />);

    // Should show formatted times
    const timeElements = screen.getAllByText('10:30');
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('renders transaction actions for each transaction', () => {
    render(<TransactionList />);

    expect(screen.getByTestId('actions-tx-1')).toBeInTheDocument();
    expect(screen.getByTestId('actions-tx-2')).toBeInTheDocument();
  });

  it('shows loading state correctly', () => {
    mockTrpc.transaction.getDaily.useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<TransactionList />);

    // Should show loading skeletons
    const skeletons = screen.getAllByRole('status');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state when no transactions', () => {
    mockTrpc.transaction.getDaily.useQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<TransactionList />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
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

    render(<TransactionList />);

    expect(screen.getByText('المعاملات اليومية')).toBeInTheDocument();
    expect(screen.getByText('مبيعات')).toBeInTheDocument();
    expect(screen.getByText('مشتريات')).toBeInTheDocument();
    expect(screen.getByText(/من: الصندوق/)).toBeInTheDocument();
    expect(screen.getByText(/إلى: المبيعات/)).toBeInTheDocument();
  });

  it('has refresh button that calls refetch', () => {
    const mockRefetch = vi.fn();
    mockTrpc.transaction.getDaily.useQuery.mockReturnValue({
      data: mockTransactions,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<TransactionList />);

    const refreshButton = screen.getByTitle('Refresh');
    fireEvent.click(refreshButton);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles transactions with no description', () => {
    const transactionsWithNoDescription = [
      {
        ...mockTransactions[0],
        description: null,
      },
    ];

    mockTrpc.transaction.getDaily.useQuery.mockReturnValue({
      data: transactionsWithNoDescription,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<TransactionList />);

    expect(screen.getByText('No description')).toBeInTheDocument();
  });

  it('shows different amounts for paid vs total when they differ', () => {
    const transactionWithPartialPayment = [
      {
        ...mockTransactions[0],
        amount: '1000.00',
        amountPaid: '800.00',
      },
    ];

    mockTrpc.transaction.getDaily.useQuery.mockReturnValue({
      data: transactionWithPartialPayment,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<TransactionList />);

    expect(screen.getByText('SAR 1,000')).toBeInTheDocument();
    expect(screen.getByText(/Paid: SAR 800/)).toBeInTheDocument();
  });

  it('enables query only when shopId is available', () => {
    render(<TransactionList />);

    expect(mockTrpc.transaction.getDaily.useQuery).toHaveBeenCalledWith(
      {
        shopId: 'shop-1',
        date: new Date('2023-09-18'),
      },
      expect.objectContaining({
        enabled: true,
        refetchInterval: 5000,
      })
    );
  });
});