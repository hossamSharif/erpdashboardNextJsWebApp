import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ShopList } from '../../../../src/components/features/shops/ShopList';

// Mock dependencies
const mockRefetch = jest.fn();
const mockMutateAsync = jest.fn();

jest.mock('../../../../src/utils/trpc', () => ({
  trpc: {
    shop: {
      list: {
        useQuery: jest.fn(() => ({
          data: {
            shops: [
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
                isActive: false,
                createdAt: '2023-01-02T00:00:00Z',
                updatedAt: '2023-01-02T00:00:00Z',
                users: []
              }
            ],
            total: 2
          },
          isLoading: false,
          error: null,
          refetch: mockRefetch
        }))
      },
      toggleStatus: {
        useMutation: jest.fn(() => ({
          mutateAsync: mockMutateAsync,
          isLoading: false
        }))
      },
      softDelete: {
        useMutation: jest.fn(() => ({
          mutateAsync: mockMutateAsync,
          isLoading: false
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

// Mock ShopCard component
jest.mock('../../../../src/components/features/shops/ShopCard', () => ({
  ShopCard: ({ shop, onEdit, onDelete, onToggleStatus }: any) => (
    <div data-testid={`shop-card-${shop.id}`}>
      <h3>{shop.nameEn}</h3>
      <p>{shop.code}</p>
      <button onClick={() => onEdit?.(shop)}>Edit</button>
      <button onClick={() => onDelete?.(shop)}>Delete</button>
      <button onClick={() => onToggleStatus?.(shop)}>Toggle Status</button>
    </div>
  )
}));

describe('ShopList', () => {
  const mockOnCreateShop = jest.fn();
  const mockOnEditShop = jest.fn();
  const mockOnDeleteShop = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render shop list with header and create button', () => {
      render(
        <ShopList
          onCreateShop={mockOnCreateShop}
          onEditShop={mockOnEditShop}
          onDeleteShop={mockOnDeleteShop}
          showCreateButton={true}
        />
      );

      expect(screen.getByText('Shop Management')).toBeInTheDocument();
      expect(screen.getByText('Create New Shop')).toBeInTheDocument();
      expect(screen.getByLabelText('Search')).toBeInTheDocument();
      expect(screen.getByLabelText('Show inactive shops')).toBeInTheDocument();
    });

    it('should not render create button when showCreateButton is false', () => {
      render(
        <ShopList
          onEditShop={mockOnEditShop}
          onDeleteShop={mockOnDeleteShop}
          showCreateButton={false}
        />
      );

      expect(screen.queryByText('Create New Shop')).not.toBeInTheDocument();
    });

    it('should render shop cards', () => {
      render(
        <ShopList
          onCreateShop={mockOnCreateShop}
          onEditShop={mockOnEditShop}
          onDeleteShop={mockOnDeleteShop}
        />
      );

      expect(screen.getByTestId('shop-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('shop-card-2')).toBeInTheDocument();
      expect(screen.getByText('Electronics Store')).toBeInTheDocument();
      expect(screen.getByText('Clothing Store')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should handle search input changes', async () => {
      const user = userEvent.setup();

      render(
        <ShopList
          onCreateShop={mockOnCreateShop}
          onEditShop={mockOnEditShop}
          onDeleteShop={mockOnDeleteShop}
        />
      );

      const searchInput = screen.getByLabelText('Search');

      await user.type(searchInput, 'Electronics');

      expect(searchInput).toHaveValue('Electronics');
    });

    it('should update query parameters when searching', async () => {
      const user = userEvent.setup();
      const mockUseQuery = require('../../../../src/utils/trpc').trpc.shop.list.useQuery;

      render(
        <ShopList
          onCreateShop={mockOnCreateShop}
          onEditShop={mockOnEditShop}
          onDeleteShop={mockOnDeleteShop}
        />
      );

      const searchInput = screen.getByLabelText('Search');

      await user.type(searchInput, 'Electronics');

      // The useQuery should be called with search parameter
      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Electronics',
          includeInactive: false,
          limit: 10,
          offset: 0
        })
      );
    });
  });

  describe('Filter Functionality', () => {
    it('should handle include inactive toggle', async () => {
      const user = userEvent.setup();

      render(
        <ShopList
          onCreateShop={mockOnCreateShop}
          onEditShop={mockOnEditShop}
          onDeleteShop={mockOnDeleteShop}
        />
      );

      const checkbox = screen.getByLabelText('Show inactive shops');

      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it('should update query when toggling inactive filter', async () => {
      const user = userEvent.setup();
      const mockUseQuery = require('../../../../src/utils/trpc').trpc.shop.list.useQuery;

      render(
        <ShopList
          onCreateShop={mockOnCreateShop}
          onEditShop={mockOnEditShop}
          onDeleteShop={mockOnDeleteShop}
        />
      );

      const checkbox = screen.getByLabelText('Show inactive shops');

      await user.click(checkbox);

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          includeInactive: true
        })
      );
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner when loading', () => {
      const mockTRPC = require('../../../../src/utils/trpc').trpc;
      mockTRPC.shop.list.useQuery.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: mockRefetch
      });

      render(
        <ShopList
          onCreateShop={mockOnCreateShop}
          onEditShop={mockOnEditShop}
          onDeleteShop={mockOnDeleteShop}
        />
      );

      expect(screen.getByRole('generic', { name: /loading/i }) ||
             document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should show error message when there is an error', () => {
      const mockTRPC = require('../../../../src/utils/trpc').trpc;
      mockTRPC.shop.list.useQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch'),
        refetch: mockRefetch
      });

      render(
        <ShopList
          onCreateShop={mockOnCreateShop}
          onEditShop={mockOnEditShop}
          onDeleteShop={mockOnDeleteShop}
        />
      );

      expect(screen.getByText('Failed to load shops')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no shops exist', () => {
      const mockTRPC = require('../../../../src/utils/trpc').trpc;
      mockTRPC.shop.list.useQuery.mockReturnValue({
        data: { shops: [], total: 0 },
        isLoading: false,
        error: null,
        refetch: mockRefetch
      });

      render(
        <ShopList
          onCreateShop={mockOnCreateShop}
          onEditShop={mockOnEditShop}
          onDeleteShop={mockOnDeleteShop}
        />
      );

      expect(screen.getByText('No shops found')).toBeInTheDocument();
      expect(screen.getByText('Get started by creating a new shop')).toBeInTheDocument();
    });

    it('should show no results message when search returns empty', () => {
      const mockTRPC = require('../../../../src/utils/trpc').trpc;
      mockTRPC.shop.list.useQuery.mockReturnValue({
        data: { shops: [], total: 0 },
        isLoading: false,
        error: null,
        refetch: mockRefetch
      });

      render(
        <ShopList
          onCreateShop={mockOnCreateShop}
          onEditShop={mockOnEditShop}
          onDeleteShop={mockOnDeleteShop}
        />
      );

      // Simulate search state
      const searchInput = screen.getByLabelText('Search');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      expect(screen.getByText('No results found for your search')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should show pagination when total pages > 1', () => {
      const mockTRPC = require('../../../../src/utils/trpc').trpc;
      mockTRPC.shop.list.useQuery.mockReturnValue({
        data: {
          shops: Array(10).fill(null).map((_, i) => ({
            id: `${i + 1}`,
            nameEn: `Shop ${i + 1}`,
            nameAr: `متجر ${i + 1}`,
            code: `SHOP${i + 1}`,
            isActive: true,
            users: []
          })),
          total: 25 // More than 10 items per page
        },
        isLoading: false,
        error: null,
        refetch: mockRefetch
      });

      render(
        <ShopList
          onCreateShop={mockOnCreateShop}
          onEditShop={mockOnEditShop}
          onDeleteShop={mockOnDeleteShop}
        />
      );

      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    it('should handle pagination navigation', async () => {
      const user = userEvent.setup();
      const mockTRPC = require('../../../../src/utils/trpc').trpc;
      mockTRPC.shop.list.useQuery.mockReturnValue({
        data: {
          shops: Array(10).fill(null).map((_, i) => ({
            id: `${i + 1}`,
            nameEn: `Shop ${i + 1}`,
            nameAr: `متجر ${i + 1}`,
            code: `SHOP${i + 1}`,
            isActive: true,
            users: []
          })),
          total: 25
        },
        isLoading: false,
        error: null,
        refetch: mockRefetch
      });

      render(
        <ShopList
          onCreateShop={mockOnCreateShop}
          onEditShop={mockOnEditShop}
          onDeleteShop={mockOnDeleteShop}
        />
      );

      const nextButton = screen.getByText('Next');
      await user.click(nextButton);

      // Should update offset for next page
      expect(mockTRPC.shop.list.useQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          offset: 10
        })
      );
    });
  });

  describe('Shop Actions', () => {
    it('should handle create shop action', async () => {
      const user = userEvent.setup();

      render(
        <ShopList
          onCreateShop={mockOnCreateShop}
          onEditShop={mockOnEditShop}
          onDeleteShop={mockOnDeleteShop}
        />
      );

      const createButton = screen.getByText('Create New Shop');
      await user.click(createButton);

      expect(mockOnCreateShop).toHaveBeenCalled();
    });

    it('should handle toggle shop status', async () => {
      global.confirm = jest.fn(() => true);

      render(
        <ShopList
          onCreateShop={mockOnCreateShop}
          onEditShop={mockOnEditShop}
          onDeleteShop={mockOnDeleteShop}
        />
      );

      const toggleButton = screen.getAllByText('Toggle Status')[0];
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          id: '1',
          isActive: false // Should toggle the current status
        });
      });
    });

    it('should handle soft delete with confirmation', async () => {
      global.confirm = jest.fn(() => true);

      render(
        <ShopList
          onCreateShop={mockOnCreateShop}
          onEditShop={mockOnEditShop}
          onDeleteShop={mockOnDeleteShop}
        />
      );

      const deleteButton = screen.getAllByText('Delete')[0];
      fireEvent.click(deleteButton);

      expect(global.confirm).toHaveBeenCalledWith(
        'Are you sure you want to deactivate this shop?'
      );

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({ id: '1' });
      });
    });

    it('should not delete when confirmation is cancelled', async () => {
      global.confirm = jest.fn(() => false);

      render(
        <ShopList
          onCreateShop={mockOnCreateShop}
          onEditShop={mockOnEditShop}
          onDeleteShop={mockOnDeleteShop}
        />
      );

      const deleteButton = screen.getAllByText('Delete')[0];
      fireEvent.click(deleteButton);

      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });

  describe('Results Summary', () => {
    it('should show results summary', () => {
      render(
        <ShopList
          onCreateShop={mockOnCreateShop}
          onEditShop={mockOnEditShop}
          onDeleteShop={mockOnDeleteShop}
        />
      );

      expect(screen.getByText('Showing 2 of 2 shops')).toBeInTheDocument();
    });
  });
});