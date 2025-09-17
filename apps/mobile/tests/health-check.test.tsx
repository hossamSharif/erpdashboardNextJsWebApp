import { render, screen } from '@testing-library/react-native';
import { describe, it, expect, vi } from 'vitest';
import HealthCheckScreen from '../src/app/health-check';

// Mock the tRPC hook
vi.mock('../src/utils/trpc', () => ({
  trpc: {
    health: {
      check: {
        useQuery: vi.fn(() => ({
          data: {
            system: {
              status: 'healthy',
              database: true,
              auth: true,
              responseTime: 45,
              timestamp: new Date()
            },
            version: '0.1.0',
            environment: 'test'
          },
          isLoading: false,
          refetch: vi.fn(),
          error: null
        }))
      }
    }
  }
}));

describe('HealthCheckScreen', () => {
  it('should render system status correctly', () => {
    render(<HealthCheckScreen />);

    expect(screen.getByText('System Status')).toBeTruthy();
    expect(screen.getByText('System Operational')).toBeTruthy();
    expect(screen.getByText('Database')).toBeTruthy();
    expect(screen.getByText('Authentication')).toBeTruthy();
  });

  it('should display health indicators', () => {
    render(<HealthCheckScreen />);

    expect(screen.getByText('Connected')).toBeTruthy();
    expect(screen.getByText('Operational')).toBeTruthy();
    expect(screen.getByText('45ms')).toBeTruthy();
  });

  it('should show system information', () => {
    render(<HealthCheckScreen />);

    expect(screen.getByText('System Information')).toBeTruthy();
    expect(screen.getByText('0.1.0')).toBeTruthy();
    expect(screen.getByText('test')).toBeTruthy();
    expect(screen.getByText('React Native / Expo')).toBeTruthy();
  });
});