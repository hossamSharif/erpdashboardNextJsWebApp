import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FinancialYearForm } from '@/components/features/financial-years/FinancialYearForm';
import type { CreateFinancialYearInput, FinancialYear } from '@multi-shop/shared';

// Mock dependencies
vi.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({ onDateChange, placeholder, date }: any) => (
    <input
      data-testid={placeholder}
      value={date ? date.toISOString().split('T')[0] : ''}
      onChange={(e) => onDateChange(new Date(e.target.value))}
      type="date"
    />
  ),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('FinancialYearForm', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();
  const mockShopId = 'shop-123';

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    shopId: mockShopId,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('should render create form correctly', () => {
      render(<FinancialYearForm {...defaultProps} />);

      expect(screen.getByText('إضافة سنة مالية جديدة')).toBeInTheDocument();
      expect(screen.getByText('قم بإنشاء سنة مالية جديدة لمتجرك')).toBeInTheDocument();
      expect(screen.getByLabelText('اسم السنة المالية')).toBeInTheDocument();
      expect(screen.getByLabelText('تاريخ البداية')).toBeInTheDocument();
      expect(screen.getByLabelText('تاريخ النهاية')).toBeInTheDocument();
      expect(screen.getByLabelText('قيمة المخزون الافتتاحي')).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      render(<FinancialYearForm {...defaultProps} />);

      const submitButton = screen.getByText('إنشاء السنة المالية');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Financial year name is required')).toBeInTheDocument();
      });
    });

    it('should validate date range', async () => {
      render(<FinancialYearForm {...defaultProps} />);

      const nameInput = screen.getByLabelText('اسم السنة المالية');
      const startDateInput = screen.getByTestId('اختر تاريخ البداية');
      const endDateInput = screen.getByTestId('اختر تاريخ النهاية');

      fireEvent.change(nameInput, { target: { value: 'FY 2024' } });
      fireEvent.change(startDateInput, { target: { value: '2024-12-31' } });
      fireEvent.change(endDateInput, { target: { value: '2024-01-01' } });

      const submitButton = screen.getByText('إنشاء السنة المالية');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('End date must be after start date')).toBeInTheDocument();
      });
    });

    it('should submit valid form data', async () => {
      mockOnSubmit.mockResolvedValueOnce(undefined);

      render(<FinancialYearForm {...defaultProps} />);

      const nameInput = screen.getByLabelText('اسم السنة المالية');
      const startDateInput = screen.getByTestId('اختر تاريخ البداية');
      const endDateInput = screen.getByTestId('اختر تاريخ النهاية');
      const stockValueInput = screen.getByLabelText('قيمة المخزون الافتتاحي');

      fireEvent.change(nameInput, { target: { value: 'FY 2024' } });
      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
      fireEvent.change(endDateInput, { target: { value: '2024-12-31' } });
      fireEvent.change(stockValueInput, { target: { value: '10000' } });

      const submitButton = screen.getByText('إنشاء السنة المالية');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'FY 2024',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          openingStockValue: 10000,
          shopId: mockShopId,
        });
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Edit Mode', () => {
    const mockFinancialYear: FinancialYear = {
      id: 'fy-1',
      name: 'FY 2023',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-12-31'),
      openingStockValue: 5000,
      closingStockValue: null,
      isCurrent: true,
      isClosed: false,
      shopId: mockShopId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should render edit form with existing data', () => {
      render(
        <FinancialYearForm
          {...defaultProps}
          financialYear={mockFinancialYear}
        />
      );

      expect(screen.getByText('تعديل السنة المالية')).toBeInTheDocument();
      expect(screen.getByDisplayValue('FY 2023')).toBeInTheDocument();
      expect(screen.getByDisplayValue('5000')).toBeInTheDocument();
    });

    it('should submit update data correctly', async () => {
      mockOnSubmit.mockResolvedValueOnce(undefined);

      render(
        <FinancialYearForm
          {...defaultProps}
          financialYear={mockFinancialYear}
        />
      );

      const nameInput = screen.getByDisplayValue('FY 2023');
      fireEvent.change(nameInput, { target: { value: 'FY 2023 Updated' } });

      const submitButton = screen.getByText('حفظ التغييرات');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          id: 'fy-1',
          name: 'FY 2023 Updated',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          openingStockValue: 5000,
        });
      });
    });

    it('should show closed year warning', () => {
      const closedYear = { ...mockFinancialYear, isClosed: true };

      render(
        <FinancialYearForm
          {...defaultProps}
          financialYear={closedYear}
        />
      );

      expect(screen.getByText('هذه السنة المالية مُغلقة. لا يمكن تعديل التواريخ.')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should disable form when loading', () => {
      render(<FinancialYearForm {...defaultProps} isLoading={true} />);

      const nameInput = screen.getByLabelText('اسم السنة المالية');
      const submitButton = screen.getByText('إنشاء السنة المالية');

      expect(nameInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Date Range Summary', () => {
    it('should show date range summary when dates are valid', async () => {
      render(<FinancialYearForm {...defaultProps} />);

      const startDateInput = screen.getByTestId('اختر تاريخ البداية');
      const endDateInput = screen.getByTestId('اختر تاريخ النهاية');

      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
      fireEvent.change(endDateInput, { target: { value: '2024-12-31' } });

      await waitFor(() => {
        expect(screen.getByText('ملخص السنة المالية')).toBeInTheDocument();
        expect(screen.getByText('366 يوم')).toBeInTheDocument(); // 2024 is leap year
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate opening stock value is non-negative', async () => {
      render(<FinancialYearForm {...defaultProps} />);

      const stockValueInput = screen.getByLabelText('قيمة المخزون الافتتاحي');
      fireEvent.change(stockValueInput, { target: { value: '-100' } });

      const submitButton = screen.getByText('إنشاء السنة المالية');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Opening stock value must be non-negative')).toBeInTheDocument();
      });
    });

    it('should validate name length', async () => {
      render(<FinancialYearForm {...defaultProps} />);

      const nameInput = screen.getByLabelText('اسم السنة المالية');
      fireEvent.change(nameInput, { target: { value: 'a'.repeat(101) } });

      const submitButton = screen.getByText('إنشاء السنة المالية');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name must be less than 100 characters')).toBeInTheDocument();
      });
    });
  });
});