# Multi-Shop Spare Parts Accounting App - Product Requirements Document

## 1. Executive Summary

### Product Vision
A comprehensive mobile-first accounting application designed specifically for managing multiple spare parts shops, enabling real-time financial tracking, profit margin analysis, and multi-user collaboration with robust offline capabilities.

### Key Value Propositions
- **Multi-shop Management**: Centralized control of multiple spare parts shop finances
- **Real-time Profit Analysis**: Automated profit margin calculations based on opening/ending stock
- **Offline-First Design**: Seamless operation without internet connectivity
- **Role-based Access**: Separate interfaces for admins (shop owners) and users (shop workers)
- **Multi-currency Support**: Currency conversion with daily rate updates
- **Automated Reporting**: Daily reports with notification system

---

## 2. Problem Statement

### Current Challenges
- Manual tracking of financial transactions across multiple spare parts shops
- Lack of real-time profit margin visibility based on stock valuations
- Difficulty monitoring worker performance and daily financial activities
- No standardized accounting approach for spare parts retail financial management
- Limited offline capability for financial data entry operations
- Inconsistent financial reporting between different shop locations

### Target Pain Points
1. **Financial Visibility**: Shop owners need real-time insight into profitability through stock value tracking
2. **Stock Value Management**: Opening and ending stock value tracking for accurate profit calculations
3. **Worker Accountability**: Daily financial reporting and transaction monitoring
4. **Data Synchronization**: Reliable offline-online financial data sync
5. **Multi-location Complexity**: Standardized financial accounting across multiple shops

---

## 3. Target Users

### Primary Users

#### 3.1 Admin (Shop Owners)
- **Role**: Strategic oversight and financial management
- **Responsibilities**: 
  - Shop creation and management
  - Financial year setup
  - Account structure definition
  - Profit analysis and reporting
  - User management and monitoring
- **Goals**: Maximize profitability, maintain financial control, monitor operations

#### 3.2 Users (Shop Workers)
- **Role**: Daily financial operations and transaction entry
- **Responsibilities**:
  - Daily financial transaction entry (sales totals, purchase totals, expenses)
  - Customer/supplier account management
  - Cash/bank balance maintenance
  - Daily financial report submission
- **Goals**: Accurate financial data entry, meet daily reporting requirements, efficient transaction workflow

---

## 4. Core Features & User Stories

### 4.1 Account Management System

#### Account Structure Hierarchy
```
Main Accounts (System Predefined)
├── Sales Account (Revenue)
├── Purchase Account (Cost of Goods Sold)
├── Accounts Receivable (Customer Debtors)
├── Accounts Payable (Supplier Creditors)
├── Expenses
├── Assets (Cash/Bank)
├── Opening Stock Value
└── Ending Stock Value
```

#### Shop-Level Sub-Accounts (Admin Created)
```
Per Shop Creation:
├── sales-{shop_name}
├── purchase-{shop_name}
├── expenses-{shop_name}
├── customers-{shop_name} (with direct-sales-{shop_name} default)
├── suppliers-{shop_name} (with direct-purchase-{shop_name} default)
├── cash-{shop_name}
├── bank-{shop_name}
├── opening-stock-value-{shop_name}
└── ending-stock-value-{shop_name}
```

#### User Stories - Account Management
- **As an Admin**, I want to create shop-specific account hierarchies so that I can maintain separate financial tracking per location
- **As an Admin**, I want to set opening stock values and balances for cash and bank accounts so that profit calculations are accurate
- **As a User**, I want to create customer/supplier sub-accounts so that I can track individual business relationships
- **As a User**, I want default account selection for quick financial transaction entry

### 4.2 Daily Transaction Management

#### Transaction Types
1. **Sales Transactions**
   - Total invoice amount entry (no item details)
   - Payment method (cash/bank)
   - Customer selection (default: direct-sales-{shop})
   - Partial/full payment tracking
   - Optional invoice comments

2. **Purchase Transactions**
   - Total invoice amount entry (no item details)
   - Payment method (cash/bank)
   - Supplier selection (default: direct-purchase-{shop})
   - Partial/full payment tracking
   - Optional invoice comments

3. **Expense Transactions**
   - Total expense amount entry
   - Expense category selection
   - Payment method selection
   - Category-based filtering for reports

4. **Internal Transfers**
   - Cash to bank transfers
   - Bank to cash transfers
   - Balance reconciliation

#### User Stories - Transactions
- **As a User**, I want to quickly enter daily sales totals so that I can maintain accurate revenue records
- **As a User**, I want to record partial payments so that I can track outstanding customer/supplier balances
- **As a User**, I want to transfer money between cash and bank so that I can manage shop liquidity
- **As an Admin**, I want to see real-time financial transaction updates so that I can monitor shop performance

### 4.3 Profit Calculation Engine

#### Calculation Formula
```
Profit = (Ending Stock Value - Opening Stock Value) + Sales Revenue - Purchase Costs - Operating Expenses
```

**Note**: Stock values are monetary amounts set by admin, not physical inventory quantities.

#### Reporting Capabilities
- Individual shop financial performance analysis
- Multi-shop consolidated profit reports
- Financial year profit comparisons
- Real-time profit margin tracking based on stock valuations

