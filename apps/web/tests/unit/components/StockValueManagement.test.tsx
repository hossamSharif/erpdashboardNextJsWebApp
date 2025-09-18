import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { FinancialYearWithCounts } from '@multi-shop/shared';

import { StockValueManagement } from '../../../src/components/features/financial-years/StockValueManagement';

// Mock tRPC
const mockMutateAsync = vi.fn();
const mockUpdateOpeningStock = { mutateAsync: mockMutateAsync, isPending: false };
const mockUpdateClosingStock = { mutateAsync: mockMutateAsync, isPending: false };

vi.mock('../../../src/lib/trpc', () => ({
  trpc: {
    financialYear: {
      updateOpeningStockValue: {
        useMutation: () => mockUpdateOpeningStock
      },
      updateClosingStockValue: {
        useMutation: () => mockUpdateClosingStock
      }
    }
  }
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  }
}));

const mockFinancialYear: FinancialYearWithCounts = {
  id: 'fy-2024',
  name: '2024',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  openingStockValue: 10000,
  closingStockValue: null,
  isCurrent: true,
  isClosed: false,
  shopId: 'shop-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: {
    transactions: 5
  }
};

const mockClosedFinancialYear: FinancialYearWithCounts = {
  ...mockFinancialYear,
  id: 'fy-2023',
  name: '2023',
  isClosed: true,
  closingStockValue: 12000
};

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('StockValueManagement', () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Display and Initial State', () => {
    it('should render stock value management component', () => {
      renderWithProviders(
        <StockValueManagement
          financialYear={mockFinancialYear}
          shopId="shop-123"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('إدارة قيم المخزون')).toBeInTheDocument();
      expect(screen.getByText('قيمة المخزون الافتتاحي والختامي للسنة المالية 2024')).toBeInTheDocument();
    });

    it('should display current stock values', () => {
      renderWithProviders(
        <StockValueManagement
          financialYear={mockFinancialYear}
          shopId="shop-123"
          onUpdate={mockOnUpdate}
        />
      );

      // Check if opening stock value is displayed
      expect(screen.getByText(/10,000\.00.*ر\.س/)).toBeInTheDocument();

      // Check if closing stock value shows as "غير محدد" (not specified)
      expect(screen.getByText('غير محدد')).toBeInTheDocument();
    });

    it('should display status badges correctly', () => {
      renderWithProviders(
        <StockValueManagement
          financialYear={mockFinancialYear}
          shopId="shop-123"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('حالية')).toBeInTheDocument();
      expect(screen.getByText('مفتوحة')).toBeInTheDocument();
    });

    it('should show edit button for open financial year', () => {
      renderWithProviders(
        <StockValueManagement
          financialYear={mockFinancialYear}
          shopId="shop-123"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('تعديل')).toBeInTheDocument();
    });

    it('should not show edit button for closed financial year', () => {
      renderWithProviders(
        <StockValueManagement
          financialYear={mockClosedFinancialYear}
          shopId="shop-123"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.queryByText('تعديل')).not.toBeInTheDocument();
      expect(screen.getByText('لا يمكن تعديل قيم المخزون للسنوات المالية المغلقة')).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('should enter edit mode when edit button is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <StockValueManagement
          financialYear={mockFinancialYear}
          shopId="shop-123"
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(screen.getByText('تعديل'));

      // Check if form inputs are now visible
      expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
      expect(screen.getByText('حفظ التغييرات')).toBeInTheDocument();
      expect(screen.getByText('إلغاء')).toBeInTheDocument();
    });

    it('should pre-populate form with current values', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <StockValueManagement
          financialYear={mockFinancialYear}
          shopId="shop-123"
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(screen.getByText('تعديل'));

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs[0]).toHaveValue(10000); // Opening stock value
      expect(inputs[1]).toHaveValue(null); // Closing stock value (empty)
    });

    it('should cancel edit mode and restore values', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <StockValueManagement
          financialYear={mockFinancialYear}
          shopId="shop-123"
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(screen.getByText('تعديل'));

      // Change a value
      const openingInput = screen.getAllByRole('spinbutton')[0];
      await user.clear(openingInput);
      await user.type(openingInput, '15000');

      // Cancel changes
      await user.click(screen.getByText('إلغاء'));

      // Should exit edit mode
      expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
      expect(screen.getByText(/10,000\.00.*ر\.س/)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit opening stock value change', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue({});

      renderWithProviders(
        <StockValueManagement
          financialYear={mockFinancialYear}
          shopId="shop-123"
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(screen.getByText('تعديل'));

      // Change opening stock value
      const openingInput = screen.getAllByRole('spinbutton')[0];
      await user.clear(openingInput);
      await user.type(openingInput, '15000');

      await user.click(screen.getByText('حفظ التغييرات'));

      expect(mockMutateAsync).toHaveBeenCalledWith({
        shopId: 'shop-123',
        financialYearId: 'fy-2024',
        openingStockValue: 15000
      });
    });

    it('should submit closing stock value change', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue({});

      renderWithProviders(
        <StockValueManagement
          financialYear={mockFinancialYear}
          shopId="shop-123"
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(screen.getByText('تعديل'));

      // Set closing stock value
      const closingInput = screen.getAllByRole('spinbutton')[1];
      await user.type(closingInput, '18000');

      await user.click(screen.getByText('حفظ التغييرات'));

      expect(mockMutateAsync).toHaveBeenCalledWith({
        shopId: 'shop-123',
        financialYearId: 'fy-2024',
        closingStockValue: 18000
      });
    });

    it('should call onUpdate after successful submission', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue({});

      renderWithProviders(
        <StockValueManagement
          financialYear={mockFinancialYear}
          shopId="shop-123"
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(screen.getByText('تعديل'));

      const openingInput = screen.getAllByRole('spinbutton')[0];
      await user.clear(openingInput);
      await user.type(openingInput, '15000');

      await user.click(screen.getByText('حفظ التغييرات'));

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    });

    it('should handle submission errors', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockRejectedValue(new Error('Update failed'));

      renderWithProviders(
        <StockValueManagement
          financialYear={mockFinancialYear}
          shopId="shop-123"
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(screen.getByText('تعديل'));

      const openingInput = screen.getAllByRole('spinbutton')[0];
      await user.clear(openingInput);
      await user.type(openingInput, '15000');

      await user.click(screen.getByText('حفظ التغييرات'));

      // Should remain in edit mode on error
      await waitFor(() => {
        expect(screen.getByText('حفظ التغييرات')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate negative opening stock value', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <StockValueManagement
          financialYear={mockFinancialYear}
          shopId="shop-123"
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(screen.getByText('تعديل'));

      const openingInput = screen.getAllByRole('spinbutton')[0];
      await user.clear(openingInput);
      await user.type(openingInput, '-1000');

      // Try to submit
      await user.click(screen.getByText('حفظ التغييرات'));

      // Should show validation error
      expect(screen.getByText('Opening stock value must be non-negative')).toBeInTheDocument();
    });

    it('should validate negative closing stock value', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <StockValueManagement
          financialYear={mockFinancialYear}
          shopId="shop-123"
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(screen.getByText('تعديل'));

      const closingInput = screen.getAllByRole('spinbutton')[1];
      await user.type(closingInput, '-500');

      await user.click(screen.getByText('حفظ التغييرات'));

      expect(screen.getByText('Closing stock value must be non-negative')).toBeInTheDocument();
    });
  });

  describe('History Dialog', () => {
    it('should open stock value history dialog', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <StockValueManagement
          financialYear={mockFinancialYear}
          shopId="shop-123"
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(screen.getByText('السجل'));

      expect(screen.getByText('سجل تغييرات قيم المخزون')).toBeInTheDocument();
      expect(screen.getByText('جميع التغييرات المسجلة لقيم المخزون للسنة المالية 2024')).toBeInTheDocument();
    });

    it('should show empty state in history dialog', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <StockValueManagement
          financialYear={mockFinancialYear}
          shopId="shop-123"
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(screen.getByText('السجل'));

      expect(screen.getByText('لا توجد سجلات متاحة')).toBeInTheDocument();
      expect(screen.getByText('سيتم عرض سجل التغييرات هنا عند توفر البيانات')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      mockUpdateOpeningStock.isPending = true;

      renderWithProviders(
        <StockValueManagement
          financialYear={mockFinancialYear}
          shopId="shop-123"
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(screen.getByText('تعديل'));

      expect(screen.getByText('جاري الحفظ...')).toBeInTheDocument();
      expect(screen.getByText('جاري الحفظ...')).toBeDisabled();
    });

    it('should disable form inputs during loading', async () => {
      const user = userEvent.setup();
      mockUpdateOpeningStock.isPending = true;

      renderWithProviders(
        <StockValueManagement
          financialYear={mockFinancialYear}
          shopId="shop-123"
          onUpdate={mockOnUpdate}
        />
      );

      await user.click(screen.getByText('تعديل'));

      const inputs = screen.getAllByRole('spinbutton');
      inputs.forEach(input => {
        expect(input).toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderWithProviders(
        <StockValueManagement
          financialYear={mockFinancialYear}
          shopId="shop-123"
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('قيمة المخزون الافتتاحي')).toBeInTheDocument();
      expect(screen.getByText('قيمة المخزون الختامي')).toBeInTheDocument();
    });

    it('should have proper ARIA labels for buttons', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <StockValueManagement
          financialYear={mockFinancialYear}
          shopId="shop-123"
          onUpdate={mockOnUpdate}
        />
      );

      const editButton = screen.getByText('تعديل');
      const historyButton = screen.getByText('السجل');

      expect(editButton).toBeInTheDocument();
      expect(historyButton).toBeInTheDocument();

      // Test button interactions
      await user.click(editButton);
      expect(screen.getByText('حفظ التغييرات')).toBeInTheDocument();
    });
  });
});