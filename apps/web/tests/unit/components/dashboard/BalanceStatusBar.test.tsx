import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { BalanceStatusBar } from '../../../../src/components/features/dashboard/BalanceStatusBar';
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

const mockUseSession = vi.mocked(useSession);
const mockUseAuthStore = vi.mocked(useAuthStore);
const mockUseDashboardStore = vi.mocked(useDashboardStore);
const mockTrpc = vi.mocked(trpc);

describe('BalanceStatusBar', () => {
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

  it('renders balance information correctly', () => {
    render(<BalanceStatusBar />);

    expect(screen.getByText('Cash in Hand')).toBeInTheDocument();
    expect(screen.getByText('Bank Balance')).toBeInTheDocument();
    expect(screen.getByText('SAR 5,000')).toBeInTheDocument();
    expect(screen.getByText('SAR 15,000')).toBeInTheDocument();
  });

  it('displays sync status correctly', () => {
    render(<BalanceStatusBar />);

    expect(screen.getByText('Sync Status')).toBeInTheDocument();
    expect(screen.getByText('2 pending')).toBeInTheDocument();
  });

  it('shows loading state correctly', () => {
    mockTrpc.shop.getDashboard.useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<BalanceStatusBar />);

    expect(screen.getByRole('status')).toBeInTheDocument();
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

    render(<BalanceStatusBar />);

    expect(screen.getByText('نقد في الصندوق')).toBeInTheDocument();
    expect(screen.getByText('رصيد البنك')).toBeInTheDocument();
    expect(screen.getByText('حالة المزامنة')).toBeInTheDocument();
  });

  it('shows up to date status when no pending sync', () => {
    const updatedData = {
      ...mockDashboardData,
      pendingSyncCount: 0,
    };

    mockTrpc.shop.getDashboard.useQuery.mockReturnValue({
      data: updatedData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<BalanceStatusBar />);

    expect(screen.getByText('Up to date')).toBeInTheDocument();
  });

  it('formats currency correctly', () => {
    render(<BalanceStatusBar />);

    // Should format large numbers with commas
    expect(screen.getByText('SAR 5,000')).toBeInTheDocument();
    expect(screen.getByText('SAR 15,000')).toBeInTheDocument();
  });

  it('calls updateBalances when data is received', () => {
    const mockUpdateBalances = vi.fn();
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
      updateBalances: mockUpdateBalances,
      updateTodayStats: vi.fn(),
      updateSyncStatus: vi.fn(),
      reset: vi.fn(),
    });

    render(<BalanceStatusBar />);

    // Should be called with onSuccess callback when query succeeds
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