#### User Stories - Profit Analysis
- **As an Admin**, I want automated profit calculations based on stock values so that I can assess shop performance
- **As an Admin**, I want to compare financial performance across shops so that I can identify best practices
- **As an Admin**, I want historical profit trends so that I can make strategic decisions

### 4.4 Offline/Online Synchronization

#### Sync Strategy
- **Auto-detection**: Network status monitoring
- **Manual Override**: User-controlled mode switching
- **Scheduled Sync**: Configurable intervals (default: 60 minutes)
- **Conflict Resolution**: Last-write-wins with audit trail

#### User Stories - Sync
- **As a User**, I want to work offline so that network issues don't stop operations
- **As a User**, I want automatic sync so that my data is always backed up
- **As an Admin**, I want sync monitoring so that I know data is current

### 4.5 Notification System

#### User Notifications
- Daily entry reminders
- Sync failure alerts
- Network status changes
- System maintenance notices

#### Admin Notifications
- User activity monitoring
- Entry modifications
- Authentication events
- Sync status updates
- Missed daily reports

#### User Stories - Notifications
- **As a User**, I want daily reminders so that I don't forget to enter financial transactions
- **As an Admin**, I want real-time alerts for unusual financial activity so that I can respond quickly
- **As an Admin**, I want notification scheduling so that I can manage alert timing

### 4.6 Multi-Currency Support

#### Currency Management
- **Base Currency**: Sudanese Pound (SDG)
- **Daily Rates**: Admin-managed exchange rates
- **Fallback Logic**: Use last available rate if daily rate missing
- **Display Options**: Currency switcher on all admin pages

#### User Stories - Currency
- **As an Admin**, I want multi-currency reporting so that I can understand performance in different currencies
- **As an Admin**, I want to set daily exchange rates so that conversions are accurate

---

## 5. Technical Architecture

### 5.1 Technology Stack - T3 Stack Architecture

#### Core Framework: Next.js + T3 Stack
The application will be built using the T3 Stack, providing end-to-end type safety and a unified development experience in a single project structure.

#### Frontend Technologies
- **Next.js 14**: React-based meta-framework with App Router
- **React 18**: Component library with concurrent features
- **TypeScript**: End-to-end type safety
- **Tailwind CSS**: Utility-first styling framework
- **Headless UI**: Accessible, unstyled UI components
- **React Hook Form**: Form validation and management
- **Zustand**: Lightweight state management

#### Backend Technologies
- **Next.js API Routes**: Server-side API endpoints
- **tRPC**: End-to-end typesafe APIs without code generation
- **Prisma ORM**: Type-safe database client and schema management
- **NextAuth.js**: Authentication with JWT strategy
- **Zod**: Schema validation (shared frontend/backend)
- **PostgreSQL**: Primary database for ACID compliance

#### Mobile Development
- **React Native + Expo**: Cross-platform mobile development
- **Expo Router**: File-based routing for React Native
- **tRPC React Native**: Shared API layer with web app
- **React Native AsyncStorage**: Local storage for offline data
- **Expo Notifications**: Push notification handling

#### Offline & Sync Strategy
- **Service Workers**: Web app offline functionality
- **IndexedDB**: Browser-based local storage
- **React Query (TanStack Query)**: Data fetching and caching
- **Background Sync**: Automatic data synchronization
- **Optimistic Updates**: Immediate UI feedback

#### Infrastructure & Deployment
- **Vercel**: Web application hosting and deployment
- **Vercel Postgres**: Managed PostgreSQL database
- **Expo EAS**: Mobile app building and distribution
- **Firebase Cloud Messaging**: Push notifications
- **Vercel Analytics**: Performance monitoring
- **Sentry**: Error tracking and monitoring

### 5.2 Project Structure - Single Codebase Approach

```
spare-parts-accounting/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (admin)/          # Admin routes group
│   │   ├── (auth)/           # Authentication routes
│   │   ├── api/              # API route handlers
│   │   ├── globals.css       # Global styles
│   │   └── layout.tsx        # Root layout
│   ├── components/           # Shared UI components
│   │   ├── ui/              # Base UI components
│   │   ├── forms/           # Form components
│   │   └── charts/          # Chart components
│   ├── lib/
│   │   ├── auth/            # Authentication utilities
│   │   ├── db.ts            # Database client
│   │   ├── utils.ts         # Shared utilities
│   │   └── validations.ts   # Zod schemas
│   ├── server/
│   │   ├── api/             # tRPC router definitions
│   │   │   ├── routers/     # API route handlers
│   │   │   └── root.ts      # Root router
│   │   ├── auth.ts          # NextAuth configuration
│   │   └── db.ts            # Database connection
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Client-side utilities
├── mobile/                   # React Native application
│   ├── app/                 # Expo Router screens
│   ├── components/          # Mobile-specific components
│   ├── lib/                 # Mobile utilities
│   ├── store/               # Mobile state management
│   └── app.config.js        # Expo configuration
├── public/                  # Static assets
├── docs/                    # Documentation
└── tests/                   # Test files
```

### 5.3 T3 Stack Benefits for This Application

#### End-to-End Type Safety
```typescript
// Shared types between frontend and backend
export const transactionSchema = z.object({
  id: z.string(),
  amount: z.number().positive(),
  type: z.enum(['sales', 'purchase', 'expense', 'transfer']),
  accountId: z.string(),
  date: z.date(),
  comment: z.string().optional(),
});

// tRPC router with full type safety
export const transactionRouter = router({
  create: protectedProcedure
    .input(transactionSchema.omit({ id: true }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction.create({ data: input });
    }),
});
```

