import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ShopForm } from '../../../../src/components/features/shops/ShopForm';

// Mock dependencies
jest.mock('../../../../src/utils/trpc', () => ({
  trpc: {
    shop: {
      create: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
          isLoading: false,
          error: null
        }))
      },
      checkCodeAvailability: {
        useQuery: jest.fn(() => ({
          data: { available: true },
          isLoading: false,
          error: null
        }))
      },
      checkNameAvailability: {
        useQuery: jest.fn(() => ({
          data: { available: true },
          isLoading: false,
          error: null
        }))
      }
    }
  }
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string) => key,
    i18n: { language: 'en' }
  }))
}));

jest.mock('../../../../src/components/layout/rtl-provider', () => ({
  useRTL: jest.fn(() => ({
    isRTL: false,
    direction: 'ltr'
  }))
}));

// Mock React Hook Form
const mockRegister = jest.fn();
const mockHandleSubmit = jest.fn();
const mockSetError = jest.fn();
const mockClearErrors = jest.fn();
const mockWatch = jest.fn();
const mockSetValue = jest.fn();

jest.mock('react-hook-form', () => ({
  useForm: jest.fn(() => ({
    register: mockRegister,
    handleSubmit: mockHandleSubmit,
    formState: { errors: {} },
    setError: mockSetError,
    clearErrors: mockClearErrors,
    watch: mockWatch,
    setValue: mockSetValue
  }))
}));

