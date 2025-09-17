import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useShopStore } from '../../../src/stores/shop.store';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

const mockShop1 = {
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
};

const mockShop2 = {
  id: '2',
  nameAr: 'متجر الملابس',
  nameEn: 'Clothing Store',
  code: 'CLOTH',
  isActive: false,
  createdAt: '2023-01-02T00:00:00Z',
  updatedAt: '2023-01-02T00:00:00Z',
  users: []
};

describe('useShopStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);

    // Reset store state
    useShopStore.setState({
      currentShop: null,
      availableShops: [],
      isLoading: false,
      isChangingShop: false,
      error: null
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useShopStore());

      expect(result.current.currentShop).toBeNull();
      expect(result.current.availableShops).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isChangingShop).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('setCurrentShop', () => {
    it('should set current shop and clear error', () => {
      const { result } = renderHook(() => useShopStore());

      act(() => {
        result.current.setCurrentShop(mockShop1);
      });

      expect(result.current.currentShop).toEqual(mockShop1);
      expect(result.current.error).toBeNull();
    });

    it('should set current shop to null', () => {
      const { result } = renderHook(() => useShopStore());

      // First set a shop
      act(() => {
        result.current.setCurrentShop(mockShop1);
      });

      // Then clear it
      act(() => {
        result.current.setCurrentShop(null);
      });

      expect(result.current.currentShop).toBeNull();
    });
  });

  describe('setAvailableShops', () => {
    it('should set available shops', () => {
      const { result } = renderHook(() => useShopStore());

      act(() => {
        result.current.setAvailableShops([mockShop1, mockShop2]);
      });

      expect(result.current.availableShops).toEqual([mockShop1, mockShop2]);
    });
  });

  describe('switchShop', () => {
    it('should switch to existing shop', () => {
      const { result } = renderHook(() => useShopStore());

      // Setup available shops
      act(() => {
        result.current.setAvailableShops([mockShop1, mockShop2]);
      });

      // Switch to shop
      act(() => {
        result.current.switchShop('1');
      });

      expect(result.current.currentShop).toEqual(mockShop1);
      expect(result.current.isChangingShop).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should set error when switching to non-existent shop', () => {
      const { result } = renderHook(() => useShopStore());

      // Setup available shops
      act(() => {
        result.current.setAvailableShops([mockShop1, mockShop2]);
      });

      // Try to switch to non-existent shop
      act(() => {
        result.current.switchShop('999');
      });

      expect(result.current.currentShop).toBeNull();
      expect(result.current.error).toBe('Shop not found');
      expect(result.current.isChangingShop).toBe(false);
    });

    it('should reset isChangingShop after timeout', (done) => {
      jest.useFakeTimers();

      const { result } = renderHook(() => useShopStore());

      // Setup available shops
      act(() => {
        result.current.setAvailableShops([mockShop1, mockShop2]);
      });

      // Switch to shop
      act(() => {
        result.current.switchShop('1');
      });

      expect(result.current.isChangingShop).toBe(true);

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Check that isChangingShop is reset
      setTimeout(() => {
        expect(result.current.isChangingShop).toBe(false);
        jest.useRealTimers();
        done();
      }, 0);
    });
  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => useShopStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const { result } = renderHook(() => useShopStore());

      act(() => {
        result.current.setError('Test error');
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('clearShopContext', () => {
    it('should clear all shop context', () => {
      const { result } = renderHook(() => useShopStore());

      // Setup some state
      act(() => {
        result.current.setCurrentShop(mockShop1);
        result.current.setAvailableShops([mockShop1, mockShop2]);
        result.current.setLoading(true);
        result.current.setError('Test error');
      });

      // Clear context
      act(() => {
        result.current.clearShopContext();
      });

      expect(result.current.currentShop).toBeNull();
      expect(result.current.availableShops).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isChangingShop).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('updateShopInList', () => {
    it('should update shop in available shops list', () => {
      const { result } = renderHook(() => useShopStore());

      // Setup shops
      act(() => {
        result.current.setAvailableShops([mockShop1, mockShop2]);
      });

      // Update shop
      act(() => {
        result.current.updateShopInList('1', { nameEn: 'Updated Electronics Store' });
      });

      const updatedShop = result.current.availableShops.find(shop => shop.id === '1');
      expect(updatedShop?.nameEn).toBe('Updated Electronics Store');
      expect(updatedShop?.nameAr).toBe(mockShop1.nameAr); // Should preserve other fields
    });

    it('should update current shop if it matches the updated shop', () => {
      const { result } = renderHook(() => useShopStore());

      // Setup shops and current shop
      act(() => {
        result.current.setAvailableShops([mockShop1, mockShop2]);
        result.current.setCurrentShop(mockShop1);
      });

      // Update shop
      act(() => {
        result.current.updateShopInList('1', { nameEn: 'Updated Electronics Store' });
      });

      expect(result.current.currentShop?.nameEn).toBe('Updated Electronics Store');
    });

    it('should not affect unrelated shops', () => {
      const { result } = renderHook(() => useShopStore());

      // Setup shops
      act(() => {
        result.current.setAvailableShops([mockShop1, mockShop2]);
      });

      // Update shop
      act(() => {
        result.current.updateShopInList('1', { nameEn: 'Updated Electronics Store' });
      });

      const unchangedShop = result.current.availableShops.find(shop => shop.id === '2');
      expect(unchangedShop).toEqual(mockShop2);
    });
  });

  describe('removeShopFromList', () => {
    it('should remove shop from available shops', () => {
      const { result } = renderHook(() => useShopStore());

      // Setup shops
      act(() => {
        result.current.setAvailableShops([mockShop1, mockShop2]);
      });

      // Remove shop
      act(() => {
        result.current.removeShopFromList('1');
      });

      expect(result.current.availableShops).toEqual([mockShop2]);
    });

    it('should clear current shop if it matches removed shop', () => {
      const { result } = renderHook(() => useShopStore());

      // Setup shops and current shop
      act(() => {
        result.current.setAvailableShops([mockShop1, mockShop2]);
        result.current.setCurrentShop(mockShop1);
      });

      // Remove current shop
      act(() => {
        result.current.removeShopFromList('1');
      });

      expect(result.current.currentShop).toBeNull();
      expect(result.current.availableShops).toEqual([mockShop2]);
    });

    it('should not clear current shop if different shop is removed', () => {
      const { result } = renderHook(() => useShopStore());

      // Setup shops and current shop
      act(() => {
        result.current.setAvailableShops([mockShop1, mockShop2]);
        result.current.setCurrentShop(mockShop1);
      });

      // Remove different shop
      act(() => {
        result.current.removeShopFromList('2');
      });

      expect(result.current.currentShop).toEqual(mockShop1);
      expect(result.current.availableShops).toEqual([mockShop1]);
    });
  });

  describe('addShopToList', () => {
    it('should add new shop to available shops', () => {
      const { result } = renderHook(() => useShopStore());

      // Setup existing shops
      act(() => {
        result.current.setAvailableShops([mockShop1]);
      });

      // Add new shop
      act(() => {
        result.current.addShopToList(mockShop2);
      });

      expect(result.current.availableShops).toEqual([mockShop1, mockShop2]);
    });

    it('should update existing shop if it already exists', () => {
      const { result } = renderHook(() => useShopStore());

      // Setup existing shops
      act(() => {
        result.current.setAvailableShops([mockShop1, mockShop2]);
      });

      // Add updated version of existing shop
      const updatedShop1 = { ...mockShop1, nameEn: 'Updated Electronics Store' };
      act(() => {
        result.current.addShopToList(updatedShop1);
      });

      expect(result.current.availableShops).toHaveLength(2);
      const updatedShop = result.current.availableShops.find(shop => shop.id === '1');
      expect(updatedShop?.nameEn).toBe('Updated Electronics Store');
    });
  });
});