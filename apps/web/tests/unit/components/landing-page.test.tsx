import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import HomePage from '../../../src/app/page';

// Mock dependencies
vi.mock('react-i18next');
vi.mock('next-auth/react');
vi.mock('next/navigation');
vi.mock('../../../src/utils/trpc', () => ({
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
            version: '1.0.0',
            environment: 'test'
          },
          isLoading: false,
          refetch: vi.fn()
        }))
      }
    }
  }
}));

describe('Landing Page', () => {
  const mockPush = vi.fn();
  const mockChangeLanguage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useRouter as any).mockReturnValue({
      push: mockPush
    });

    (useTranslation as any).mockReturnValue({
      t: (key: string) => key,
      i18n: {
        language: 'en',
        changeLanguage: mockChangeLanguage
      }
    });

    (useSession as any).mockReturnValue({
      data: null,
      status: 'unauthenticated'
    });

    // Mock document for RTL tests
    Object.defineProperty(document, 'documentElement', {
      value: {
        dir: 'ltr',
        lang: 'en'
      },
      writable: true
    });
  });

  it('should display system status in English', () => {
    render(<HomePage />);

    expect(screen.getByText('health.systemOperational')).toBeInTheDocument();
    expect(screen.getByText('health.systemStatus')).toBeInTheDocument();
  });

  it('should display system status in Arabic', () => {
    (useTranslation as any).mockReturnValue({
      t: (key: string) => key === 'health.systemOperational' ? 'النظام يعمل' : key,
      i18n: {
        language: 'ar',
        changeLanguage: mockChangeLanguage
      }
    });

    Object.defineProperty(document, 'documentElement', {
      value: {
        dir: 'rtl',
        lang: 'ar'
      },
      writable: true
    });

    render(<HomePage />);

    expect(screen.getByText('النظام يعمل')).toBeInTheDocument();
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('should show login button when not authenticated', () => {
    render(<HomePage />);

    const loginButton = screen.getByText('Login');
    expect(loginButton).toBeInTheDocument();

    fireEvent.click(loginButton);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should show dashboard button when authenticated', () => {
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

    render(<HomePage />);

    const dashboardButton = screen.getByText('Dashboard');
    expect(dashboardButton).toBeInTheDocument();

    fireEvent.click(dashboardButton);
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('should display language and direction information', () => {
    render(<HomePage />);

    expect(screen.getByText(/Language:/)).toBeInTheDocument();
    expect(screen.getByText(/Direction:/)).toBeInTheDocument();
  });

  it('should display authenticated user information', () => {
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

    render(<HomePage />);

    expect(screen.getByText(/User: Test User/)).toBeInTheDocument();
  });
});