#### Shared Validation Logic
- **Zod schemas** used for both frontend forms and backend validation
- **Type inference** from database schema to frontend
- **Runtime validation** ensures data integrity

#### Unified Authentication
- **NextAuth.js** handles web authentication
- **Expo AuthSession** integrates with same auth providers
- **JWT tokens** shared between web and mobile
- **Role-based access control** (RBAC) across platforms

### 5.4 Database Architecture with Prisma

#### Enhanced Schema Design
```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      Role     @default(USER)
  shopId    String?
  shop      Shop?    @relation(fields: [shopId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  transactions    Transaction[]
  notifications   Notification[]
  syncLogs        SyncLog[]
  
  @@map("users")
}

model Shop {
  id          String   @id @default(cuid())
  name        String
  ownerId     String
  owner       User     @relation("ShopOwner", fields: [ownerId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  users           User[]
  accounts        Account[]
  financialYears  FinancialYear[]
  stockValues     StockValue[]
  
  @@map("shops")
}

model Account {
  id          String      @id @default(cuid())
  nameEn      String
  nameAr      String
  type        AccountType
  parentId    String?
  parent      Account?    @relation("AccountHierarchy", fields: [parentId], references: [id])
  children    Account[]   @relation("AccountHierarchy")
  shopId      String
  shop        Shop        @relation(fields: [shopId], references: [id])
  
  // Relations
  transactions Transaction[]
  
  @@map("accounts")
}

model Transaction {
  id             String          @id @default(cuid())
  amount         Decimal         @db.Decimal(10, 2)
  type           TransactionType
  date           DateTime
  comment        String?
  paymentMethod  PaymentMethod
  accountId      String
  account        Account         @relation(fields: [accountId], references: [id])
  userId         String
  user           User            @relation(fields: [userId], references: [id])
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  
  @@map("transactions")
}
```

### 5.5 Mobile & Web Integration Strategy

#### Shared API Layer
```typescript
// Mobile app uses same tRPC endpoints
import { api } from '../utils/api';

// React Native component
export function TransactionForm() {
  const createTransaction = api.transaction.create.useMutation();
  
  const handleSubmit = (data: TransactionInput) => {
    createTransaction.mutate(data); // Same API as web
  };
  
  return (
    // Mobile UI using same validation and types
  );
}
```

#### Cross-Platform Components
```typescript
// Shared business logic components
export const TransactionValidator = {
  schema: transactionSchema, // Same Zod schema
  validate: (data: unknown) => transactionSchema.parse(data)
};

// Platform-specific UI implementations
// Web: components/ui/TransactionForm.tsx
// Mobile: mobile/components/TransactionForm.tsx
```

### 5.6 Offline Strategy Implementation

#### Web Application Offline Support
```typescript
// Service Worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// React Query with offline support
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});
```

#### Mobile Offline Implementation
```typescript
// React Native AsyncStorage for offline data
import AsyncStorage from '@react-native-async-storage/async-storage';

export const offlineStorage = {
  saveTransaction: async (transaction: Transaction) => {
    const pending = await AsyncStorage.getItem('pendingTransactions');
    const transactions = pending ? JSON.parse(pending) : [];
    transactions.push(transaction);
    await AsyncStorage.setItem('pendingTransactions', JSON.stringify(transactions));
  }
};
```

### 5.7 Development Workflow

#### Single Command Development
```bash
# Start entire development environment
npm run dev
# Runs: Next.js dev server + Prisma studio + Mobile metro

# Database operations
npm run db:push     # Push schema changes
npm run db:seed     # Seed development data
npm run db:studio   # Open Prisma Studio

# Mobile development
npm run mobile      # Start Expo development server
npm run mobile:ios  # Run on iOS simulator
npm run mobile:android # Run on Android emulator
```

#### Build & Deployment
```bash
# Web application
npm run build       # Build Next.js application
npm run deploy      # Deploy to Vercel

# Mobile application
npm run mobile:build:ios     # Build iOS app with EAS
npm run mobile:build:android # Build Android app with EAS
npm run mobile:submit        # Submit to app stores
```

### 5.8 Security Implementation

#### Authentication & Authorization
```typescript
// NextAuth.js configuration
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" }
      },
      authorize: async (credentials) => {
        // Validate credentials
        const user = await validateUser(credentials);
        return user;
      }
    })
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.shopId = user.shopId;
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user.role = token.role;
      session.user.shopId = token.shopId;
      return session;
    }
  }
};

// Protected procedures in tRPC
export const protectedProcedure = publicProcedure.use(
  ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  },
);
```

#### Data Encryption & Security
- **Environment Variables**: Secure API keys and database URLs
- **CSRF Protection**: Built-in Next.js CSRF protection
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **Input Validation**: Zod schema validation on all endpoints
- **Rate Limiting**: API route protection with rate limiting middleware

### 5.2 Development Environment Setup

#### Prerequisites
```bash
# Required software
Node.js 18+ 
PostgreSQL 14+
Git
Expo CLI (for mobile development)
```

#### Quick Start
```bash
# Clone and setup project
git clone <repository>
cd spare-parts-accounting
npm install

# Database setup
npx prisma migrate dev
npx prisma db seed

# Start development servers
npm run dev        # Next.js web app (http://localhost:3000)
npm run dev:mobile # Expo mobile app
npm run db:studio  # Prisma Studio (database GUI)
```

