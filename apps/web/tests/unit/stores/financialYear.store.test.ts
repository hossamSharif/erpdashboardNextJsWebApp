import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFinancialYearStore } from '@/stores/financialYear.store';
import type { FinancialYearWithCounts, FinancialYear } from '@multi-shop/shared';

describe('FinancialYearStore', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useFinancialYearStore.getState().reset();
    });
  });

  const mockFinancialYear: FinancialYearWithCounts = {
    id: 'fy-1',
    name: 'FY 2024',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    openingStockValue: 10000,
    closingStockValue: null,
    isCurrent: false,
    isClosed: false,
    shopId: 'shop-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { transactions: 5 },
  };

  const mockCurrentYear: FinancialYearWithCounts = {
    ...mockFinancialYear,
    id: 'fy-current',
    name: 'Current FY',
    isCurrent: true,
  };

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useFinancialYearStore());

      expect(result.current.financialYears).toEqual([]);
      expect(result.current.currentFinancialYear).toBeNull();
      expect(result.current.selectedFinancialYear).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('setFinancialYears', () => {
    it('should set financial years and current year', () => {
      const { result } = renderHook(() => useFinancialYearStore());
      const years = [mockCurrentYear, mockFinancialYear];

      act(() => {
        result.current.setFinancialYears(years);
      });

      expect(result.current.financialYears).toEqual(years);
      expect(result.current.currentFinancialYear).toEqual(mockCurrentYear);
    });

    it('should set current year to null if no current year exists', () => {
      const { result } = renderHook(() => useFinancialYearStore());
      const years = [mockFinancialYear];

      act(() => {
        result.current.setFinancialYears(years);
      });

      expect(result.current.financialYears).toEqual(years);
      expect(result.current.currentFinancialYear).toBeNull();
    });
  });

  describe('setCurrentFinancialYear', () => {
    it('should set current financial year and update list', () => {
      const { result } = renderHook(() => useFinancialYearStore());

      // Set initial years
      act(() => {
        result.current.setFinancialYears([mockFinancialYear, mockCurrentYear]);
      });

      // Change current year
      act(() => {
        result.current.setCurrentFinancialYear(mockFinancialYear);
      });

      expect(result.current.currentFinancialYear).toEqual(mockFinancialYear);

      // Check that the list is updated
      const updatedYear = result.current.financialYears.find(y => y.id === mockFinancialYear.id);
      expect(updatedYear?.isCurrent).toBe(true);

      const previousCurrentYear = result.current.financialYears.find(y => y.id === mockCurrentYear.id);
      expect(previousCurrentYear?.isCurrent).toBe(false);
    });
  });

  describe('addFinancialYear', () => {
    it('should add financial year and sort correctly', () => {
      const { result } = renderHook(() => useFinancialYearStore());

      act(() => {
        result.current.addFinancialYear(mockFinancialYear);
      });

      expect(result.current.financialYears).toHaveLength(1);
      expect(result.current.financialYears[0]).toEqual(mockFinancialYear);
    });

    it('should set as current if year is current', () => {
      const { result } = renderHook(() => useFinancialYearStore());

      act(() => {
        result.current.addFinancialYear(mockCurrentYear);
      });

      expect(result.current.currentFinancialYear).toEqual(mockCurrentYear);
    });

    it('should sort current year first', () => {
      const { result } = renderHook(() => useFinancialYearStore());

      act(() => {
        result.current.addFinancialYear(mockFinancialYear);
        result.current.addFinancialYear(mockCurrentYear);
      });

      expect(result.current.financialYears[0]).toEqual(mockCurrentYear);
      expect(result.current.financialYears[1]).toEqual(mockFinancialYear);
    });
  });

  describe('updateFinancialYear', () => {
    it('should update existing financial year', () => {
      const { result } = renderHook(() => useFinancialYearStore());

      act(() => {
        result.current.setFinancialYears([mockFinancialYear]);
      });

      const updatedYear = { ...mockFinancialYear, name: 'Updated FY' };

      act(() => {
        result.current.updateFinancialYear(updatedYear);
      });

      expect(result.current.financialYears[0].name).toBe('Updated FY');
    });

    it('should update current year if updated year is current', () => {
      const { result } = renderHook(() => useFinancialYearStore());

      act(() => {
        result.current.setFinancialYears([mockCurrentYear]);
      });

      const updatedCurrentYear = { ...mockCurrentYear, name: 'Updated Current FY' };

      act(() => {
        result.current.updateFinancialYear(updatedCurrentYear);
      });

      expect(result.current.currentFinancialYear?.name).toBe('Updated Current FY');
    });

    it('should update selected year if updated year is selected', () => {
      const { result } = renderHook(() => useFinancialYearStore());

      act(() => {
        result.current.setFinancialYears([mockFinancialYear]);
        result.current.setSelectedFinancialYear(mockFinancialYear);
      });

      const updatedYear = { ...mockFinancialYear, name: 'Updated Selected FY' };

      act(() => {
        result.current.updateFinancialYear(updatedYear);
      });

      expect(result.current.selectedFinancialYear?.name).toBe('Updated Selected FY');
    });
  });

  describe('removeFinancialYear', () => {
    it('should remove financial year from list', () => {
      const { result } = renderHook(() => useFinancialYearStore());

      act(() => {
        result.current.setFinancialYears([mockFinancialYear, mockCurrentYear]);
      });

      act(() => {
        result.current.removeFinancialYear(mockFinancialYear.id);
      });

      expect(result.current.financialYears).toHaveLength(1);
      expect(result.current.financialYears[0]).toEqual(mockCurrentYear);
    });

    it('should clear current year if removed year was current', () => {
      const { result } = renderHook(() => useFinancialYearStore());

      act(() => {
        result.current.setFinancialYears([mockCurrentYear]);
      });

      act(() => {
        result.current.removeFinancialYear(mockCurrentYear.id);
      });

      expect(result.current.currentFinancialYear).toBeNull();
    });

    it('should clear selected year if removed year was selected', () => {
      const { result } = renderHook(() => useFinancialYearStore());

      act(() => {
        result.current.setFinancialYears([mockFinancialYear]);
        result.current.setSelectedFinancialYear(mockFinancialYear);
      });

      act(() => {
        result.current.removeFinancialYear(mockFinancialYear.id);
      });

      expect(result.current.selectedFinancialYear).toBeNull();
    });
  });

  describe('Loading and Error States', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => useFinancialYearStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should set error state', () => {
      const { result } = renderHook(() => useFinancialYearStore());
      const errorMessage = 'Something went wrong';

      act(() => {
        result.current.setError(errorMessage);
      });

      expect(result.current.error).toBe(errorMessage);

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      const { result } = renderHook(() => useFinancialYearStore());

      // Modify state
      act(() => {
        result.current.setFinancialYears([mockFinancialYear]);
        result.current.setSelectedFinancialYear(mockFinancialYear);
        result.current.setLoading(true);
        result.current.setError('Some error');
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.financialYears).toEqual([]);
      expect(result.current.currentFinancialYear).toBeNull();
      expect(result.current.selectedFinancialYear).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});