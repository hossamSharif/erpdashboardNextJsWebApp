import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession } from 'next-auth/react';
import { TransactionEntryModal } from '../../../src/components/features/transactions/TransactionEntryModal';
import { useAuthStore } from '../../../src/stores/auth-store';
import { trpc } from '../../../src/utils/trpc';
import { TransactionType, PaymentMethod } from '@multi-shop/shared';

// Mock dependencies
vi.mock('next-auth/react', () => ({
  useSession: vi.fn()
}));

vi.mock('../../../src/stores/auth-store', () => ({
  useAuthStore: vi.fn()
}));

vi.mock('../../../src/utils/trpc', () => ({
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

describe('Sales Transaction Flow Integration', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
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
      nameAr: 'عميل أحمد',
      nameEn: 'Ahmed Customer',
      balance: 150.50
    }
  ];

  const mockCashBankAccounts = [
    {
      id: 'cash-account-1',
      nameAr: 'الصندوق النقدي',
      nameEn: 'Cash Account',
      balance: 5000
    },
    {
      id: 'bank-account-1',
      nameAr: 'الحساب البنكي الرئيسي',
      nameEn: 'Main Bank Account',
      balance: 25000
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
          id: 'user-123',
          shopId: 'shop-1',
          name: 'John Doe',
          shop: {
            nameAr: 'متجر الكتب',
            nameEn: 'Book Store'
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('completes full cash sales transaction workflow', async () => {
    const user = userEvent.setup();

    render(<TransactionEntryModal {...mockProps} />);

    // Step 1: Modal opens and shows transaction type selector
    expect(screen.getByText('Add New Transaction')).toBeInTheDocument();
    expect(screen.getByText('Transaction Type')).toBeInTheDocument();

    // Step 2: Select Sales transaction type
    const typeSelector = screen.getByRole('combobox');
    await user.click(typeSelector);

    await waitFor(() => {
      const salesOption = screen.getByText('Sales');
      expect(salesOption).toBeInTheDocument();
      user.click(salesOption);
    });

    // Step 3: Sales form should be displayed
    await waitFor(() => {
      expect(screen.getByText('Total Amount *')).toBeInTheDocument();
      expect(screen.getByText('Customer *')).toBeInTheDocument();
      expect(screen.getByText('Payment Method *')).toBeInTheDocument();
    });

    // Step 4: Fill in transaction details
    const totalAmountInput = screen.getByLabelText('Total Amount *');
    const amountPaidInput = screen.getByLabelText('Amount Paid *');
    const commentTextarea = screen.getByLabelText('Invoice Comment');

    await user.type(totalAmountInput, '125.75');
    await user.type(amountPaidInput, '130.00');
    await user.type(commentTextarea, 'Book purchase - Receipt #001');

    // Step 5: Verify auto-calculated change
    await waitFor(() => {
      const changeInput = screen.getByLabelText('Change');
      expect(changeInput).toHaveValue(4.25);
    });

    // Step 6: Select customer (should default to direct sales)
    const customerSelect = screen.getByRole('combobox', { name: /customer/i });
    await user.click(customerSelect);

    await waitFor(() => {
      const directSalesOption = screen.getByText('Direct Sales');
      await user.click(directSalesOption);
    });

    // Step 7: Select payment method (Cash - should be default)
    const paymentSelect = screen.getByRole('combobox', { name: /payment method/i });
    await user.click(paymentSelect);

    await waitFor(() => {
      const cashOption = screen.getByText('Cash');
      await user.click(cashOption);
    });

    // Step 8: Verify payment summary
    await waitFor(() => {
      expect(screen.getByText('Total Amount:')).toBeInTheDocument();
      expect(screen.getByText('SAR 126')).toBeInTheDocument();
      expect(screen.getByText('Amount Paid:')).toBeInTheDocument();
      expect(screen.getByText('SAR 130')).toBeInTheDocument();
      expect(screen.getByText('Change:')).toBeInTheDocument();
      expect(screen.getByText('SAR 4')).toBeInTheDocument();
    });

    // Step 9: Submit the form
    const saveButton = screen.getByRole('button', { name: /save sale/i });
    await user.click(saveButton);

    // Step 10: Verify transaction creation with correct data
    await waitFor(() => {
      expect(mockMutation.mutate).toHaveBeenCalledWith({
        transactionType: TransactionType.SALE,
        amount: 125.75,
        amountPaid: 130.00,
        change: 4.25,
        description: 'Book purchase - Receipt #001',
        accountId: 'direct-sales-shop-1',
        counterAccountId: 'cash-account-1',
        paymentMethod: PaymentMethod.CASH,
        shopId: 'shop-1'
      });
    });
  });

  it('completes bank payment sales transaction workflow', async () => {
    const user = userEvent.setup();

    render(<TransactionEntryModal {...mockProps} />);

    // Select Sales type
    const typeSelector = screen.getByRole('combobox');
    await user.click(typeSelector);

    await waitFor(() => {
      const salesOption = screen.getByText('Sales');
      await user.click(salesOption);
    });

    // Fill transaction details
    await waitFor(() => {
      const totalAmountInput = screen.getByLabelText('Total Amount *');
      const amountPaidInput = screen.getByLabelText('Amount Paid *');

      user.type(totalAmountInput, '500.00');
      user.type(amountPaidInput, '500.00');
    });

    // Select existing customer
    const customerSelect = screen.getByRole('combobox', { name: /customer/i });
    await user.click(customerSelect);

    await waitFor(() => {
      const customerOption = screen.getByText('Ahmed Customer');
      await user.click(customerOption);
    });

    // Select Bank payment method
    const paymentSelect = screen.getByRole('combobox', { name: /payment method/i });
    await user.click(paymentSelect);

    await waitFor(() => {
      const bankOption = screen.getByText('Bank');
      await user.click(bankOption);
    });

    // Submit
    const saveButton = screen.getByRole('button', { name: /save sale/i });
    await user.click(saveButton);

    // Verify bank account is selected as counter account
    await waitFor(() => {
      expect(mockMutation.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionType: TransactionType.SALE,
          amount: 500.00,
          amountPaid: 500.00,
          change: 0,
          accountId: 'customer-1',
          counterAccountId: 'bank-account-1',
          paymentMethod: PaymentMethod.BANK,
          shopId: 'shop-1'
        })
      );
    });
  });

  it('handles partial payment scenario', async () => {
    const user = userEvent.setup();

    render(<TransactionEntryModal {...mockProps} />);

    // Select Sales and fill form
    const typeSelector = screen.getByRole('combobox');
    await user.click(typeSelector);

    await waitFor(() => {
      const salesOption = screen.getByText('Sales');
      await user.click(salesOption);
    });

    await waitFor(() => {
      const totalAmountInput = screen.getByLabelText('Total Amount *');
      const amountPaidInput = screen.getByLabelText('Amount Paid *');

      user.type(totalAmountInput, '200.00');
      user.type(amountPaidInput, '150.00');
    });

    // Verify remaining amount is displayed
    await waitFor(() => {
      expect(screen.getByText('Remaining:')).toBeInTheDocument();
      expect(screen.getByText('SAR 50')).toBeInTheDocument();
      expect(screen.getByLabelText('Change')).toHaveValue(0);
    });

    // Submit partial payment
    const saveButton = screen.getByRole('button', { name: /save sale/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockMutation.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 200.00,
          amountPaid: 150.00,
          change: 0
        })
      );
    });
  });

  it('handles form validation errors', async () => {
    const user = userEvent.setup();

    render(<TransactionEntryModal {...mockProps} />);

    // Select Sales
    const typeSelector = screen.getByRole('combobox');
    await user.click(typeSelector);

    await waitFor(() => {
      const salesOption = screen.getByText('Sales');
      await user.click(salesOption);
    });

    // Try to submit without filling required fields
    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: /save sale/i });
      user.click(saveButton);
    });

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText('Amount must be positive')).toBeInTheDocument();
    });

    // Fill invalid data (amount paid > total)
    const totalAmountInput = screen.getByLabelText('Total Amount *');
    const amountPaidInput = screen.getByLabelText('Amount Paid *');

    await user.type(totalAmountInput, '100');
    await user.type(amountPaidInput, '150');

    // Save button should be disabled for overpayment
    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: /save sale/i });
      expect(saveButton).toBeDisabled();
    });
  });

  it('handles mutation errors gracefully', async () => {
    const user = userEvent.setup();

    // Mock mutation error
    const errorMutation = {
      mutate: vi.fn(),
      isLoading: false,
      error: { message: 'Failed to create transaction' }
    };

    mockTrpc.transactions.create.useMutation.mockReturnValue(errorMutation);

    render(<TransactionEntryModal {...mockProps} />);

    // Complete form flow
    const typeSelector = screen.getByRole('combobox');
    await user.click(typeSelector);

    await waitFor(() => {
      const salesOption = screen.getByText('Sales');
      await user.click(salesOption);
    });

    await waitFor(() => {
      const totalAmountInput = screen.getByLabelText('Total Amount *');
      const amountPaidInput = screen.getByLabelText('Amount Paid *');

      user.type(totalAmountInput, '100');
      user.type(amountPaidInput, '100');
    });

    const saveButton = screen.getByRole('button', { name: /save sale/i });
    await user.click(saveButton);

    // Verify mutation was called but error doesn't break UI
    await waitFor(() => {
      expect(errorMutation.mutate).toHaveBeenCalled();
      // Form should still be visible and functional
      expect(screen.getByText('Save Sale')).toBeInTheDocument();
    });
  });

  it('handles successful submission and callback', async () => {
    const user = userEvent.setup();

    // Mock successful mutation
    const successMutation = {
      mutate: vi.fn((data, options) => {
        // Simulate successful response
        options?.onSuccess?.({
          id: 'transaction-123',
          amount: data.amount,
          transactionType: data.transactionType
        });
      }),
      isLoading: false,
      error: null
    };

    mockTrpc.transactions.create.useMutation.mockReturnValue(successMutation);

    render(<TransactionEntryModal {...mockProps} />);

    // Complete successful transaction flow
    const typeSelector = screen.getByRole('combobox');
    await user.click(typeSelector);

    await waitFor(() => {
      const salesOption = screen.getByText('Sales');
      await user.click(salesOption);
    });

    await waitFor(() => {
      const totalAmountInput = screen.getByLabelText('Total Amount *');
      const amountPaidInput = screen.getByLabelText('Amount Paid *');

      user.type(totalAmountInput, '100');
      user.type(amountPaidInput, '100');
    });

    const saveButton = screen.getByRole('button', { name: /save sale/i });
    await user.click(saveButton);

    // Verify callbacks are called
    await waitFor(() => {
      expect(mockProps.onSuccess).toHaveBeenCalled();
      expect(mockProps.onClose).toHaveBeenCalled();
    });
  });

  it('works correctly in Arabic locale', async () => {
    const user = userEvent.setup();

    // Switch to Arabic
    mockUseAuthStore.mockReturnValue({
      language: 'ar'
    } as any);

    render(<TransactionEntryModal {...mockProps} />);

    // Should display Arabic text
    expect(screen.getByText('إضافة معاملة جديدة')).toBeInTheDocument();
    expect(screen.getByText('نوع المعاملة')).toBeInTheDocument();

    // Select Sales type
    const typeSelector = screen.getByRole('combobox');
    await user.click(typeSelector);

    await waitFor(() => {
      const salesOption = screen.getByText('مبيعات');
      await user.click(salesOption);
    });

    // Form should be in Arabic
    await waitFor(() => {
      expect(screen.getByText('المبلغ الإجمالي *')).toBeInTheDocument();
      expect(screen.getByText('العميل *')).toBeInTheDocument();
      expect(screen.getByText('طريقة الدفع *')).toBeInTheDocument();
      expect(screen.getByText('حفظ المبيعات')).toBeInTheDocument();
    });

    // Fill and submit
    const totalAmountInput = screen.getByLabelText('المبلغ الإجمالي *');
    const amountPaidInput = screen.getByLabelText('المبلغ المدفوع *');

    await user.type(totalAmountInput, '100');
    await user.type(amountPaidInput, '100');

    const saveButton = screen.getByRole('button', { name: /حفظ المبيعات/i });
    await user.click(saveButton);

    // Verify transaction is created correctly
    await waitFor(() => {
      expect(mockMutation.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionType: TransactionType.SALE,
          amount: 100,
          shopId: 'shop-1'
        })
      );
    });
  });
});