#### Environment Configuration
```env
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/accounting_db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 5.3 API Architecture with tRPC

#### Router Structure
```typescript
// src/server/api/root.ts
export const appRouter = createTRPCRouter({
  auth: authRouter,
  shop: shopRouter,
  account: accountRouter,
  transaction: transactionRouter,
  sync: syncRouter,
  notification: notificationRouter,
  currency: currencyRouter,
  report: reportRouter,
});

export type AppRouter = typeof appRouter;
```

#### Example tRPC Procedures
```typescript
// src/server/api/routers/transaction.ts
export const transactionRouter = createTRPCRouter({
  // Create daily transaction
  createDaily: protectedProcedure
    .input(z.object({
      type: z.enum(['sales', 'purchase', 'expense']),
      amount: z.number().positive(),
      paymentMethod: z.enum(['cash', 'bank']),
      accountId: z.string(),
      comment: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate user has access to shop
      await validateShopAccess(ctx.session.user.id, input.accountId);
      
      return ctx.db.transaction.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
          date: new Date(),
        },
        include: { account: true }
      });
    }),

  // Get daily transactions
  getDailyTransactions: protectedProcedure
    .input(z.object({
      date: z.date(),
      shopId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.transaction.findMany({
        where: {
          date: {
            gte: startOfDay(input.date),
            lte: endOfDay(input.date),
          },
          account: { shopId: input.shopId },
          userId: ctx.session.user.id,
        },
        include: { account: true },
        orderBy: { createdAt: 'desc' },
      });
    }),

  // Sync offline transactions
  syncOfflineTransactions: protectedProcedure
    .input(z.array(transactionSchema))
    .mutation(async ({ ctx, input }) => {
      const results = await ctx.db.$transaction(
        input.map(transaction => 
          ctx.db.transaction.upsert({
            where: { id: transaction.id },
            update: transaction,
            create: { ...transaction, userId: ctx.session.user.id },
          })
        )
      );
      
      // Log sync operation
      await ctx.db.syncLog.create({
        data: {
          userId: ctx.session.user.id,
          syncTime: new Date(),
          status: 'success',
          changesCount: results.length,
        }
      });
      
      return results;
    }),
});
```

### 5.4 Mobile Application Architecture

#### React Native + Expo Structure
```typescript
// mobile/app/(tabs)/index.tsx - Daily Entries Screen
import { api } from '../utils/api';

export default function DailyEntriesScreen() {
  const { data: transactions } = api.transaction.getDailyTransactions.useQuery({
    date: new Date(),
    shopId: user.shopId!
  });

  const createTransaction = api.transaction.createDaily.useMutation({
    onSuccess: () => {
      // Optimistic UI update
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      // Handle offline - store in AsyncStorage
      OfflineQueue.addTransaction(transactionData);
    }
  });

  return (
    <View className="flex-1 bg-white">
      <StatusBar />
      <TransactionsList transactions={transactions} />
      <FAB onPress={() => setShowModal(true)} />
      <TransactionModal 
        visible={showModal} 
        onSubmit={createTransaction.mutate}
      />
    </View>
  );
}
```

#### Cross-Platform Type Sharing
```typescript
// types/api.ts - Shared between web and mobile
import type { AppRouter } from '../server/api/root';
import { createTRPCReact } from '@trpc/react-query';

export const api = createTRPCReact<AppRouter>();
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// Usage in both web and mobile
type Transaction = RouterOutputs['transaction']['getDailyTransactions'][0];
```

### 5.5 Offline-First Implementation

#### Web Service Worker Strategy
```typescript
// public/sw.js
const CACHE_NAME = 'accounting-app-v1';
const OFFLINE_URL = '/offline';

// Cache API responses
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
        .catch(() => caches.match(OFFLINE_URL))
    );
  }
});

