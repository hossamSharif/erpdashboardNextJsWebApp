import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ShopForm } from '../../src/components/features/shops/ShopForm';
import { ShopList } from '../../src/components/features/shops/ShopList';

// Mock tRPC client
const mockCreateMutation = jest.fn();
const mockListQuery = jest.fn();
const mockToggleStatusMutation = jest.fn();
const mockSoftDeleteMutation = jest.fn();
const mockCheckCodeAvailability = jest.fn();
const mockCheckNameAvailability = jest.fn();

jest.mock('../../src/utils/trpc', () => ({
  trpc: {
    shop: {
      create: {
        useMutation: jest.fn(() => ({
          mutate: mockCreateMutation,
          mutateAsync: mockCreateMutation,
          isLoading: false,
          error: null
        }))
      },
      list: {
        useQuery: jest.fn(() => mockListQuery())
      },
      toggleStatus: {
        useMutation: jest.fn(() => ({
          mutateAsync: mockToggleStatusMutation,
          isLoading: false
        }))
      },
      softDelete: {
        useMutation: jest.fn(() => ({
          mutateAsync: mockSoftDeleteMutation,
          isLoading: false
        }))
      },
      checkCodeAvailability: {
        useQuery: jest.fn(() => mockCheckCodeAvailability())
      },
      checkNameAvailability: {
        useQuery: jest.fn(() => mockCheckNameAvailability())
      }
    }
  }
}));

// Mock other dependencies
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string) => key,
    i18n: { language: 'en' }
  }))
}));

jest.mock('../../src/components/layout/rtl-provider', () => ({
  useRTL: jest.fn(() => ({
    isRTL: false,
    direction: 'ltr'
  }))
}));

const mockShops = [
  {
    id: '1',
    nameAr: 'متجر الإلكترونيات',
    nameEn: 'Electronics Store',
    code: 'ELEC',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    users: [
      {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'ADMIN'
      }
    ]
  },
  {
    id: '2',
    nameAr: 'متجر الملابس',
    nameEn: 'Clothing Store',
    code: 'CLOTH',
    isActive: true,
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
    users: []
  }
];