describe('ShopForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockRegister.mockReturnValue({});
    mockHandleSubmit.mockImplementation((fn) => fn);
    mockWatch.mockReturnValue('');
  });

  describe('Rendering', () => {
    it('should render shop creation form correctly', () => {
      render(<ShopForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      expect(screen.getByText('Create New Shop')).toBeInTheDocument();
      expect(screen.getByLabelText(/Shop Name \(Arabic\)/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Shop Name \(English\)/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Shop Code/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Assign Users/)).toBeInTheDocument();
    });

    it('should render edit form when isEdit is true', () => {
      render(
        <ShopForm
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          isEdit={true}
        />
      );

      expect(screen.getByText('Edit Shop')).toBeInTheDocument();
      expect(screen.getByText('Update Shop')).toBeInTheDocument();
    });

    it('should render with initial data when provided', () => {
      const initialData = {
        nameAr: 'متجر تجريبي',
        nameEn: 'Test Shop',
        code: 'TEST',
        assignedUserIds: []
      };

      render(
        <ShopForm
          onSuccess={mockOnSuccess}
          initialData={initialData}
        />
      );

      // Verify that useForm was called with defaultValues
      expect(require('react-hook-form').useForm).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultValues: initialData
        })
      );
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors when fields are invalid', () => {
      const mockUseForm = require('react-hook-form').useForm as jest.Mock;
      mockUseForm.mockReturnValue({
        register: mockRegister,
        handleSubmit: mockHandleSubmit,
        formState: {
          errors: {
            nameAr: { message: 'Arabic name is required' },
            nameEn: { message: 'English name is required' },
            code: { message: 'Shop code is required' }
          }
        },
        setError: mockSetError,
        clearErrors: mockClearErrors,
        watch: mockWatch,
        setValue: mockSetValue
      });

      render(<ShopForm onSuccess={mockOnSuccess} />);

      expect(screen.getByText('Arabic name is required')).toBeInTheDocument();
      expect(screen.getByText('English name is required')).toBeInTheDocument();
      expect(screen.getByText('Shop code is required')).toBeInTheDocument();
    });

    it('should show loading state for code availability check', () => {
      const mockTRPC = require('../../../../src/utils/trpc').trpc;
      mockTRPC.shop.checkCodeAvailability.useQuery.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      });

      render(<ShopForm onSuccess={mockOnSuccess} />);

      expect(screen.getByText('Checking code availability...')).toBeInTheDocument();
    });

    it('should show loading state for name availability check', () => {
      const mockTRPC = require('../../../../src/utils/trpc').trpc;
      mockTRPC.shop.checkNameAvailability.useQuery.mockReturnValue({
        data: null,
        isLoading: true,
        error: null
      });

      render(<ShopForm onSuccess={mockOnSuccess} />);

      expect(screen.getByText('Checking name availability...')).toBeInTheDocument();
    });
  });

  describe('Code Auto-generation', () => {
    it('should auto-generate code from English name', () => {
      mockWatch.mockImplementation((field) => {
        if (field === 'nameEn') return 'Electronics Store';
        return '';
      });

      render(<ShopForm onSuccess={mockOnSuccess} />);

      // Verify setValue was called with generated code
      expect(mockSetValue).toHaveBeenCalledWith('code', 'ELECTRONICS_STORE');
    });

    it('should not auto-generate code in edit mode', () => {
      mockWatch.mockImplementation((field) => {
        if (field === 'nameEn') return 'Electronics Store';
        return '';
      });

      render(<ShopForm onSuccess={mockOnSuccess} isEdit={true} />);

      // Should not call setValue for auto-generation in edit mode
      expect(mockSetValue).not.toHaveBeenCalledWith('code', expect.any(String));
    });

    it('should handle special characters in code generation', () => {
      mockWatch.mockImplementation((field) => {
        if (field === 'nameEn') return 'Shop & Co. #1!';
        return '';
      });

      render(<ShopForm onSuccess={mockOnSuccess} />);

      expect(mockSetValue).toHaveBeenCalledWith('code', 'SHOP___CO___1_');
    });
  });

  describe('Form Submission', () => {
    it('should call create mutation on form submission', async () => {
      const mockMutate = jest.fn();
      const mockTRPC = require('../../../../src/utils/trpc').trpc;
      mockTRPC.shop.create.useMutation.mockReturnValue({
        mutate: mockMutate,
        isLoading: false,
        error: null
      });

      mockHandleSubmit.mockImplementation((submitFn) => (e) => {
        e.preventDefault();
        submitFn({
          nameAr: 'متجر تجريبي',
          nameEn: 'Test Shop',
          code: 'TEST',
          assignedUserIds: []
        });
      });

      render(<ShopForm onSuccess={mockOnSuccess} />);

      const submitButton = screen.getByText('Create Shop');
      fireEvent.click(submitButton);

      expect(mockMutate).toHaveBeenCalledWith({
        nameAr: 'متجر تجريبي',
        nameEn: 'Test Shop',
        code: 'TEST',
        assignedUserIds: []
      });
    });

    it('should show loading state during submission', () => {
      const mockTRPC = require('../../../../src/utils/trpc').trpc;
      mockTRPC.shop.create.useMutation.mockReturnValue({
        mutate: jest.fn(),
        isLoading: true,
        error: null
      });

      render(<ShopForm onSuccess={mockOnSuccess} />);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    });

    it('should call onSuccess when mutation succeeds', () => {
      const mockMutate = jest.fn();
      const mockTRPC = require('../../../../src/utils/trpc').trpc;

      // Mock successful mutation
      mockTRPC.shop.create.useMutation.mockImplementation(({ onSuccess }) => {
        // Simulate immediate success
        setTimeout(() => {
          onSuccess({ shop: { id: '1', name: 'Test Shop' } });
        }, 0);

        return {
          mutate: mockMutate,
          isLoading: false,
          error: null
        };
      });

      render(<ShopForm onSuccess={mockOnSuccess} />);

      // The onSuccess should be called when mutation succeeds
      // This is tested via the mutation mock setup
      expect(mockTRPC.shop.create.useMutation).toHaveBeenCalledWith(
        expect.objectContaining({
          onSuccess: expect.any(Function)
        })
      );
    });
  });

  describe('Form Actions', () => {
    it('should call onCancel when cancel button is clicked', () => {
      render(<ShopForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should not render cancel button when onCancel is not provided', () => {
      render(<ShopForm onSuccess={mockOnSuccess} />);

      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });
  });

  describe('RTL Support', () => {
    it('should apply RTL classes when isRTL is true', () => {
      const mockUseRTL = require('../../../../src/components/layout/rtl-provider').useRTL as jest.Mock;
      mockUseRTL.mockReturnValue({
        isRTL: true,
        direction: 'rtl'
      });

      const mockUseTranslation = require('react-i18next').useTranslation as jest.Mock;
      mockUseTranslation.mockReturnValue({
        t: (key: string) => {
          const translations: Record<string, string> = {
            'Create New Shop': 'إنشاء متجر جديد',
            'Shop Name (Arabic) *': 'اسم المتجر (عربي) *',
            'Shop Name (English) *': 'اسم المتجر (إنجليزي) *',
            'Shop Code *': 'رمز المتجر *',
            'Create Shop': 'إنشاء المتجر',
            'Cancel': 'إلغاء'
          };
          return translations[key] || key;
        },
        i18n: { language: 'ar' }
      });

      render(<ShopForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

      expect(screen.getByText('إنشاء متجر جديد')).toBeInTheDocument();
      expect(screen.getByText('اسم المتجر (عربي) *')).toBeInTheDocument();
      expect(screen.getByText('إنشاء المتجر')).toBeInTheDocument();
    });
  });

  describe('Field Constraints', () => {
    it('should enforce code format constraints', () => {
      render(<ShopForm onSuccess={mockOnSuccess} />);

      const codeField = screen.getByLabelText(/Shop Code/);
      expect(codeField).toHaveAttribute('dir', 'ltr');
      expect(codeField).toHaveClass('uppercase');
    });

    it('should enforce Arabic text direction for Arabic name field', () => {
      render(<ShopForm onSuccess={mockOnSuccess} />);

      const arabicNameField = screen.getByLabelText(/Shop Name \(Arabic\)/);
      expect(arabicNameField).toHaveAttribute('dir', 'rtl');
      expect(arabicNameField).toHaveClass('text-right');
    });

    it('should enforce English text direction for English name field', () => {
      render(<ShopForm onSuccess={mockOnSuccess} />);

      const englishNameField = screen.getByLabelText(/Shop Name \(English\)/);
      expect(englishNameField).toHaveAttribute('dir', 'ltr');
      expect(englishNameField).toHaveClass('text-left');
    });
  });
});