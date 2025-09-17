'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useShopStore } from '../../stores/shop.store';
import { trpc } from '../../utils/trpc';
import { useAuthStore } from '../../stores/auth-store';

interface ShopContextType {
  currentShop: any;
  availableShops: any[];
  isLoading: boolean;
  error: string | null;
  switchShop: (shopId: string) => void;
  refreshShops: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

interface ShopProviderProps {
  children: ReactNode;
}

export function ShopProvider({ children }: ShopProviderProps) {
  const {
    currentShop,
    availableShops,
    isLoading,
    isChangingShop,
    error,
    setCurrentShop,
    setAvailableShops,
    setLoading,
    setError,
    switchShop: switchShopStore,
    clearShopContext
  } = useShopStore();

  const { user } = useAuthStore();

  // Fetch available shops for the current user
  const {
    data: shopsData,
    isLoading: isFetchingShops,
    error: fetchError,
    refetch: refetchShops
  } = trpc.shop.list.useQuery(
    {
      includeInactive: false,
      limit: 100,
      offset: 0
    },
    {
      enabled: !!user,
      onSuccess: (data) => {
        setAvailableShops(data.shops);
        setError(null);

        // If no current shop is selected, select the first available shop
        if (!currentShop && data.shops.length > 0) {
          const firstShop = data.shops[0];
          setCurrentShop(firstShop);
        }

        // If current shop is no longer available, clear it
        if (currentShop && !data.shops.find(shop => shop.id === currentShop.id)) {
          setCurrentShop(null);
        }
      },
      onError: (error) => {
        setError(error.message);
        setAvailableShops([]);
      }
    }
  );

  // Update loading state
  useEffect(() => {
    setLoading(isFetchingShops);
  }, [isFetchingShops, setLoading]);

  // Clear shop context when user logs out
  useEffect(() => {
    if (!user) {
      clearShopContext();
    }
  }, [user, clearShopContext]);

  // Enhanced shop switching function
  const switchShop = async (shopId: string) => {
    const targetShop = availableShops.find(shop => shop.id === shopId);

    if (!targetShop) {
      setError('Shop not found');
      return;
    }

    // Check if user has access to this shop
    if (user?.role === 'USER') {
      const hasAccess = targetShop.users.some((shopUser: any) => shopUser.id === user.id);
      if (!hasAccess) {
        setError('Access denied to this shop');
        return;
      }
    }

    // Switch shop in store
    switchShopStore(shopId);

    // Trigger any necessary data refetches for the new shop context
    // This could include refetching transactions, accounts, etc.
    // For now, we'll just clear any errors
    setError(null);
  };

  const refreshShops = () => {
    refetchShops();
  };

  const contextValue: ShopContextType = {
    currentShop,
    availableShops,
    isLoading: isLoading || isChangingShop,
    error,
    switchShop,
    refreshShops
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShopContext(): ShopContextType {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShopContext must be used within a ShopProvider');
  }
  return context;
}

// Hook for getting current shop with error handling
export function useCurrentShopRequired() {
  const { currentShop, isLoading, error } = useShopContext();

  if (!currentShop && !isLoading && !error) {
    throw new Error('No shop selected. Please select a shop to continue.');
  }

  return { currentShop, isLoading, error };
}

// Hook for checking if user has access to current shop
export function useShopAccess() {
  const { currentShop } = useShopContext();
  const { user } = useAuthStore();

  const hasAccess = (() => {
    if (!currentShop || !user) return false;

    // Admin users have access to shops they own (validated server-side)
    if (user.role === 'ADMIN') {
      return true;
    }

    // Regular users have access if they're assigned to the shop
    return currentShop.users.some((shopUser: any) => shopUser.id === user.id);
  })();

  const isOwner = user?.role === 'ADMIN';

  return {
    hasAccess,
    isOwner,
    currentShop,
    user
  };
}