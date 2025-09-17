import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ExpenseCategoryForm } from '../../../src/components/features/expense-categories/ExpenseCategoryForm';
import { api } from '../../../src/lib/trpc/client';

// Mock the tRPC client
vi.mock('../../../src/lib/trpc/client', () => ({
  api: {
    expenseCategory: {
      createExpenseCategory: {
        useMutation: vi.fn(),
      },
      updateExpenseCategory: {
        useMutation: vi.fn(),
      },
      getExpenseCategories: {
        useQuery: vi.fn(),
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

const mockCreateMutateAsync = vi.fn();
const mockUpdateMutateAsync = vi.fn();
const mockCreateMutation = {
  mutateAsync: mockCreateMutateAsync,
  isLoading: false,
  error: null,
};
const mockUpdateMutation = {
  mutateAsync: mockUpdateMutateAsync,
  isLoading: false,
  error: null,
};

const mockCategories = [
  {
    id: 'parent-1',
    nameAr: 'تصنيف رئيسي',
    nameEn: 'Parent Category',
    code: 'PARENT',
    level: 1,
    shopId: 'test-shop',
    isActive: true,
    isSystemCategory: false,
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'parent-2',
    nameAr: 'تصنيف آخر',
    nameEn: 'Another Category',
    code: 'ANOTHER',
    level: 2,
    shopId: 'test-shop',
    isActive: true,
    isSystemCategory: false,
    parentId: 'parent-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('ExpenseCategoryForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.expenseCategory.createExpenseCategory.useMutation as any).mockReturnValue(mockCreateMutation);
    (api.expenseCategory.updateExpenseCategory.useMutation as any).mockReturnValue(mockUpdateMutation);
    (api.expenseCategory.getExpenseCategories.useQuery as any).mockReturnValue({
      data: mockCategories,
      isLoading: false,
    });
  });

  describe('Create Mode', () => {
    it('renders form fields correctly for creating new category', () => {
      render(<ExpenseCategoryForm />);

      expect(screen.getByLabelText('expenseCategory.nameAr')).toBeInTheDocument();
      expect(screen.getByLabelText('expenseCategory.nameEn')).toBeInTheDocument();
      expect(screen.getByLabelText('expenseCategory.code')).toBeInTheDocument();
      expect(screen.getByLabelText('expenseCategory.parentCategory')).toBeInTheDocument();
      expect(screen.getByLabelText('expenseCategory.isSystemCategory')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'common.create' })).toBeInTheDocument();
    });

    it('submits form with correct data for new category', async () => {
      const onSuccess = vi.fn();
      render(<ExpenseCategoryForm onSuccess={onSuccess} />);

      // Fill in the form
      fireEvent.change(screen.getByLabelText('expenseCategory.nameAr'), {
        target: { value: 'تصنيف جديد' },
      });
      fireEvent.change(screen.getByLabelText('expenseCategory.nameEn'), {
        target: { value: 'New Category' },
      });
      fireEvent.change(screen.getByLabelText('expenseCategory.code'), {
        target: { value: 'NEW_CAT' },
      });

      mockCreateMutateAsync.mockResolvedValue({
        id: 'new-category-id',
        nameAr: 'تصنيف جديد',
        nameEn: 'New Category',
        code: 'NEW_CAT',
      });

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: 'common.create' }));

      await waitFor(() => {
        expect(mockCreateMutateAsync).toHaveBeenCalledWith({
          nameAr: 'تصنيف جديد',
          nameEn: 'New Category',
          code: 'NEW_CAT',
          shopId: '',
          isSystemCategory: false,
        });
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('creates subcategory with parent selection', async () => {
      const parentCategory = mockCategories[0];
      render(<ExpenseCategoryForm parentCategory={parentCategory} />);

      // Parent should be pre-selected
      expect(screen.getByDisplayValue('PARENT - Parent Category')).toBeInTheDocument();

      // Fill in the form
      fireEvent.change(screen.getByLabelText('expenseCategory.nameAr'), {
        target: { value: 'تصنيف فرعي' },
      });
      fireEvent.change(screen.getByLabelText('expenseCategory.nameEn'), {
        target: { value: 'Sub Category' },
      });
      fireEvent.change(screen.getByLabelText('expenseCategory.code'), {
        target: { value: 'SUB_CAT' },
      });

      mockCreateMutateAsync.mockResolvedValue({
        id: 'sub-category-id',
        nameAr: 'تصنيف فرعي',
        nameEn: 'Sub Category',
        code: 'SUB_CAT',
        parentId: parentCategory.id,
      });

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: 'common.create' }));

      await waitFor(() => {
        expect(mockCreateMutateAsync).toHaveBeenCalledWith({
          nameAr: 'تصنيف فرعي',
          nameEn: 'Sub Category',
          code: 'SUB_CAT',
          parentId: parentCategory.id,
          shopId: '',
          isSystemCategory: false,
        });
      });
    });

    it('validates required fields', async () => {
      render(<ExpenseCategoryForm />);

      // Try to submit without filling required fields
      fireEvent.click(screen.getByRole('button', { name: 'common.create' }));

      await waitFor(() => {
        expect(mockCreateMutateAsync).not.toHaveBeenCalled();
      });

      // Form should show validation errors
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });

    it('converts code to uppercase', async () => {
      render(<ExpenseCategoryForm />);

      const codeInput = screen.getByLabelText('expenseCategory.code');
      fireEvent.change(codeInput, { target: { value: 'lowercase_code' } });

      expect(codeInput).toHaveValue('LOWERCASE_CODE');
    });
  });

  describe('Edit Mode', () => {
    const existingCategory = {
      id: 'existing-id',
      nameAr: 'تصنيف موجود',
      nameEn: 'Existing Category',
      code: 'EXISTING',
      level: 1,
      shopId: 'test-shop',
      isActive: true,
      isSystemCategory: false,
      parentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('renders form fields with existing data', () => {
      render(<ExpenseCategoryForm category={existingCategory} />);

      expect(screen.getByDisplayValue('تصنيف موجود')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing Category')).toBeInTheDocument();
      expect(screen.getByDisplayValue('EXISTING')).toBeInTheDocument();
      expect(screen.getByLabelText('expenseCategory.isActive')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'common.update' })).toBeInTheDocument();
    });

    it('submits form with updated data', async () => {
      const onSuccess = vi.fn();
      render(<ExpenseCategoryForm category={existingCategory} onSuccess={onSuccess} />);

      // Update the English name
      fireEvent.change(screen.getByDisplayValue('Existing Category'), {
        target: { value: 'Updated Category' },
      });

      mockUpdateMutateAsync.mockResolvedValue({
        ...existingCategory,
        nameEn: 'Updated Category',
      });

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: 'common.update' }));

      await waitFor(() => {
        expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
          id: existingCategory.id,
          nameAr: existingCategory.nameAr,
          nameEn: 'Updated Category',
          code: existingCategory.code,
          parentId: existingCategory.parentId,
          isActive: existingCategory.isActive,
        });
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('disables status toggle for system categories', () => {
      const systemCategory = {
        ...existingCategory,
        isSystemCategory: true,
      };

      render(<ExpenseCategoryForm category={systemCategory} />);

      const statusToggle = screen.getByLabelText(/expenseCategory.isActive/);
      expect(statusToggle).toBeDisabled();
      expect(screen.getByText(/expenseCategory.systemCategoryNote/)).toBeInTheDocument();
    });

    it('shows available parent options excluding self', () => {
      render(<ExpenseCategoryForm category={existingCategory} />);

      // Open parent selection
      fireEvent.click(screen.getByRole('combobox'));

      // Should show other categories but not itself
      expect(screen.getByText('ANOTHER - Another Category')).toBeInTheDocument();
      expect(screen.queryByText('EXISTING - Existing Category')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('prevents categories at level 3 from being parents', () => {
      render(<ExpenseCategoryForm />);

      // Open parent selection
      fireEvent.click(screen.getByRole('combobox'));

      // Level 3 category should not appear as option
      const level3Category = mockCategories.find(cat => cat.level === 3);
      if (level3Category) {
        expect(screen.queryByText(`${level3Category.code} - ${level3Category.nameEn}`)).not.toBeInTheDocument();
      }
    });

    it('handles form cancellation', () => {
      const onCancel = vi.fn();
      render(<ExpenseCategoryForm onCancel={onCancel} />);

      fireEvent.click(screen.getByRole('button', { name: 'common.cancel' }));

      expect(onCancel).toHaveBeenCalled();
    });

    it('shows loading state when submitting', async () => {
      mockCreateMutation.isLoading = true;
      (api.expenseCategory.createExpenseCategory.useMutation as any).mockReturnValue(mockCreateMutation);

      render(<ExpenseCategoryForm />);

      expect(screen.getByRole('button', { name: 'common.saving' })).toBeDisabled();
    });

    it('handles API errors gracefully', async () => {
      const { toast } = await import('../../../src/hooks/use-toast');

      render(<ExpenseCategoryForm />);

      // Fill in the form
      fireEvent.change(screen.getByLabelText('expenseCategory.nameAr'), {
        target: { value: 'تصنيف خطأ' },
      });
      fireEvent.change(screen.getByLabelText('expenseCategory.nameEn'), {
        target: { value: 'Error Category' },
      });
      fireEvent.change(screen.getByLabelText('expenseCategory.code'), {
        target: { value: 'ERROR_CAT' },
      });

      mockCreateMutateAsync.mockRejectedValue(new Error('Category code already exists'));

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: 'common.create' }));

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith({
          title: 'error.title',
          description: 'Category code already exists',
          variant: 'destructive',
        });
      });
    });
  });
});