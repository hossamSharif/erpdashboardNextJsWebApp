import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SessionProvider } from 'next-auth/react';
import { LoginForm } from '../../../src/components/features/auth/login-form';

// Mock entire next-auth/react module
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  getSession: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

// Mock auth store
const mockSetUser = vi.fn();
vi.mock('../../../src/stores/auth-store', () => ({
  useAuthStore: () => ({
    language: 'en',
    setUser: mockSetUser
  })
}));

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full admin login flow', async () => {
    const { signIn, getSession } = await import('next-auth/react');

    (signIn as any).mockResolvedValue({ ok: true });
    (getSession as any).mockResolvedValue({
      user: {
        id: '1',
        email: 'admin@shop1.com',
        nameAr: 'المدير الأول',
        nameEn: 'Admin User',
        role: 'ADMIN',
        shopId: 'shop-1',
        isActive: true
      }
    });

    render(
      <SessionProvider session={null}>
        <LoginForm />
      </SessionProvider>
    );

    // Fill in admin credentials
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'admin@shop1.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Should not show shop selector for admin
    expect(screen.queryByText('Select Shop')).not.toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'admin@shop1.com',
        password: 'password123',
        shopId: undefined,
        redirect: false
      });
    });

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith({
        id: '1',
        email: 'admin@shop1.com',
        nameAr: 'المدير الأول',
        nameEn: 'Admin User',
        role: 'ADMIN',
        shopId: 'shop-1',
        isActive: true
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should complete full user login flow with shop selection', async () => {
    const { signIn, getSession } = await import('next-auth/react');

    (signIn as any).mockResolvedValue({ ok: true });
    (getSession as any).mockResolvedValue({
      user: {
        id: '2',
        email: 'user@shop1.com',
        nameAr: 'المستخدم الأول',
        nameEn: 'Regular User',
        role: 'USER',
        shopId: 'shop-1',
        isActive: true
      }
    });

    render(
      <SessionProvider session={null}>
        <LoginForm />
      </SessionProvider>
    );

    // Fill in user credentials
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'user@shop1.com' } });

    // Should show shop selector for regular users
    await waitFor(() => {
      expect(screen.getByText('Select Shop')).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/password/i);
    const shopSelect = screen.getByRole('combobox');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(shopSelect, { target: { value: 'shop-1' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'user@shop1.com',
        password: 'password123',
        shopId: 'shop-1',
        redirect: false
      });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should handle rate limiting error', async () => {
    const { signIn } = await import('next-auth/react');

    const rateLimitError = {
      code: 'RATE_LIMITED',
      message: 'Too many login attempts. Please try again later.',
      messageAr: 'محاولات تسجيل دخول كثيرة جداً. يرجى المحاولة لاحقاً'
    };

    (signIn as any).mockResolvedValue({
      error: JSON.stringify(rateLimitError),
      ok: false
    });

    render(
      <SessionProvider session={null}>
        <LoginForm />
      </SessionProvider>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Too many login attempts. Please try again later.')).toBeInTheDocument();
    });
  });

  it('should redirect with callback URL', async () => {
    const { signIn, getSession } = await import('next-auth/react');

    (signIn as any).mockResolvedValue({ ok: true });
    (getSession as any).mockResolvedValue({
      user: { id: '1', role: 'ADMIN' }
    });

    const searchParams = {
      callbackUrl: '/admin/settings'
    };

    render(
      <SessionProvider session={null}>
        <LoginForm searchParams={searchParams} />
      </SessionProvider>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'admin@shop1.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/settings');
    });
  });
});