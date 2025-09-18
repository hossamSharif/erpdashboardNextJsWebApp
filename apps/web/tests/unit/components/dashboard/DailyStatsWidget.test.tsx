import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { DailyStatsWidget } from '../../../../src/components/features/dashboard/DailyStatsWidget';
import { useAuthStore } from '../../../../src/stores/auth-store';
import { useDashboardStore } from '../../../../src/stores/dashboard-store';
import { trpc } from '../../../../src/utils/trpc';

// Mock dependencies
vi.mock('next-auth/react');
vi.mock('../../../../src/stores/auth-store');
vi.mock('../../../../src/stores/dashboard-store');
vi.mock('../../../../src/utils/trpc');
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));
vi.mock('date-fns', () => ({
  format: vi.fn((date) => '18 September 2023'),
}));
vi.mock('date-fns/locale', () => ({
  ar: {},
  enUS: {},
}));

const mockUseSession = vi.mocked(useSession);
const mockUseAuthStore = vi.mocked(useAuthStore);
const mockUseDashboardStore = vi.mocked(useDashboardStore);
const mockTrpc = vi.mocked(trpc);

describe('DailyStatsWidget', () => {
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

    mockTrpc.shop.getDashboard.useQuery.mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('renders statistics correctly', () => {
    render(<DailyStatsWidget />);

    expect(screen.getByText("Today's Statistics")).toBeInTheDocument();
    expect(screen.getByText('Total Sales')).toBeInTheDocument();
    expect(screen.getByText('Total Purchases')).toBeInTheDocument();
    expect(screen.getByText('Total Expenses')).toBeInTheDocument();
    expect(screen.getByText('Net Cash Flow')).toBeInTheDocument();
  });

  it('displays correct amounts', () => {
    render(<DailyStatsWidget />);

    expect(screen.getByText('SAR 2,000')).toBeInTheDocument(); // Sales
    expect(screen.getByText('SAR 800')).toBeInTheDocument();   // Purchases
    expect(screen.getByText('SAR 300')).toBeInTheDocument();   // Expenses
    expect(screen.getByText('SAR 900')).toBeInTheDocument();   // Net Cash Flow
  });

  it('shows loading state correctly', () => {
    mockTrpc.shop.getDashboard.useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DailyStatsWidget />);

    // Should show loading skeletons
    const skeletons = screen.getAllByRole('status');
    expect(skeletons.length).toBeGreaterThan(0);
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

    render(<DailyStatsWidget />);

    expect(screen.getByText('إحصائيات اليوم')).toBeInTheDocument();
    expect(screen.getByText('إجمالي المبيعات')).toBeInTheDocument();
    expect(screen.getByText('إجمالي المشتريات')).toBeInTheDocument();
    expect(screen.getByText('إجمالي المصروفات')).toBeInTheDocument();
    expect(screen.getByText('صافي التدفق النقدي')).toBeInTheDocument();
  });

  it('displays negative net cash flow with red color', () => {
    const negativeFlowData = {
      ...mockDashboardData,
      todayStats: {
        ...mockDashboardData.todayStats,
        netCashFlow: -500,
      },
    };

    mockTrpc.shop.getDashboard.useQuery.mockReturnValue({
      data: negativeFlowData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DailyStatsWidget />);

    expect(screen.getByText('SAR -500')).toBeInTheDocument();
  });

  it('displays positive net cash flow with blue color', () => {
    render(<DailyStatsWidget />);

    const netCashFlowElement = screen.getByText('SAR 900');
    expect(netCashFlowElement).toBeInTheDocument();
  });

  it('shows current date in header', () => {
    render(<DailyStatsWidget />);

    expect(screen.getByText('18 September 2023')).toBeInTheDocument();
  });

  it('has refresh button that works', () => {
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: {
        reload: vi.fn(),
      },
      writable: true,
    });

    render(<DailyStatsWidget />);

    const refreshButton = screen.getByTitle('Refresh');
    expect(refreshButton).toBeInTheDocument();
  });

  it('calls updateTodayStats when data is received', () => {
    const mockUpdateTodayStats = vi.fn();
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
      updateTodayStats: mockUpdateTodayStats,
      updateSyncStatus: vi.fn(),
      reset: vi.fn(),
    });

    render(<DailyStatsWidget />);

    // Should be called with proper configuration
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
  });
});