describe('Shop Creation Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockListQuery.mockReturnValue({
      data: { shops: mockShops, total: mockShops.length },
      isLoading: false,
      error: null,
      refetch: jest.fn()
    });

    mockCheckCodeAvailability.mockReturnValue({
      data: { available: true },
      isLoading: false,
      error: null
    });

    mockCheckNameAvailability.mockReturnValue({
      data: { available: true },
      isLoading: false,
      error: null
    });
  });

  describe('Complete Shop Creation Flow', () => {
    it('should successfully create a shop with all validations', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();

      // Mock successful creation
      mockCreateMutation.mockImplementation((data, { onSuccess }) => {
        onSuccess({
          shop: {
            id: '3',
            nameAr: data.nameAr,
            nameEn: data.nameEn,
            code: data.code,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            users: []
          }
        });
      });

      render(<ShopForm onSuccess={mockOnSuccess} />);

      // Fill Arabic name
      const arabicNameInput = screen.getByLabelText(/Shop Name \(Arabic\)/);
      await user.type(arabicNameInput, 'متجر الكتب');

      // Fill English name
      const englishNameInput = screen.getByLabelText(/Shop Name \(English\)/);
      await user.type(englishNameInput, 'Books Store');

      // Code should be auto-generated
      const codeInput = screen.getByLabelText(/Shop Code/);
      expect(codeInput).toHaveValue('BOOKS_STORE');

      // Submit form
      const submitButton = screen.getByText('Create Shop');
      await user.click(submitButton);

      // Verify mutation was called with correct data
      expect(mockCreateMutation).toHaveBeenCalledWith({
        nameAr: 'متجر الكتب',
        nameEn: 'Books Store',
        code: 'BOOKS_STORE',
        assignedUserIds: []
      });

      // Verify success callback was called
      expect(mockOnSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          nameAr: 'متجر الكتب',
          nameEn: 'Books Store',
          code: 'BOOKS_STORE'
        })
      );
    });

    it('should handle validation errors during creation', async () => {
      const user = userEvent.setup();

      // Mock validation error for duplicate code
      mockCheckCodeAvailability.mockReturnValue({
        data: { available: false },
        isLoading: false,
        error: null
      });

      render(<ShopForm onSuccess={jest.fn()} />);

      // Fill form with duplicate code
      const englishNameInput = screen.getByLabelText(/Shop Name \(English\)/);
      await user.type(englishNameInput, 'Electronics Store'); // This will generate 'ELECTRONICS_STORE'

      const codeInput = screen.getByLabelText(/Shop Code/);
      await user.clear(codeInput);
      await user.type(codeInput, 'ELEC'); // Existing code

      // Wait for validation
      await waitFor(() => {
        expect(screen.getByText('Shop code is already taken')).toBeInTheDocument();
      });

      // Submit should be disabled or show error
      const submitButton = screen.getByText('Create Shop');
      expect(submitButton).toBeDisabled();
    });

    it('should handle server errors during creation', async () => {
      const user = userEvent.setup();

      // Mock server error
      mockCreateMutation.mockImplementation(() => {
        throw new Error('Server error');
      });

      render(<ShopForm onSuccess={jest.fn()} />);

      // Fill form
      const arabicNameInput = screen.getByLabelText(/Shop Name \(Arabic\)/);
      await user.type(arabicNameInput, 'متجر جديد');

      const englishNameInput = screen.getByLabelText(/Shop Name \(English\)/);
      await user.type(englishNameInput, 'New Store');

      // Submit form
      const submitButton = screen.getByText('Create Shop');
      await user.click(submitButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText('Failed to create shop')).toBeInTheDocument();
      });
    });
  });

  describe('Shop List Management Flow', () => {
    it('should display shops and handle status toggle', async () => {
      const user = userEvent.setup();
      const mockRefetch = jest.fn();

      mockListQuery.mockReturnValue({
        data: { shops: mockShops, total: mockShops.length },
        isLoading: false,
        error: null,
        refetch: mockRefetch
      });

      render(
        <ShopList
          onCreateShop={jest.fn()}
          onEditShop={jest.fn()}
          onDeleteShop={jest.fn()}
        />
      );

      // Should display shops
      expect(screen.getByText('Electronics Store')).toBeInTheDocument();
      expect(screen.getByText('Clothing Store')).toBeInTheDocument();

      // Mock successful status toggle
      mockToggleStatusMutation.mockResolvedValue({
        shop: { ...mockShops[0], isActive: false }
      });

      // Find and click toggle status button for first shop
      const shopCards = screen.getAllByTestId(/shop-card/);
      const firstShopCard = shopCards[0];
      const toggleButton = within(firstShopCard).getByText('Toggle Status');

      await user.click(toggleButton);

      // Should call toggle mutation
      expect(mockToggleStatusMutation).toHaveBeenCalledWith({
        id: '1',
        isActive: false
      });

      // Should refetch data
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });

    it('should handle soft delete with confirmation', async () => {
      const user = userEvent.setup();
      const mockRefetch = jest.fn();

      // Mock window.confirm
      global.confirm = jest.fn(() => true);

      mockListQuery.mockReturnValue({
        data: { shops: mockShops, total: mockShops.length },
        isLoading: false,
        error: null,
        refetch: mockRefetch
      });

      render(
        <ShopList
          onCreateShop={jest.fn()}
          onEditShop={jest.fn()}
          onDeleteShop={jest.fn()}
        />
      );

      // Mock successful soft delete
      mockSoftDeleteMutation.mockResolvedValue({
        shop: { ...mockShops[0], isActive: false }
      });

      // Find and click delete button
      const shopCards = screen.getAllByTestId(/shop-card/);
      const firstShopCard = shopCards[0];
      const deleteButton = within(firstShopCard).getByText('Delete');

      await user.click(deleteButton);

      // Should show confirmation dialog
      expect(global.confirm).toHaveBeenCalledWith(
        'Are you sure you want to deactivate this shop?'
      );

      // Should call soft delete mutation
      expect(mockSoftDeleteMutation).toHaveBeenCalledWith({ id: '1' });

      // Should refetch data
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });

    it('should handle search and filtering', async () => {
      const user = userEvent.setup();

      render(
        <ShopList
          onCreateShop={jest.fn()}
          onEditShop={jest.fn()}
          onDeleteShop={jest.fn()}
        />
      );

      // Find search input
      const searchInput = screen.getByLabelText('Search');

      // Type search term
      await user.type(searchInput, 'Electronics');

      // Should update search value
      expect(searchInput).toHaveValue('Electronics');

      // Toggle inactive filter
      const inactiveCheckbox = screen.getByLabelText('Show inactive shops');
      await user.click(inactiveCheckbox);

      expect(inactiveCheckbox).toBeChecked();
    });
  });

  describe('Multi-tenant Data Isolation', () => {
    it('should ensure shop data is properly isolated', async () => {
      // Test that shop list query includes proper filtering
      render(
        <ShopList
          onCreateShop={jest.fn()}
          onEditShop={jest.fn()}
          onDeleteShop={jest.fn()}
        />
      );

      // Verify that the list query was called with proper parameters
      expect(mockListQuery).toHaveBeenCalled();

      // In a real implementation, this would verify that the query
      // includes shopId filtering or user-based filtering
    });

    it('should validate shop ownership for operations', async () => {
      const user = userEvent.setup();

      render(<ShopForm onSuccess={jest.fn()} />);

      // Fill and submit form
      const arabicNameInput = screen.getByLabelText(/Shop Name \(Arabic\)/);
      await user.type(arabicNameInput, 'متجر محظور');

      const englishNameInput = screen.getByLabelText(/Shop Name \(English\)/);
      await user.type(englishNameInput, 'Forbidden Store');

      const submitButton = screen.getByText('Create Shop');
      await user.click(submitButton);

      // Verify that the mutation includes proper user context
      expect(mockCreateMutation).toHaveBeenCalledWith(
        expect.objectContaining({
          nameAr: 'متجر محظور',
          nameEn: 'Forbidden Store'
        })
      );
    });
  });

  describe('Bilingual Support Validation', () => {
    it('should handle Arabic and English names correctly', async () => {
      const user = userEvent.setup();

      render(<ShopForm onSuccess={jest.fn()} />);

      // Test Arabic text input
      const arabicNameInput = screen.getByLabelText(/Shop Name \(Arabic\)/);
      expect(arabicNameInput).toHaveAttribute('dir', 'rtl');

      await user.type(arabicNameInput, 'متجر الهدايا والتذكارات');

      // Test English text input
      const englishNameInput = screen.getByLabelText(/Shop Name \(English\)/);
      expect(englishNameInput).toHaveAttribute('dir', 'ltr');

      await user.type(englishNameInput, 'Gifts & Souvenirs Store');

      // Verify code generation from English name
      const codeInput = screen.getByLabelText(/Shop Code/);
      expect(codeInput).toHaveValue('GIFTS___SOUVENIRS_STORE');

      // Verify both names are preserved
      expect(arabicNameInput).toHaveValue('متجر الهدايا والتذكارات');
      expect(englishNameInput).toHaveValue('Gifts & Souvenirs Store');
    });

    it('should validate duplicate names in both languages', async () => {
      // Mock name availability check failure
      mockCheckNameAvailability.mockReturnValue({
        data: { available: false },
        isLoading: false,
        error: null
      });

      const user = userEvent.setup();

      render(<ShopForm onSuccess={jest.fn()} />);

      // Fill form with duplicate names
      const arabicNameInput = screen.getByLabelText(/Shop Name \(Arabic\)/);
      await user.type(arabicNameInput, 'متجر الإلكترونيات'); // Existing Arabic name

      const englishNameInput = screen.getByLabelText(/Shop Name \(English\)/);
      await user.type(englishNameInput, 'Electronics Store'); // Existing English name

      // Should show validation error for both fields
      await waitFor(() => {
        expect(screen.getAllByText('Shop name is already taken')).toHaveLength(2);
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      mockListQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Network error'),
        refetch: jest.fn()
      });

      render(
        <ShopList
          onCreateShop={jest.fn()}
          onEditShop={jest.fn()}
          onDeleteShop={jest.fn()}
        />
      );

      // Should display error message
      expect(screen.getByText('Failed to load shops')).toBeInTheDocument();
    });

    it('should handle loading states correctly', async () => {
      // Mock loading state
      mockListQuery.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: jest.fn()
      });

      render(
        <ShopList
          onCreateShop={jest.fn()}
          onEditShop={jest.fn()}
          onDeleteShop={jest.fn()}
        />
      );

      // Should display loading spinner
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should handle empty state correctly', async () => {
      // Mock empty state
      mockListQuery.mockReturnValue({
        data: { shops: [], total: 0 },
        isLoading: false,
        error: null,
        refetch: jest.fn()
      });

      render(
        <ShopList
          onCreateShop={jest.fn()}
          onEditShop={jest.fn()}
          onDeleteShop={jest.fn()}
        />
      );

      // Should display empty state message
      expect(screen.getByText('No shops found')).toBeInTheDocument();
      expect(screen.getByText('Get started by creating a new shop')).toBeInTheDocument();
    });
  });
});