// Background sync for pending transactions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncPendingTransactions());
  }
});
```

#### Mobile Offline Queue
```typescript
// mobile/lib/offline-queue.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export class OfflineQueue {
  static async addTransaction(transaction: TransactionInput) {
    const queue = await this.getQueue();
    queue.push({
      ...transaction,
      id: generateId(),
      createdAt: new Date().toISOString(),
      synced: false
    });
    await AsyncStorage.setItem('offline-queue', JSON.stringify(queue));
  }

  static async syncPendingTransactions() {
    const queue = await this.getQueue();
    const unsynced = queue.filter(t => !t.synced);
    
    if (unsynced.length > 0) {
      try {
        await api.transaction.syncOfflineTransactions.mutate(unsynced);
        // Mark as synced
        queue.forEach(t => t.synced = true);
        await AsyncStorage.setItem('offline-queue', JSON.stringify(queue));
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
  }
}
```

### 5.6 Real-time Features with Server-Sent Events

#### Notification System
```typescript
// src/app/api/notifications/route.ts
export async function GET(request: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const sendNotification = (data: any) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      // Listen for database changes
      const subscription = db.$subscribe('notification', {
        create: sendNotification,
        update: sendNotification,
      });

      return () => subscription.unsubscribe();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### 5.7 Testing Strategy

#### Unit Testing with Vitest
```typescript
// tests/transaction.test.ts
import { describe, it, expect } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { appRouter } from '../src/server/api/root';

describe('Transaction API', () => {
  it('creates transaction with valid input', async () => {
    const caller = appRouter.createCaller({
      session: mockSession,
      db: mockDb,
    });

    const result = await caller.transaction.createDaily({
      type: 'sales',
      amount: 1000,
      paymentMethod: 'cash',
      accountId: 'test-account-id',
    });

    expect(result.amount).toBe(1000);
    expect(result.type).toBe('sales');
  });
});
```

#### Integration Testing
```typescript
// tests/integration/sync.test.ts
import { testClient } from './test-utils';

describe('Offline Sync Integration', () => {
  it('syncs offline transactions correctly', async () => {
    const offlineTransactions = [
      { type: 'sales', amount: 500, paymentMethod: 'cash' },
      { type: 'purchase', amount: 300, paymentMethod: 'bank' }
    ];

    const result = await testClient.transaction.syncOfflineTransactions.mutate(
      offlineTransactions
    );

    expect(result).toHaveLength(2);
    expect(result[0].synced).toBe(true);
  });
});
```

### 5.8 Performance Optimization

#### Database Query Optimization
```typescript
// Optimized queries with Prisma
export const getShopDashboard = async (shopId: string) => {
  const [transactions, balance, stockValue] = await Promise.all([
    // Get recent transactions with account info
    db.transaction.findMany({
      where: { account: { shopId } },
      include: { account: { select: { nameEn: true, type: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    
    // Calculate current balance
    db.transaction.aggregate({
      where: { account: { shopId } },
      _sum: { amount: true },
    }),
    
    // Get current stock value
    db.stockValue.findFirst({
      where: { shopId },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return { transactions, balance, stockValue };
};
```

#### Mobile Performance
```typescript
// React Native optimization
import { memo, useMemo } from 'react';
import { FlashList } from '@shopify/flash-list';

export const TransactionsList = memo(({ transactions }: Props) => {
  const groupedTransactions = useMemo(() => 
    groupBy(transactions, t => format(t.date, 'yyyy-MM-dd')),
    [transactions]
  );

  return (
    <FlashList
      data={Object.entries(groupedTransactions)}
      estimatedItemSize={80}
      renderItem={({ item }) => <TransactionGroup data={item} />}
      getItemType={(item) => item[1].length > 5 ? 'large' : 'small'}
    />
  );
});
```

### 5.9 Deployment & DevOps

#### Vercel Configuration
```typescript
// vercel.json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  },
  "build": {
    "env": {
      "SKIP_ENV_VALIDATION": "1"
    }
  }
}
```

#### Mobile Deployment (EAS)
```typescript
// eas.json
{
  "cli": { "version": ">= 3.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "../service-account-key.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "admin@example.com",
        "ascAppId": "1234567890"
      }
    }
  }
}
```

#### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy Application
on:
  push:
    branches: [main]

jobs:
  web-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  mobile-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: expo/expo-github-action@v7
        with:
          expo-version: latest
      - run: cd mobile && eas build --platform all
```

---

## 6. User Interface Specifications

### 6.1 Mobile-First Design Principles
- **Responsive Design**: Optimized for mobile, scalable to tablet/desktop
- **Touch-First**: Large tap targets, swipe gestures
- **Offline Indicators**: Clear network status visibility
- **Performance**: Fast loading, smooth animations
- **Accessibility**: Screen reader support, contrast compliance

### 6.2 User Interface Flows

#### User (Shop Worker) Interface

##### Daily Entries Page (Primary Landing)
```
Header:
├── Date Picker (current date)
├── Navigation Arrows (prev/next day)
└── Export/Share Button

Status Bar:
├── Cash in Hand Balance
├── Bank Balance
└── Current Stock Value (read-only)

Action Toolbar:
├── Add New Entry (FAB)
├── Sync Status Indicator
└── Menu Toggle

Entry List:
├── Grouped by Transaction Type (Sales Total, Purchase Total, Expenses)
├── Edit/Delete Actions per Entry
└── Smooth Date Navigation Animation
```

##### Add/Edit Entry Modal
```
Entry Type Selection:
├── Sales Transaction (Total Amount)
├── Purchase Transaction (Total Amount)
├── Expense Transaction (with Category)
└── Internal Transfer (Cash ↔ Bank)

Dynamic Form Fields:
├── Total Amount Input (no item breakdown)
├── Payment Method (Cash/Bank)
├── Account Selection (Customer/Supplier)
├── Optional Invoice Comments
└── Partial Payment Amount (if applicable)

Actions:
├── Save Entry
├── Cancel
└── Delete (Edit Mode)
```

##### Side Menu
```
Navigation Items:
├── Sync Now (with status indicator)
├── Notifications (with badge)
├── Transaction History
├── User Profile
├── Settings
└── Logout
```

#### Admin Interface

##### Dashboard
```
Summary Cards:
├── Total Shops
├── Active Users
├── Today's Transactions
└── Monthly Revenue

Quick Actions:
├── Add New Shop
├── Add New User
├── View Reports
└── Manage Currencies

Recent Activity:
├── User Login/Logout Events
├── Transaction Notifications
├── Sync Status Updates
└── System Alerts
```

##### Shop Management
```
Shop List:
├── Shop Name
├── Active Users Count
├── Last Financial Activity
├── Current Month Revenue
└── Actions (Edit/View/Settings)

Shop Details:
├── Account Structure Management
├── User Management
├── Financial Year Settings
├── Opening/Ending Stock Value Management
└── Profit Analysis Dashboard
```

### 6.3 Responsive Breakpoints
- **Mobile**: 320px - 768px (primary focus)
- **Tablet**: 768px - 1024px (secondary)
- **Desktop**: 1024px+ (admin interface optimization)

---

## 7. Business Logic Requirements

### 7.1 Account Balance Calculations

#### Real-time Balance Updates
```javascript
// Pseudo-code for balance calculation
function calculateAccountBalance(accountId, date) {
  const transactions = getTransactionsByAccount(accountId, date);
  const openingBalance = getOpeningBalance(accountId);
  
  return transactions.reduce((balance, transaction) => {
    return transaction.type === 'debit' ? 
      balance + transaction.amount : 
      balance - transaction.amount;
  }, openingBalance);
}
```

#### Profit Margin Formula
```javascript
function calculateProfit(shopId, financialYearId) {
  const endingStockValue = getStockValue('ending', shopId, financialYearId);
  const openingStockValue = getStockValue('opening', shopId, financialYearId);
  const totalSales = getAccountBalance('sales', shopId, financialYearId);
  const totalPurchases = getAccountBalance('purchase', shopId, financialYearId);
  const totalExpenses = getAccountBalance('expenses', shopId, financialYearId);
  
  return (endingStockValue - openingStockValue) + totalSales - totalPurchases - totalExpenses;
}
```

### 7.2 Data Validation Rules

#### Transaction Validation
- Total amount must be positive number
- Date cannot be future date
- Account must exist and be active for the shop
- User must have permission to modify account
- Payment method must match account type (cash/bank)
- Stock values can only be modified by admin

#### Account Creation Rules
- Account names must be unique within shop
- Sub-accounts must have valid parent
- System accounts cannot be deleted
- Balance transfers must be equal amounts

### 7.3 Business Rules

#### Daily Reporting Rules
- Users must submit daily financial summary before end of day
- Missing reports trigger notifications to both user and admin
- Financial reports cannot be modified after submission without admin approval
- Sync must occur at least once per day for financial data consistency

#### Stock Value Management Rules
- Only admins can set opening and ending stock values
- Stock values are monetary amounts, not physical quantities
- Stock value changes affect profit calculations immediately
- Historical stock values are preserved for audit trails

#### Currency Conversion Rules
- All transaction amounts stored in base currency (SDG)
- Display currency selectable by admin
- Historical exchange rates preserved for reporting accuracy
- Rate updates require admin authentication

---

## 8. Performance Requirements

### 8.1 Response Time Targets
- **Mobile App Launch**: < 3 seconds
- **Financial Transaction Entry**: < 1 second
- **Sync Operation**: < 30 seconds for daily financial data
- **Financial Report Generation**: < 10 seconds for monthly reports
- **Search/Filter**: < 2 seconds for result display

### 8.2 Scalability Requirements
- **Concurrent Users**: Support 100+ active users
- **Data Volume**: Handle 10,000+ financial transactions per day
- **Shop Scale**: Support 50+ shops per admin
- **Storage Growth**: Plan for 1GB+ annual financial data growth

### 8.3 Offline Performance
- **Local Storage**: 30 days of financial transaction history
- **Sync Queue**: Store 1000+ pending financial transactions
- **Data Compression**: Optimize financial data sync payload size
- **Battery Optimization**: Minimize background processing

---

## 9. Testing Requirements

### 9.1 Testing Strategy

#### Unit Testing
- Business logic validation
- Calculation accuracy
- Data validation rules
- Currency conversion

#### Integration Testing
- Sync functionality
- Authentication flows
- Database transactions
- API endpoints

#### User Acceptance Testing
- Admin workflow validation
- User daily operation flows
- Offline/online transitions
- Multi-device testing

### 9.2 Test Scenarios

#### Critical Path Testing
1. User registration and shop assignment
2. Daily financial transaction entry and sync
3. Admin profit calculation review based on stock values
4. Offline mode operation and sync recovery
5. Multi-currency display accuracy for financial data

#### Edge Case Testing
1. Network interruption during financial data sync
2. Large financial transaction volume handling
3. Historical financial data migration
4. Concurrent user modifications to financial records
5. System maintenance mode during business hours

---

## 10. Security & Compliance

### 10.1 Security Requirements

#### Data Encryption
- **In Transit**: TLS 1.3 for all API communications
- **At Rest**: AES-256 encryption for sensitive data
- **Backup**: Encrypted backup storage
- **Mobile**: Device-level encryption for local storage

#### Authentication Security
- **Password Policy**: Minimum 8 characters, complexity requirements
- **Session Management**: Secure token handling, automatic expiration
- **Multi-Factor Authentication**: Optional 2FA for admin accounts
- **Account Lockout**: Protection against brute force attacks

### 10.2 Audit & Compliance

#### Audit Trail
- All financial transaction modifications logged
- User authentication events tracked
- System configuration changes recorded
- Financial data export/sharing activities monitored
- Stock value changes with admin authorization tracking

#### Financial Compliance
- Financial transaction immutability after confirmation
- Audit-ready financial reporting formats
- Financial data retention policies
- Backup and recovery procedures for financial records

---

## 11. Deployment & Maintenance

### 11.1 Deployment Strategy - T3 Stack Approach

#### Single Repository Deployment
The T3 Stack enables a streamlined deployment process with a single codebase supporting multiple platforms:

**Web Application (Vercel)**
```bash
# Automatic deployment on push to main
git push origin main
# Vercel automatically builds and deploys Next.js application
```

**Mobile Application (Expo EAS)**
```bash
# Build for both platforms
eas build --platform all
# Submit to app stores
eas submit --platform all
```

#### Environment Management
```typescript
// Single environment configuration
// .env.production
DATABASE_URL="postgresql://production-db-url"
NEXTAUTH_SECRET="production-secret"
NEXTAUTH_URL="https://accounting-app.vercel.app"
EXPO_PUBLIC_API_URL="https://accounting-app.vercel.app/api"
```

#### Phased Rollout Strategy
1. **Development**: Feature branches deploy to preview URLs
2. **Staging**: Main branch auto-deploys to staging.accounting-app.vercel.app
3. **Production**: Manual promotion to production environment
4. **Mobile**: EAS builds distributed via internal testing first

### 11.2 Maintenance Requirements - T3 Stack Benefits

#### Unified Maintenance
Since the entire application is built with TypeScript and shared APIs, maintenance becomes significantly easier:

**Single Command Updates**
```bash
# Update all dependencies across web and mobile
npm update
npx prisma migrate dev  # Database schema updates
npm run type-check     # Verify types across entire stack
```

#### Automated Code Quality
```typescript
// package.json scripts
{
  "scripts": {
    "lint": "next lint && eslint mobile/**/*.{ts,tsx}",
    "type-check": "tsc --noEmit && cd mobile && tsc --noEmit",
    "test": "vitest run && cd mobile && jest",
    "db:deploy": "prisma migrate deploy",
    "build:all": "npm run build && cd mobile && eas build --platform all"
  }
}
```

#### Real-time Monitoring
```typescript
// Built-in monitoring with Vercel Analytics
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: Props) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 11.3 Development Team Structure - T3 Stack Advantages

#### Reduced Team Complexity
With T3 Stack's unified approach, team structure becomes more efficient:

**Full-Stack Development Team (Reduced from original)**
- **Full-Stack Developer** (3): TypeScript across entire stack
- **Mobile Specialist** (1): React Native + Expo expertise
- **DevOps Engineer** (1): Vercel + EAS deployment
- **QA Engineer** (1): Testing across unified codebase
- **UI/UX Designer** (1): Shared component design
- **Product Manager** (1): Single codebase coordination

**Team Benefits**
- **Shared Codebase**: All developers work with same TypeScript types
- **Unified Testing**: Single test suite for business logic
- **Common Patterns**: Same architectural patterns across platforms
- **Faster Onboarding**: New developers learn one tech stack

#### Infrastructure Costs (Reduced)
- **Vercel Pro**: $20/month for web application hosting
- **Vercel Postgres**: $20/month for managed database
- **Expo EAS**: $99/month for mobile app building
- **Domain & SSL**: $15/year (managed by Vercel)
- **Monitoring**: Included in Vercel Pro
- **Total**: ~$140/month operational costs

### 11.4 Scalability & Performance

#### T3 Stack Scaling Advantages
```typescript
// Automatic API route optimization
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vercel automatically scales these endpoints
  return trpcHandler({ req, res });
}

// Database connection pooling with Prisma
export const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?connection_limit=5&pool_timeout=2"
    }
  }
});
```

#### Performance Monitoring
```typescript
// Built-in performance tracking
import { unstable_noStore as noStore } from 'next/cache';

export async function getServerSideProps() {
  noStore(); // Opt out of caching for dynamic content
  const transactions = await db.transaction.findMany();
  return { props: { transactions } };
}
```

### 11.5 Security Implementation - T3 Stack Security

#### Built-in Security Features
```typescript
// CSRF protection with NextAuth
import { authOptions } from '../auth/[...nextauth]';
import { getServerSession } from 'next-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  // Protected endpoint logic
}

// Type-safe environment variables
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

#### Data Validation Across Stack
```typescript
// Shared validation schemas
export const transactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['sales', 'purchase', 'expense']),
  date: z.date().max(new Date()),
});

