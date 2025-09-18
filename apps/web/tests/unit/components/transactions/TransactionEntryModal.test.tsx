import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { TransactionEntryModal } from '../../../../src/components/features/transactions/TransactionEntryModal';
import { useAuthStore } from '../../../../src/stores/auth-store';
import { TransactionType } from '@multi-shop/shared';

// Mock dependencies
vi.mock('next-auth/react', () => ({
  useSession: vi.fn()
}));

vi.mock('../../../../src/stores/auth-store', () => ({
  useAuthStore: vi.fn()
}));

vi.mock('../../../../src/components/features/transactions/SalesTransactionForm', () => ({
  SalesTransactionForm: ({ onCancel, onSuccess }: any) => (
    <div data-testid="sales-form">
      <button onClick={onCancel}>Cancel Form</button>
      <button onClick={onSuccess}>Submit Form</button>
    </div>
  )
}));

const mockUseSession = useSession as vi.MockedFunction<typeof useSession>;
const mockUseAuthStore = useAuthStore as vi.MockedFunction<typeof useAuthStore>;

describe('TransactionEntryModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'user-1',
          shopId: 'shop-1',
          name: 'Test User'
        }
      }
    } as any);

    mockUseAuthStore.mockReturnValue({
      language: 'en'
    } as any);
  });

  it('renders modal when open', () => {
    render(<TransactionEntryModal {...mockProps} />);

    expect(screen.getByText('Add New Transaction')).toBeInTheDocument();
    expect(screen.getByText('Transaction Type')).toBeInTheDocument();
  });

  it('does not render modal when closed', () => {
    render(<TransactionEntryModal {...mockProps} isOpen={false} />);

    expect(screen.queryByText('Add New Transaction')).not.toBeInTheDocument();
  });

  it('renders in Arabic when language is set to ar', () => {
    mockUseAuthStore.mockReturnValue({
      language: 'ar'
    } as any);

    render(<TransactionEntryModal {...mockProps} />);

    expect(screen.getByText('إضافة معاملة جديدة')).toBeInTheDocument();
    expect(screen.getByText('نوع المعاملة')).toBeInTheDocument();
  });

  it('displays transaction type options', async () => {
    render(<TransactionEntryModal {...mockProps} />);

    // Click on the select trigger
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);

    await waitFor(() => {
      expect(screen.getByText('Sales')).toBeInTheDocument();
      expect(screen.getByText('Purchase')).toBeInTheDocument();
      expect(screen.getByText('Expense')).toBeInTheDocument();
      expect(screen.getByText('Transfer')).toBeInTheDocument();
    });
  });

  it('shows sales form when sales type is selected', async () => {
    render(<TransactionEntryModal {...mockProps} />);

    // Select Sales transaction type
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);

    await waitFor(() => {
      const salesOption = screen.getByText('Sales');
      fireEvent.click(salesOption);
    });

    await waitFor(() => {
      expect(screen.getByTestId('sales-form')).toBeInTheDocument();
    });
  });

  it('shows development message for non-sales types', async () => {
    render(<TransactionEntryModal {...mockProps} />);

    // Select Purchase transaction type
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);

    await waitFor(() => {
      const purchaseOption = screen.getByText('Purchase');
      fireEvent.click(purchaseOption);
    });

    await waitFor(() => {
      expect(screen.getByText('Purchase form is under development')).toBeInTheDocument();
    });
  });

  it('handles form cancellation', async () => {
    render(<TransactionEntryModal {...mockProps} />);

    // Select Sales and wait for form
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);

    await waitFor(() => {
      const salesOption = screen.getByText('Sales');
      fireEvent.click(salesOption);
    });

    await waitFor(() => {
      const cancelButton = screen.getByText('Cancel Form');
      fireEvent.click(cancelButton);
    });

    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('handles form success', async () => {
    render(<TransactionEntryModal {...mockProps} />);

    // Select Sales and wait for form
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);

    await waitFor(() => {
      const salesOption = screen.getByText('Sales');
      fireEvent.click(salesOption);
    });

    await waitFor(() => {
      const submitButton = screen.getByText('Submit Form');
      fireEvent.click(submitButton);
    });

    expect(mockProps.onSuccess).toHaveBeenCalled();
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('shows cancel button when no type is selected', () => {
    render(<TransactionEntryModal {...mockProps} />);

    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('shows instructional message when no type is selected', () => {
    render(<TransactionEntryModal {...mockProps} />);

    expect(screen.getByText('Select a transaction type above to get started')).toBeInTheDocument();
  });

  it('handles modal close via close button', () => {
    render(<TransactionEntryModal {...mockProps} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('resets form state on close', async () => {
    const { rerender } = render(<TransactionEntryModal {...mockProps} />);

    // Select a type
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);

    await waitFor(() => {
      const salesOption = screen.getByText('Sales');
      fireEvent.click(salesOption);
    });

    // Close modal
    rerender(<TransactionEntryModal {...mockProps} isOpen={false} />);

    // Reopen modal
    rerender(<TransactionEntryModal {...mockProps} isOpen={true} />);

    // Should be back to initial state
    expect(screen.getByText('Select a transaction type above to get started')).toBeInTheDocument();
  });
});