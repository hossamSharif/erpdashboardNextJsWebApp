import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardState {
  selectedDate: Date;
  isLoading: boolean;
  cashBalance: number;
  bankBalance: number;
  todayStats: {
    sales: number;
    purchases: number;
    expenses: number;
    netCashFlow: number;
  };
  pendingSyncCount: number;
  lastSyncAt: Date | null;
  setSelectedDate: (date: Date) => void;
  setIsLoading: (loading: boolean) => void;
  updateBalances: (cash: number, bank: number) => void;
  updateTodayStats: (stats: DashboardState['todayStats']) => void;
  updateSyncStatus: (count: number, lastSync: Date | null) => void;
  reset: () => void;
}

const initialState = {
  selectedDate: new Date(),
  isLoading: false,
  cashBalance: 0,
  bankBalance: 0,
  todayStats: {
    sales: 0,
    purchases: 0,
    expenses: 0,
    netCashFlow: 0,
  },
  pendingSyncCount: 0,
  lastSyncAt: null,
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      ...initialState,

      setSelectedDate: (date) => set({ selectedDate: date }),

      setIsLoading: (loading) => set({ isLoading: loading }),

      updateBalances: (cash, bank) => set({ cashBalance: cash, bankBalance: bank }),

      updateTodayStats: (stats) => set({ todayStats: stats }),

      updateSyncStatus: (count, lastSync) => set({
        pendingSyncCount: count,
        lastSyncAt: lastSync
      }),

      reset: () => set(initialState),
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        selectedDate: state.selectedDate,
      }),
    }
  )
);