// Used in API routes
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const validatedData = transactionSchema.parse(req.body);
  // Process validated data
}

// Used in mobile forms
export function TransactionForm() {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(transactionSchema)
  });
  // Form with same validation
}
```

---

## 12. Success Metrics

### 12.1 Key Performance Indicators

#### User Adoption Metrics
- **Daily Active Users**: Target 80% of registered users
- **Daily Report Completion**: Target 95% compliance
- **Sync Success Rate**: Target 99.5% successful syncs
- **User Retention**: Target 90% monthly retention

#### Business Impact Metrics
- **Financial Visibility**: Real-time profit tracking for 100% of shops
- **Data Accuracy**: < 1% discrepancy in financial calculations
- **Operational Efficiency**: 50% reduction in manual financial reporting time
- **Error Reduction**: 75% reduction in financial accounting errors

#### Technical Performance Metrics
- **App Performance**: < 3 second load times
- **Offline Capability**: 100% financial functionality without network
- **Data Sync**: < 30 seconds for daily financial sync operations
- **System Uptime**: 99.9% availability target

### 12.2 Success Criteria

#### Phase 1 Success (Month 1-3)
- All core financial transaction features working
- Successful offline/online sync for financial data
- Basic profit calculation accuracy based on stock values
- User onboarding completion

#### Phase 2 Success (Month 4-6)
- Multi-currency implementation for financial reporting
- Advanced financial reporting features
- Notification system fully operational
- Admin financial analytics dashboard

#### Phase 3 Success (Month 7-12)
- Full feature set deployment
- Performance optimization complete
- User training and adoption
- Business ROI demonstration

---

## 13. Risk Assessment

### 13.1 Technical Risks

#### High Risk
- **Data Synchronization Complexity**: Complex offline/online data sync
  - *Mitigation*: Phased implementation, extensive testing
- **Multi-tenant Data Security**: Ensuring data isolation between shops
  - *Mitigation*: Robust authorization framework, security audits

#### Medium Risk  
- **Performance at Scale**: Mobile app performance with large datasets
  - *Mitigation*: Performance testing, data pagination, caching
- **Cross-platform Compatibility**: Consistent behavior across devices
  - *Mitigation*: Comprehensive device testing, progressive enhancement

#### Low Risk
- **User Interface Complexity**: Learning curve for non-technical users
  - *Mitigation*: User training, intuitive design, help documentation

### 13.2 Business Risks

#### Market Risks
- **Competition**: Existing accounting solutions entering market
  - *Mitigation*: Focus on spare parts industry specialization
- **User Adoption**: Resistance to digital accounting transition
  - *Mitigation*: Gradual migration support, training programs

#### Operational Risks
- **Data Migration**: Moving from existing manual systems
  - *Mitigation*: Import tools, parallel running period
- **Support Requirements**: High support demand during launch
  - *Mitigation*: Comprehensive documentation, support team scaling

---

## 14. Implementation Timeline

### 14.1 Development Phases

#### Phase 1: Foundation (Months 1-3)
**Core T3 Stack Infrastructure & Basic Features**
- NextAuth.js authentication system
- Prisma database schema and basic CRUD operations
- tRPC API routes for transactions and accounts
- Basic Next.js web interface for admin
- React Native mobile app with Expo
- Offline storage with AsyncStorage (mobile) and IndexedDB (web)

**Deliverables:**
- Single T3 Stack project with web and mobile apps
- Basic admin web interface built with Next.js
- User registration and NextAuth.js login
- Daily financial transaction entry (sales totals, purchase totals, expenses)
- Offline mode with pending transaction queue
- Basic tRPC API with end-to-end type safety

#### Phase 2: Advanced Features (Months 4-6)
**Enhanced T3 Stack Functionality**
- Multi-tenant shop management with Prisma relations
- Advanced tRPC procedures for profit calculations
- Real-time notifications using Server-Sent Events
- Advanced sync conflict resolution
- Multi-currency management with shared validation

**Deliverables:**
- Multi-tenant Prisma schema with shop isolation
- Automated profit calculations based on stock values using tRPC
- Real-time notification system with SSE
- Advanced admin dashboard with charts and analytics
- Multi-currency support with shared Zod validation
- Cross-platform offline queue synchronization

#### Phase 3: Optimization & Launch (Months 7-9)
**T3 Stack Production Readiness**
- Performance optimization with React Query caching
- Security hardening with NextAuth.js and middleware
- Comprehensive testing with Vitest and React Native Testing Library
- Production deployment to Vercel and EAS
- User training materials and documentation

**Deliverables:**
- Production-ready T3 Stack application
- Optimized mobile app built with EAS
- Comprehensive test suite covering API and UI
- Vercel deployment with automatic CI/CD
- Performance monitoring with Vercel Analytics
- User training program and documentation

### 14.2 Resource Requirements

#### Development Team
- **Mobile Developer** (2): React Native/Flutter expertise
- **Backend Developer** (2): Node.js/Python API development
- **Frontend Developer** (1): Admin interface development
- **DevOps Engineer** (1): Infrastructure and deployment
- **QA Engineer** (2): Testing and quality assurance
- **UI/UX Designer** (1): Interface design and user experience
- **Product Manager** (1): Requirements and coordination

#### Infrastructure Costs
- **Cloud Services**: $500-1000/month production environment
- **Development Tools**: $200/month development licenses
- **Testing Devices**: $3000 one-time mobile device testing
- **Security Tools**: $300/month security scanning and monitoring

---

## 15. Conclusion

This Product Requirements Document outlines a comprehensive solution for multi-shop spare parts accounting management. The application addresses critical business needs including real-time financial tracking, multi-user collaboration, offline operation capability, and automated profit analysis.

### Key Success Factors
1. **User-Centric Design**: Mobile-first approach optimized for shop floor operations
2. **Robust Architecture**: Scalable, secure, and reliable technical foundation  
3. **Business Value**: Clear ROI through improved financial visibility and operational efficiency
4. **Phased Implementation**: Gradual rollout minimizing risk and ensuring quality

### Next Steps
1. **Technical Architecture Review**: Detailed technical specification development
2. **Design Phase**: UI/UX wireframes and prototypes
3. **Development Team Assembly**: Resource allocation and team formation
4. **Project Kickoff**: Development phase initiation with clear milestones

The successful implementation of this solution will transform spare parts shop management from manual, error-prone processes to automated, accurate, and insightful financial operations that drive business growth and profitability.