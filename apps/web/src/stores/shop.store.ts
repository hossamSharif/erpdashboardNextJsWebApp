import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Shop {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  users: {
    id: string;
    name: string;
    email: string;
    role: string;
  }[];
}

interface ShopState {
  // Current shop context
  currentShop: Shop | null;

  // Available shops for the current user
  availableShops: Shop[];

  // Loading states
  isLoading: boolean;
  isChangingShop: boolean;

  // Error state
  error: string | null;

  // Actions
  setCurrentShop: (shop: Shop | null) => void;
  setAvailableShops: (shops: Shop[]) => void;
  switchShop: (shopId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setChangingShop: (isChanging: boolean) => void;
  setError: (error: string | null) => void;
  clearShopContext: () => void;
  updateShopInList: (shopId: string, updates: Partial<Shop>) => void;
  removeShopFromList: (shopId: string) => void;
  addShopToList: (shop: Shop) => void;
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentShop: null,
      availableShops: [],
      isLoading: false,
      isChangingShop: false,
      error: null,

      // Actions
      setCurrentShop: (shop) => {
        set({ currentShop: shop, error: null });
      },

      setAvailableShops: (shops) => {
        set({ availableShops: shops });
      },

      switchShop: (shopId) => {
        const { availableShops } = get();
        const targetShop = availableShops.find(shop => shop.id === shopId);

        if (targetShop) {
          set({
            currentShop: targetShop,
            isChangingShop: true,
            error: null
          });

          // Simulate async shop switching
          setTimeout(() => {
            set({ isChangingShop: false });
          }, 500);
        } else {
          set({
            error: 'Shop not found',
            isChangingShop: false
          });
        }
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setChangingShop: (isChanging) => {
        set({ isChangingShop: isChanging });
      },

      setError: (error) => {
        set({ error });
      },

      clearShopContext: () => {
        set({
          currentShop: null,
          availableShops: [],
          isLoading: false,
          isChangingShop: false,
          error: null
        });
      },

      updateShopInList: (shopId, updates) => {
        const { availableShops, currentShop } = get();

        // Update in available shops list
        const updatedShops = availableShops.map(shop =>
          shop.id === shopId ? { ...shop, ...updates } : shop
        );

        // Update current shop if it's the one being updated
        const updatedCurrentShop = currentShop?.id === shopId
          ? { ...currentShop, ...updates }
          : currentShop;

        set({
          availableShops: updatedShops,
          currentShop: updatedCurrentShop
        });
      },

      removeShopFromList: (shopId) => {
        const { availableShops, currentShop } = get();

        // Remove from available shops
        const filteredShops = availableShops.filter(shop => shop.id !== shopId);

        // Clear current shop if it's the one being removed
        const updatedCurrentShop = currentShop?.id === shopId ? null : currentShop;

        set({
          availableShops: filteredShops,
          currentShop: updatedCurrentShop
        });
      },

      addShopToList: (shop) => {
        const { availableShops } = get();

        // Check if shop already exists
        const existingShopIndex = availableShops.findIndex(s => s.id === shop.id);

        if (existingShopIndex >= 0) {
          // Update existing shop
          const updatedShops = [...availableShops];
          updatedShops[existingShopIndex] = shop;
          set({ availableShops: updatedShops });
        } else {
          // Add new shop
          set({ availableShops: [...availableShops, shop] });
        }
      }
    }),
    {
      name: 'shop-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist the current shop and available shops
      partialize: (state) => ({
        currentShop: state.currentShop,
        availableShops: state.availableShops
      })
    }
  )
);

// Selectors for commonly used derived state
export const useCurrentShop = () => useShopStore(state => state.currentShop);
export const useAvailableShops = () => useShopStore(state => state.availableShops);
export const useShopLoading = () => useShopStore(state => state.isLoading || state.isChangingShop);
export const useShopError = () => useShopStore(state => state.error);

// Helper functions
export const getShopDisplayName = (shop: Shop | null, isRTL: boolean): string => {
  if (!shop) return '';
  return isRTL ? shop.nameAr : shop.nameEn;
};

export const canUserAccessShop = (shop: Shop, userId: string, userRole: string): boolean => {
  // Admin users can access any shop they own (checked server-side)
  if (userRole === 'ADMIN') {
    return true;
  }

  // Regular users can only access shops they're assigned to
  return shop.users.some(user => user.id === userId);
};

export const getCurrentShopContext = () => {
  const store = useShopStore.getState();
  return {
    shop: store.currentShop,
    isLoading: store.isLoading || store.isChangingShop,
    error: store.error
  };
};