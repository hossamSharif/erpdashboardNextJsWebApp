import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardPage from '../../../src/app/dashboard/page';
import { useAuthStore } from '../../../src/stores/auth-store';
import { useDashboardStore } from '../../../src/stores/dashboard-store';
import { trpc } from '../../../src/utils/trpc';

// Mock dependencies
vi.mock('next-auth/react');
vi.mock('next/navigation');
vi.mock('../../../src/stores/auth-store');
vi.mock('../../../src/stores/dashboard-store');
vi.mock('../../../src/utils/trpc');
vi.mock('../../../src/hooks/use-session-refresh', () => ({
  useSessionRefresh: () => ({
    isExpired: false,
  }),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));
vi.mock('date-fns', () => ({
  format: vi.fn(() => '18 September 2023'),
}));
vi.mock('date-fns/locale', () => ({
  ar: {},
  enUS: {},
}));

const mockUseSession = vi.mocked(useSession);
const mockUseRouter = vi.mocked(useRouter);
const mockUseAuthStore = vi.mocked(useAuthStore);
const mockUseDashboardStore = vi.mocked(useDashboardStore);
const mockTrpc = vi.mocked(trpc);

describe('Dashboard Page Integration', () => {
  const mockSession = {
    user: {
      id: 'user-1',
      email: 'test@example.com',
      shopId: 'shop-1',
      role: 'USER' as const,
      nameAr: 'مستخدم تجريبي',
      nameEn: 'Test User',
      isActive: true,
    },
    expires: '2024-12-31',
  };

  const mockDashboardData = {
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
  };

  const mockTransactions = [
    {
      id: 'tx-1',
      transactionType: 'SALE' as const,
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
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseRouter.mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    });

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

    const mockSetSelectedDate = vi.fn();
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
      setSelectedDate: mockSetSelectedDate,
      setIsLoading: vi.fn(),
      updateBalances: vi.fn(),
      updateTodayStats: vi.fn(),
      updateSyncStatus: vi.fn(),
      reset: vi.fn(),
    });

    // Mock tRPC queries
    mockTrpc.shop.getDashboard.useQuery.mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    mockTrpc.transaction.getDaily.useQuery.mockReturnValue({
      data: mockTransactions,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('renders complete dashboard with all components', async () => {
    render(<DashboardPage />);

    // Check header
    expect(screen.getByText('Daily Entries')).toBeInTheDocument();

    // Check balance status bar
    await waitFor(() => {
      expect(screen.getByText('Cash in Hand')).toBeInTheDocument();
      expect(screen.getByText('Bank Balance')).toBeInTheDocument();
    });

    // Check daily stats widget
    await waitFor(() => {
      expect(screen.getByText("Today's Statistics")).toBeInTheDocument();
      expect(screen.getByText('Total Sales')).toBeInTheDocument();
    });

    // Check transaction list
    await waitFor(() => {
      expect(screen.getByText('Daily Transactions')).toBeInTheDocument();
      expect(screen.getByText('Sale of products')).toBeInTheDocument();
    });
  });

  it('handles authentication redirect correctly', () => {
    // This would be handled by middleware, but we can test the page loading
    render(<DashboardPage />);

    expect(screen.getByText('Daily Entries')).toBeInTheDocument();
  });

  it('initializes dashboard store with current date', () => {
    const mockSetSelectedDate = vi.fn();
    mockUseDashboardStore.mockReturnValue({
      selectedDate: new Date('2023-09-18'),
      isLoading: false,
      cashBalance: 0,
      bankBalance: 0,
      todayStats: {
        sales: 0,
        purchases: 0,
        expenses: 0,
        netCashFlow: 0,
      },
      pendingSyncCount: 0,
      lastSyncAt: null,
      setSelectedDate: mockSetSelectedDate,
      setIsLoading: vi.fn(),
      updateBalances: vi.fn(),
      updateTodayStats: vi.fn(),
      updateSyncStatus: vi.fn(),
      reset: vi.fn(),
    });

    render(<DashboardPage />);

    expect(mockSetSelectedDate).toHaveBeenCalledWith(expect.any(Date));
  });

  it('queries data with correct parameters', () => {
    render(<DashboardPage />);

    expect(mockTrpc.shop.getDashboard.useQuery).toHaveBeenCalledWith(
      {
        shopId: 'shop-1',
        date: new Date('2023-09-18'),
      },
      expect.objectContaining({
        enabled: true,
        refetchInterval: 5000,
      })
    );

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

  it('handles loading states correctly', () => {
    mockTrpc.shop.getDashboard.useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    mockTrpc.transaction.getDaily.useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardPage />);

    // Should show loading states for both widgets
    const loadingElements = screen.getAllByRole('status');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('handles empty transaction state', async () => {
    mockTrpc.transaction.getDaily.useQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('No transactions for this date')).toBeInTheDocument();
    });
  });

  it('handles session expiry correctly', () => {
    // Mock expired session
    vi.mock('../../../src/hooks/use-session-refresh', () => ({
      useSessionRefresh: () => ({
        isExpired: true,
      }),
    }));

    render(<DashboardPage />);

    expect(screen.getByText('Session Expired')).toBeInTheDocument();
    expect(screen.getByText('Please log in again')).toBeInTheDocument();
  });

  it('supports RTL layout for Arabic', () => {
    mockUseAuthStore.mockReturnValue({
      language: 'ar',
      user: null,
      isLoading: false,
      error: null,
      setUser: vi.fn(),
      setLanguage: vi.fn(),
      reset: vi.fn(),
    });

    render(<DashboardPage />);

    expect(screen.getByText('الإدخالات اليومية')).toBeInTheDocument();

    const container = screen.getByText('الإدخالات اليومية').closest('div');
    expect(container).toHaveAttribute('dir', 'rtl');
  });

  it('has proper navigation elements', () => {
    render(<DashboardPage />);

    expect(screen.getByRole('button', { name: /language/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('implements auto-refresh functionality', () => {
    vi.useFakeTimers();

    render(<DashboardPage />);

    // Both queries should be called with refetchInterval
    expect(mockTrpc.shop.getDashboard.useQuery).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ refetchInterval: 5000 })
    );

    expect(mockTrpc.transaction.getDaily.useQuery).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ refetchInterval: 5000 })
    );

    vi.useRealTimers();
  });

  it('displays real-time balance updates', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('SAR 5,000')).toBeInTheDocument(); // Cash balance
      expect(screen.getByText('SAR 15,000')).toBeInTheDocument(); // Bank balance
    });
  });

  it('shows sync status correctly', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Sync Status')).toBeInTheDocument();
      expect(screen.getByText('2 pending')).toBeInTheDocument();
    });
  });
});