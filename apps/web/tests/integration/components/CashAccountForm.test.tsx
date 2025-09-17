import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CashAccountForm } from '../../../src/components/features/cash-bank/CashAccountForm';
import { api } from '../../../src/lib/trpc/client';

// Mock the tRPC client
vi.mock('../../../src/lib/trpc/client', () => ({
  api: {
    cashBank: {
      createCashAccount: {
        useMutation: vi.fn(),
      },
    },
  },
}));

// Mock next-i18next
vi.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock toast hook
vi.mock('../../../src/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

const mockMutateAsync = vi.fn();
const mockMutation = {
  mutateAsync: mockMutateAsync,
  isLoading: false,
  error: null,
};

describe('CashAccountForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.cashBank.createCashAccount.useMutation as any).mockReturnValue(mockMutation);
  });

  it('renders form fields correctly', () => {
    render(<CashAccountForm />);

    expect(screen.getByLabelText('cashAccount.nameAr')).toBeInTheDocument();
    expect(screen.getByLabelText('cashAccount.nameEn')).toBeInTheDocument();
    expect(screen.getByLabelText('cashAccount.openingBalance')).toBeInTheDocument();
    expect(screen.getByLabelText('cashAccount.setAsDefault')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'common.save' })).toBeInTheDocument();
  });

  it('displays validation errors for required fields', async () => {
    render(<CashAccountForm />);

    const saveButton = screen.getByRole('button', { name: 'common.save' });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Arabic name is required')).toBeInTheDocument();
      expect(screen.getByText('English name is required')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const onSuccess = vi.fn();
    mockMutateAsync.mockResolvedValue({
      id: 'test-id',
      nameAr: 'الصندوق الرئيسي',
      nameEn: 'Main Cash',
      openingBalance: 1000,
      isDefault: false,
    });

    render(<CashAccountForm onSuccess={onSuccess} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText('cashAccount.nameAr'), {
      target: { value: 'الصندوق الرئيسي' },
    });
    fireEvent.change(screen.getByLabelText('cashAccount.nameEn'), {
      target: { value: 'Main Cash' },
    });
    fireEvent.change(screen.getByLabelText('cashAccount.openingBalance'), {
      target: { value: '1000' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'common.save' }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        nameAr: 'الصندوق الرئيسي',
        nameEn: 'Main Cash',
        openingBalance: 1000,
        isDefault: false,
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('handles negative opening balance', async () => {
    const onSuccess = vi.fn();
    mockMutateAsync.mockResolvedValue({
      id: 'test-id',
      nameAr: 'صندوق السحب على المكشوف',
      nameEn: 'Overdraft Cash',
      openingBalance: -500,
      isDefault: false,
    });

    render(<CashAccountForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText('cashAccount.nameAr'), {
      target: { value: 'صندوق السحب على المكشوف' },
    });
    fireEvent.change(screen.getByLabelText('cashAccount.nameEn'), {
      target: { value: 'Overdraft Cash' },
    });
    fireEvent.change(screen.getByLabelText('cashAccount.openingBalance'), {
      target: { value: '-500' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'common.save' }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        nameAr: 'صندوق السحب على المكشوف',
        nameEn: 'Overdraft Cash',
        openingBalance: -500,
        isDefault: false,
      });
    });
  });

  it('sets account as default when switch is toggled', async () => {
    const onSuccess = vi.fn();
    mockMutateAsync.mockResolvedValue({
      id: 'test-id',
      nameAr: 'الصندوق الافتراضي',
      nameEn: 'Default Cash',
      openingBalance: 2000,
      isDefault: true,
    });

    render(<CashAccountForm onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText('cashAccount.nameAr'), {
      target: { value: 'الصندوق الافتراضي' },
    });
    fireEvent.change(screen.getByLabelText('cashAccount.nameEn'), {
      target: { value: 'Default Cash' },
    });
    fireEvent.change(screen.getByLabelText('cashAccount.openingBalance'), {
      target: { value: '2000' },
    });

    // Toggle the default switch
    fireEvent.click(screen.getByLabelText('cashAccount.setAsDefault'));

    fireEvent.click(screen.getByRole('button', { name: 'common.save' }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        nameAr: 'الصندوق الافتراضي',
        nameEn: 'Default Cash',
        openingBalance: 2000,
        isDefault: true,
      });
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<CashAccountForm onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: 'common.cancel' }));

    expect(onCancel).toHaveBeenCalled();
  });

  it('disables save button during submission', async () => {
    const mockMutationLoading = {
      ...mockMutation,
      isLoading: true,
    };
    (api.cashBank.createCashAccount.useMutation as any).mockReturnValue(mockMutationLoading);

    render(<CashAccountForm />);

    const saveButton = screen.getByRole('button', { name: 'common.saving' });
    expect(saveButton).toBeDisabled();
  });

  it('applies RTL direction for Arabic input', () => {
    render(<CashAccountForm />);

    const arabicInput = screen.getByLabelText('cashAccount.nameAr');
    expect(arabicInput).toHaveAttribute('dir', 'rtl');
    expect(arabicInput).toHaveClass('text-right');
  });
});