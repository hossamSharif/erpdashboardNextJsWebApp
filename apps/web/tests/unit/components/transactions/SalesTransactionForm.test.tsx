import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession } from 'next-auth/react';
import { SalesTransactionForm } from '../../../../src/components/features/transactions/SalesTransactionForm';
import { useAuthStore } from '../../../../src/stores/auth-store';
import { trpc } from '../../../../src/utils/trpc';
import { PaymentMethod, TransactionType } from '@multi-shop/shared';

// Mock dependencies
vi.mock('next-auth/react', () => ({
  useSession: vi.fn()
}));

vi.mock('../../../../src/stores/auth-store', () => ({
  useAuthStore: vi.fn()
}));

vi.mock('../../../../src/utils/trpc', () => ({
  trpc: {
    accounts: {
      getCustomers: {
        useQuery: vi.fn()
      },
      getCashBankAccounts: {
        useQuery: vi.fn()
      }
    },
    transactions: {
      create: {
        useMutation: vi.fn()
      }
    }
  }
}));

const mockUseSession = useSession as vi.MockedFunction<typeof useSession>;
const mockUseAuthStore = useAuthStore as vi.MockedFunction<typeof useAuthStore>;
const mockTrpc = trpc as any;

describe('SalesTransactionForm', () => {
  const mockProps = {
    onCancel: vi.fn(),
    onSuccess: vi.fn()
  };

  const mockCustomers = [
    {
      id: 'direct-sales-shop-1',
      nameAr: 'مبيعات مباشرة',
      nameEn: 'Direct Sales',
      balance: 0
    },
    {
      id: 'customer-1',
      nameAr: 'عميل ١',
      nameEn: 'Customer 1',
      balance: 100
    }
  ];

  const mockCashBankAccounts = [
    {
      id: 'cash-account-1',
      nameAr: 'نقدية',
      nameEn: 'Cash Account',
      balance: 5000
    },
    {
      id: 'bank-account-1',
      nameAr: 'حساب بنكي',
      nameEn: 'Bank Account',
      balance: 10000
    }
  ];

  const mockMutation = {
    mutate: vi.fn(),
    isLoading: false,
    error: null
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          shopId: 'shop-1',
          name: 'Test User',
          shop: {
            nameAr: 'متجر تجريبي',
            nameEn: 'Test Shop'
          }
        }
      }
    } as any);

    mockUseAuthStore.mockReturnValue({
      language: 'en'
    } as any);

    mockTrpc.accounts.getCustomers.useQuery.mockReturnValue({
      data: mockCustomers,
      isLoading: false,
      error: null
    });

    mockTrpc.accounts.getCashBankAccounts.useQuery.mockReturnValue({
      data: mockCashBankAccounts,
      isLoading: false,
      error: null
    });

    mockTrpc.transactions.create.useMutation.mockReturnValue(mockMutation);
  });

  it('renders form fields correctly', () => {
    render(<SalesTransactionForm {...mockProps} />);

    expect(screen.getByLabelText('Total Amount *')).toBeInTheDocument();
    expect(screen.getByLabelText('Customer *')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount Paid *')).toBeInTheDocument();
    expect(screen.getByLabelText('Change')).toBeInTheDocument();
    expect(screen.getByLabelText('Payment Method *')).toBeInTheDocument();
    expect(screen.getByLabelText('Invoice Comment')).toBeInTheDocument();
  });

  it('renders in Arabic when language is set to ar', () => {
    mockUseAuthStore.mockReturnValue({
      language: 'ar'
    } as any);

    render(<SalesTransactionForm {...mockProps} />);

    expect(screen.getByLabelText('المبلغ الإجمالي *')).toBeInTheDocument();
    expect(screen.getByLabelText('العميل *')).toBeInTheDocument();
    expect(screen.getByLabelText('المبلغ المدفوع *')).toBeInTheDocument();
    expect(screen.getByLabelText('الباقي')).toBeInTheDocument();
    expect(screen.getByLabelText('طريقة الدفع *')).toBeInTheDocument();
    expect(screen.getByLabelText('تعليق الفاتورة')).toBeInTheDocument();
  });

  it('auto-calculates change when amount paid exceeds total', async () => {
    const user = userEvent.setup();
    render(<SalesTransactionForm {...mockProps} />);

    const totalAmountInput = screen.getByLabelText('Total Amount *');
    const amountPaidInput = screen.getByLabelText('Amount Paid *');
    const changeInput = screen.getByLabelText('Change');

    await user.type(totalAmountInput, '100');
    await user.type(amountPaidInput, '120');

    await waitFor(() => {
      expect(changeInput).toHaveValue(20);
    });
  });

  it('shows zero change when amount paid equals total', async () => {
    const user = userEvent.setup();
    render(<SalesTransactionForm {...mockProps} />);

    const totalAmountInput = screen.getByLabelText('Total Amount *');
    const amountPaidInput = screen.getByLabelText('Amount Paid *');
    const changeInput = screen.getByLabelText('Change');

    await user.type(totalAmountInput, '100');
    await user.type(amountPaidInput, '100');

    await waitFor(() => {
      expect(changeInput).toHaveValue(0);
    });
  });

  it('shows zero change when amount paid is less than total', async () => {
    const user = userEvent.setup();
    render(<SalesTransactionForm {...mockProps} />);

    const totalAmountInput = screen.getByLabelText('Total Amount *');
    const amountPaidInput = screen.getByLabelText('Amount Paid *');
    const changeInput = screen.getByLabelText('Change');

    await user.type(totalAmountInput, '100');
    await user.type(amountPaidInput, '80');

    await waitFor(() => {
      expect(changeInput).toHaveValue(0);
    });
  });

  it('displays customer options with balances', async () => {
    render(<SalesTransactionForm {...mockProps} />);

    // Click on customer select
    const customerSelect = screen.getByRole('combobox', { name: /customer/i });
    fireEvent.click(customerSelect);

    await waitFor(() => {
      expect(screen.getByText('Direct Sales')).toBeInTheDocument();
      expect(screen.getByText('Customer 1')).toBeInTheDocument();
      expect(screen.getByText('SAR 100')).toBeInTheDocument(); // Customer balance
    });
  });

  it('displays payment method options', async () => {
    render(<SalesTransactionForm {...mockProps} />);

    // Click on payment method select
    const paymentSelect = screen.getByRole('combobox', { name: /payment method/i });
    fireEvent.click(paymentSelect);

    await waitFor(() => {
      expect(screen.getByText('Cash')).toBeInTheDocument();
      expect(screen.getByText('Bank')).toBeInTheDocument();
    });
  });

  it('shows payment status summary', async () => {
    const user = userEvent.setup();
    render(<SalesTransactionForm {...mockProps} />);

    const totalAmountInput = screen.getByLabelText('Total Amount *');
    await user.type(totalAmountInput, '100');

    await waitFor(() => {
      expect(screen.getByText('Total Amount:')).toBeInTheDocument();
      expect(screen.getByText('Amount Paid:')).toBeInTheDocument();
      expect(screen.getByText('SAR 100')).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<SalesTransactionForm {...mockProps} />);

    const submitButton = screen.getByRole('button', { name: /save sale/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Amount must be positive')).toBeInTheDocument();
    });
  });

  it('validates amount paid not exceeding total', async () => {
    const user = userEvent.setup();
    render(<SalesTransactionForm {...mockProps} />);

    const totalAmountInput = screen.getByLabelText('Total Amount *');
    const amountPaidInput = screen.getByLabelText('Amount Paid *');

    await user.type(totalAmountInput, '100');
    await user.type(amountPaidInput, '120');

    const submitButton = screen.getByRole('button', { name: /save sale/i });

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('submits form with correct data', async () => {
    const user = userEvent.setup();
    render(<SalesTransactionForm {...mockProps} />);

    // Fill form
    await user.type(screen.getByLabelText('Total Amount *'), '100');
    await user.type(screen.getByLabelText('Amount Paid *'), '100');
    await user.type(screen.getByLabelText('Invoice Comment'), 'Test comment');

    // Select customer (should default to direct sales)
    // Select payment method (should default to cash)

    const submitButton = screen.getByRole('button', { name: /save sale/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutation.mutate).toHaveBeenCalledWith({
        transactionType: TransactionType.SALE,
        amount: 100,
        amountPaid: 100,
        change: 0,
        description: 'Test comment',
        accountId: 'direct-sales-shop-1',
        counterAccountId: 'cash-account-1',
        paymentMethod: PaymentMethod.CASH,
        shopId: 'shop-1'
      });
    });
  });

  it('handles form cancellation', async () => {
    const user = userEvent.setup();
    render(<SalesTransactionForm {...mockProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  it('shows loading state when submitting', async () => {
    const user = userEvent.setup();

    // Mock loading state
    mockMutation.isLoading = true;

    render(<SalesTransactionForm {...mockProps} />);

    // Fill minimum required fields
    await user.type(screen.getByLabelText('Total Amount *'), '100');
    await user.type(screen.getByLabelText('Amount Paid *'), '100');

    const submitButton = screen.getByRole('button', { name: /save sale/i });

    // Button should show loading state
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('calls onSuccess when mutation succeeds', async () => {
    const user = userEvent.setup();

    // Mock successful mutation
    mockTrpc.transactions.create.useMutation.mockReturnValue({
      ...mockMutation,
      mutate: vi.fn((data, { onSuccess }) => onSuccess?.())
    });

    render(<SalesTransactionForm {...mockProps} />);

    // Fill form and submit
    await user.type(screen.getByLabelText('Total Amount *'), '100');
    await user.type(screen.getByLabelText('Amount Paid *'), '100');

    const submitButton = screen.getByRole('button', { name: /save sale/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockProps.onSuccess).toHaveBeenCalled();
    });
  });

  it('displays remaining amount when underpaid', async () => {
    const user = userEvent.setup();
    render(<SalesTransactionForm {...mockProps} />);

    await user.type(screen.getByLabelText('Total Amount *'), '100');
    await user.type(screen.getByLabelText('Amount Paid *'), '80');

    await waitFor(() => {
      expect(screen.getByText('Remaining:')).toBeInTheDocument();
      expect(screen.getByText('SAR 20')).toBeInTheDocument();
    });
  });

  it('displays change amount when overpaid', async () => {
    const user = userEvent.setup();
    render(<SalesTransactionForm {...mockProps} />);

    await user.type(screen.getByLabelText('Total Amount *'), '100');
    await user.type(screen.getByLabelText('Amount Paid *'), '120');

    await waitFor(() => {
      expect(screen.getByText('Change:')).toBeInTheDocument();
      expect(screen.getByText('SAR 20')).toBeInTheDocument();
    });
  });
});