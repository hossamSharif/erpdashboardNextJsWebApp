# Frontend Architecture

## Component Architecture

### Component Organization

```
apps/web/src/
├── components/
│   ├── ui/                    # Base UI components (shadcn/ui + custom)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── arabic-date-picker.tsx
│   ├── layout/                # Layout components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── rtl-provider.tsx
│   ├── features/              # Feature-specific components
│   │   ├── transactions/
│   │   ├── dashboard/
│   │   └── reports/
│   └── shared/                # Shared components
├── hooks/                     # Custom React hooks
├── lib/                       # Library configurations
├── services/                  # Frontend services
├── stores/                    # Zustand stores
└── styles/                    # Global styles
```

## State Management Architecture

### State Structure

```typescript
// stores/app-store.ts
import { create } from 'zustand';

interface AppState {
  // User & Auth
  user: User | null;
  currentShop: Shop | null;
  isAuthenticated: boolean;

  // UI State
  language: 'ar' | 'en';
  theme: 'light' | 'dark';

  // Offline & Sync
  isOffline: boolean;
  pendingSyncCount: number;
  lastSyncAt: Date | null;

  // Actions
  setUser: (user: User | null) => void;
  setOfflineStatus: (status: boolean) => void;
  incrementPendingSync: () => void;
  resetPendingSync: () => void;
}

export const useAppStore = create<AppState>()((set) => ({
  // Initial state and actions...
}));
```

## Routing Architecture

### Route Organization

```
app/
├── (auth)/
│   ├── login/
│   └── layout.tsx
├── (dashboard)/
│   ├── layout.tsx              # Protected layout
│   ├── page.tsx                # Dashboard home
│   ├── transactions/
│   ├── accounts/
│   ├── reports/
│   └── settings/
└── api/
    └── trpc/
```

---
