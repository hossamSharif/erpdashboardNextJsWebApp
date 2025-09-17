import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Shop, UserRole } from '@multi-shop/shared';

interface AuthState {
  user: User | null;
  shop: Shop | null;
  isAuthenticated: boolean;
  language: 'ar' | 'en';
  theme: 'light' | 'dark';
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setShop: (shop: Shop | null) => void;
  setLanguage: (language: 'ar' | 'en') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  logout: () => void;
  isAdmin: () => boolean;
  hasShopAccess: (shopId: string) => boolean;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      shop: null,
      isAuthenticated: false,
      language: 'en',
      theme: 'light',

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user
        }),

      setShop: (shop) =>
        set({ shop }),

      setLanguage: (language) =>
        set({ language }),

      setTheme: (theme) =>
        set({ theme }),

      logout: () =>
        set({
          user: null,
          shop: null,
          isAuthenticated: false
        }),

      isAdmin: () => {
        const { user } = get();
        return user?.role === UserRole.ADMIN;
      },

      hasShopAccess: (shopId) => {
        const { user, shop } = get();
        if (!user) return false;

        // Admin can access any shop (with proper validation)
        if (user.role === UserRole.ADMIN) {
          return true; // Will be validated server-side
        }

        // Regular users can only access their assigned shop
        if (user.role === UserRole.USER) {
          return user.shopId === shopId;
        }

        return false;
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        shop: state.shop,
        isAuthenticated: state.isAuthenticated,
        language: state.language,
        theme: state.theme
      })
    }
  )
);