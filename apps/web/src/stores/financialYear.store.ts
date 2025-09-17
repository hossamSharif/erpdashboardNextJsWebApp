import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { FinancialYear, FinancialYearWithCounts } from '@erpdesk/shared';

interface FinancialYearState {
  // State
  financialYears: FinancialYearWithCounts[];
  currentFinancialYear: FinancialYear | null;
  selectedFinancialYear: FinancialYear | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setFinancialYears: (years: FinancialYearWithCounts[]) => void;
  setCurrentFinancialYear: (year: FinancialYear | null) => void;
  setSelectedFinancialYear: (year: FinancialYear | null) => void;
  addFinancialYear: (year: FinancialYearWithCounts) => void;
  updateFinancialYear: (year: FinancialYearWithCounts) => void;
  removeFinancialYear: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  financialYears: [],
  currentFinancialYear: null,
  selectedFinancialYear: null,
  isLoading: false,
  error: null,
};

export const useFinancialYearStore = create<FinancialYearState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setFinancialYears: (years) => {
          set(
            {
              financialYears: years,
              currentFinancialYear: years.find(y => y.isCurrent) || null
            },
            false,
            'setFinancialYears'
          );
        },

        setCurrentFinancialYear: (year) => {
          set(
            { currentFinancialYear: year },
            false,
            'setCurrentFinancialYear'
          );

          // Update the financialYears array to reflect the current year change
          if (year) {
            const { financialYears } = get();
            const updatedYears = financialYears.map(y => ({
              ...y,
              isCurrent: y.id === year.id
            }));
            set({ financialYears: updatedYears }, false, 'updateCurrentInList');
          }
        },

        setSelectedFinancialYear: (year) => {
          set(
            { selectedFinancialYear: year },
            false,
            'setSelectedFinancialYear'
          );
        },

        addFinancialYear: (year) => {
          set(
            (state) => ({
              financialYears: [year, ...state.financialYears].sort((a, b) => {
                // Sort by current first, then by start date descending
                if (a.isCurrent && !b.isCurrent) return -1;
                if (!a.isCurrent && b.isCurrent) return 1;
                return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
              }),
              // Set as current if it's the current year
              currentFinancialYear: year.isCurrent ? year : state.currentFinancialYear
            }),
            false,
            'addFinancialYear'
          );
        },

        updateFinancialYear: (year) => {
          set(
            (state) => ({
              financialYears: state.financialYears.map(y =>
                y.id === year.id ? year : y
              ),
              // Update current if this is the current year
              currentFinancialYear: year.isCurrent ? year :
                (state.currentFinancialYear?.id === year.id ? year : state.currentFinancialYear),
              // Update selected if this is the selected year
              selectedFinancialYear: state.selectedFinancialYear?.id === year.id ? year : state.selectedFinancialYear
            }),
            false,
            'updateFinancialYear'
          );
        },

        removeFinancialYear: (id) => {
          set(
            (state) => ({
              financialYears: state.financialYears.filter(y => y.id !== id),
              currentFinancialYear: state.currentFinancialYear?.id === id ? null : state.currentFinancialYear,
              selectedFinancialYear: state.selectedFinancialYear?.id === id ? null : state.selectedFinancialYear
            }),
            false,
            'removeFinancialYear'
          );
        },

        setLoading: (loading) => {
          set({ isLoading: loading }, false, 'setLoading');
        },

        setError: (error) => {
          set({ error }, false, 'setError');
        },

        reset: () => {
          set(initialState, false, 'reset');
        },
      }),
      {
        name: 'financial-year-store',
        partialize: (state) => ({
          // Only persist the current financial year and selected year
          currentFinancialYear: state.currentFinancialYear,
          selectedFinancialYear: state.selectedFinancialYear
        }),
      }
    ),
    {
      name: 'financial-year-store',
    }
  )
);

// Selectors for commonly used computed values
export const useCurrentFinancialYear = () =>
  useFinancialYearStore((state) => state.currentFinancialYear);

export const useSelectedFinancialYear = () =>
  useFinancialYearStore((state) => state.selectedFinancialYear);

export const useFinancialYears = () =>
  useFinancialYearStore((state) => state.financialYears);

export const useFinancialYearLoading = () =>
  useFinancialYearStore((state) => state.isLoading);

export const useFinancialYearError = () =>
  useFinancialYearStore((state) => state.error);