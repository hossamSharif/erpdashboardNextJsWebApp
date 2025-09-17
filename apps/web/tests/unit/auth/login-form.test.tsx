import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SessionProvider } from 'next-auth/react';
import { LoginForm } from '../../../src/components/features/auth/login-form';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

// Mock next-auth/react
const mockSignIn = vi.fn();
const mockGetSession = vi.fn();
vi.mock('next-auth/react', async () => {
  const actual = await vi.importActual('next-auth/react');
  return {
    ...actual,
    signIn: mockSignIn,
    getSession: mockGetSession,
    SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  };
});

// Mock Zustand store
const mockUseAuthStore = vi.fn();
vi.mock('../../../src/stores/auth-store', () => ({
  useAuthStore: () => mockUseAuthStore()
}));

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <SessionProvider session={null}>
    {children}
  </SessionProvider>
);

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue({
      language: 'en',
      setUser: vi.fn()
    });
  });

  it('should render login form in English', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should render login form in Arabic', () => {
    mockUseAuthStore.mockReturnValue({
      language: 'ar',
      setUser: vi.fn()
    });

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    expect(screen.getByText('تسجيل الدخول')).toBeInTheDocument();
    expect(screen.getByText('البريد الإلكتروني')).toBeInTheDocument();
    expect(screen.getByText('كلمة المرور')).toBeInTheDocument();
  });

  it('should show shop selector for regular users', async () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'user@shop1.com' } });

    await waitFor(() => {
      expect(screen.getByText('Select Shop')).toBeInTheDocument();
    });
  });

  it('should not show shop selector for admin users', async () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'admin@shop1.com' } });

    await waitFor(() => {
      expect(screen.queryByText('Select Shop')).not.toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('should call signIn with correct credentials', async () => {
    mockSignIn.mockResolvedValue({ ok: true });
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 'admin@shop1.com', role: 'ADMIN' }
    });

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'admin@shop1.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'admin@shop1.com',
        password: 'password123',
        shopId: undefined,
        redirect: false
      });
    });
  });

  it('should handle login errors', async () => {
    const errorObj = {
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password',
      messageAr: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
    };

    mockSignIn.mockResolvedValue({
      error: JSON.stringify(errorObj),
      ok: false
    });

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@email.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });

  it('should show loading state during login', async () => {
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100)));

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'admin@shop1.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});