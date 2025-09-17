import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import { HealthStatus } from '../../../src/components/features/health/health-status';

// Mock dependencies
vi.mock('react-i18next');
vi.mock('next-auth/react');

const mockRefetch = vi.fn();
const mockTrpcQuery = vi.fn();

vi.mock('../../../src/utils/trpc', () => ({
  trpc: {
    health: {
      check: {
        useQuery: () => mockTrpcQuery()
      }
    }
  }
}));

describe('HealthStatus Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useTranslation as any).mockReturnValue({
      t: (key: string) => key,
      i18n: {
        language: 'en'
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
      refetch: mockRefetch
    });
  });

  it('should display healthy system status', () => {
    render(<HealthStatus />);

    expect(screen.getByText('health.systemOperational')).toBeInTheDocument();
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('should display unhealthy system status', () => {
    mockTrpcQuery.mockReturnValue({
      data: {
        system: {
          status: 'unhealthy',
          database: false,
          auth: false,
          responseTime: 150,
          timestamp: new Date()
        },
        version: '1.0.0',
        environment: 'test'
      },
      isLoading: false,
      refetch: mockRefetch
    });

    render(<HealthStatus />);

    expect(screen.getByText('health.unhealthy')).toBeInTheDocument();
    expect(screen.getAllByText('❌')).toHaveLength(3); // System, database, auth
  });

  it('should display loading state', () => {
    mockTrpcQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: mockRefetch
    });

    render(<HealthStatus />);

    expect(screen.getByText('health.checkingStatus')).toBeInTheDocument();
  });

  it('should handle refresh button click', async () => {
    render(<HealthStatus />);

    const refreshButton = screen.getByText('health.refreshStatus');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('should display response time correctly', () => {
    render(<HealthStatus />);

    expect(screen.getByText('45health.ms')).toBeInTheDocument();
  });

  it('should display version and environment', () => {
    render(<HealthStatus />);

    expect(screen.getByText('1.0.0')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('should display authenticated user information', () => {
    render(<HealthStatus />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should handle unauthenticated user', () => {
    (useSession as any).mockReturnValue({
      data: null,
      status: 'unauthenticated'
    });

    render(<HealthStatus />);

    expect(screen.getByText('auth.notLoggedIn')).toBeInTheDocument();
  });
});