import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import HomePage from '../../src/app/page';

// Mock dependencies
vi.mock('react-i18next');
vi.mock('next-auth/react');
vi.mock('next/navigation');

const mockTrpcQuery = vi.fn();
vi.mock('../../src/utils/trpc', () => ({
  trpc: {
    health: {
      check: {
        useQuery: () => mockTrpcQuery()
      }
    }
  }
}));

describe('Health Check Integration', () => {
  const mockPush = vi.fn();
  const mockChangeLanguage = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useRouter as any).mockReturnValue({
      push: mockPush
    });

    (useTranslation as any).mockReturnValue({
      t: (key: string) => {
        const translations = {
          'health.systemOperational': 'System Operational',
          'health.systemStatus': 'System Status',
          'health.checkingStatus': 'Checking status...',
          'health.refreshStatus': 'Refresh Status',
          'health.database': 'Database',
          'health.authentication': 'Authentication',
          'health.responseTime': 'Response Time',
          'health.version': 'Version',
          'health.environment': 'Environment',
          'health.healthy': 'Healthy',
          'health.connected': 'Connected',
          'health.operational': 'Operational',
          'health.ms': 'ms',
          'health.lastChecked': 'Last checked',
          'messages.loading': 'Loading...'
        };
        return translations[key] || key;
      },
      i18n: {
        language: 'en',
        changeLanguage: mockChangeLanguage
      }
    });

    (useSession as any).mockReturnValue({
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          nameEn: 'Test User'
        }
      },
      status: 'authenticated'
    });

    // Mock document for direction tests
    Object.defineProperty(document, 'documentElement', {
      value: {
        dir: 'ltr',
        lang: 'en'
      },
      writable: true
    });

    Object.defineProperty(document, 'title', {
      value: '',
      writable: true
    });

    mockTrpcQuery.mockReturnValue({
      data: {
        system: {
          status: 'healthy',
          database: true,
          auth: true,
          responseTime: 45,
          timestamp: new Date()
        },
        version: '1.0.0',
        environment: 'test'
      },
      isLoading: false,
      refetch: mockRefetch,
      error: null
    });
  });

  it('should integrate health check with landing page correctly', async () => {
    render(<HomePage />);

    // Should show main system status
    expect(screen.getByText('System Operational')).toBeInTheDocument();
    expect(screen.getByText('System Status')).toBeInTheDocument();

    // Should show detailed health indicators
    expect(screen.getByText('Database')).toBeInTheDocument();
    expect(screen.getByText('Authentication')).toBeInTheDocument();
    expect(screen.getByText('Response Time')).toBeInTheDocument();

    // Should show connected status
    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('Operational')).toBeInTheDocument();

    // Should show version and environment
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('should handle health check refresh correctly', async () => {
    render(<HomePage />);

    const refreshButton = screen.getByText('Refresh Status');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('should display correct language and RTL information', () => {
    render(<HomePage />);

    expect(screen.getByText(/Language: English/)).toBeInTheDocument();
    expect(screen.getByText(/Direction: LTR/)).toBeInTheDocument();
  });

  it('should show authentication status for logged in user', () => {
    render(<HomePage />);

    expect(screen.getByText(/User: Test User/)).toBeInTheDocument();
    expect(screen.getByText(/Status: Authenticated/)).toBeInTheDocument();
  });

  it('should handle navigation correctly', () => {
    render(<HomePage />);

    const dashboardButton = screen.getByText('Dashboard');
    fireEvent.click(dashboardButton);

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should handle unhealthy system status', () => {
    mockTrpcQuery.mockReturnValue({
      data: {
        system: {
          status: 'unhealthy',
          database: false,
          auth: false,
          responseTime: 250,
          timestamp: new Date()
        },
        version: '1.0.0',
        environment: 'test'
      },
      isLoading: false,
      refetch: mockRefetch,
      error: null
    });

    render(<HomePage />);

    // Should show unhealthy status indicators
    expect(screen.getAllByText('❌')).toHaveLength(3); // System, database, auth
  });

  it('should display loading state correctly', () => {
    mockTrpcQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: mockRefetch,
      error: null
    });

    render(<HomePage />);

    expect(screen.getByText('Checking status...')).toBeInTheDocument();
  });
});