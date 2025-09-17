# Multi-Shop Spare Parts Accounting App Fullstack Architecture Document

## Introduction

This document outlines the complete fullstack architecture for **Multi-Shop Spare Parts Accounting App**, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern fullstack applications where these concerns are increasingly intertwined.

### Starter Template or Existing Project

Based on the PRD analysis, this project explicitly specifies the **T3 Stack** as the foundation:

**Selected Foundation:** T3 Stack (Next.js + TypeScript + tRPC + Prisma)
**Project Type:** Greenfield monorepo architecture
**Pre-configured Choices:**
- Next.js 14 with App Router
- TypeScript for type safety
- tRPC for end-to-end type-safe APIs
- Prisma ORM with PostgreSQL
- NextAuth.js for authentication
- Tailwind CSS with RTL support

**Architectural Constraints:**
- Must support Arabic-first UI with RTL layout
- Offline-first mobile capability with React Native/Expo
- Multi-tenant architecture with shop-based data isolation
- 24-hour mandatory sync policy

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-09-17 | 1.0 | Initial architecture from PRD v1.0 | Winston (Architect) |

---

## High Level Architecture

### Technical Summary

The Multi-Shop Spare Parts Accounting App employs a **T3 Stack monolithic architecture** with **serverless functions**, featuring a **unified Next.js application** serving both web and mobile clients through tRPC APIs. The system implements **offline-first architecture** with mandatory 24-hour sync cycles, **multi-tenant data isolation** at the database level, and a **comprehensive notifications system** handling real-time alerts, scheduled reminders, and escalation workflows. **Arabic-first RTL design** with bilingual support drives the frontend experience, while **PostgreSQL with Prisma** provides ACID-compliant financial transaction storage deployed on **Vercel with Supabase/Vercel Postgres**.

### Platform and Infrastructure Choice

**Recommended Platform:** **Vercel + Supabase**

**Analysis of Options:**

**Option 1: Vercel + Supabase** ⭐ **RECOMMENDED**
- ✅ **Pros:** Seamless T3 Stack integration, built-in auth, real-time subscriptions, managed PostgreSQL, excellent DX
- ✅ **Notifications:** Built-in real-time features, webhook support, edge functions for background jobs
- ✅ **Cost:** Generous free tiers, predictable scaling costs
- ❌ **Cons:** Vendor lock-in, less control over infrastructure

**Option 2: AWS Full Stack**
- ✅ **Pros:** Enterprise scale, complete control, extensive services
- ❌ **Cons:** Complex setup, higher costs, longer development time
- ❌ **Notifications:** Requires SNS/SES setup complexity

**Option 3: Vercel + Vercel Postgres**
- ✅ **Pros:** Single vendor simplicity, tight integration
- ❌ **Cons:** Newer service, less features than Supabase

**Final Choice:** **Vercel + Supabase**

**Platform:** Vercel + Supabase
**Key Services:**
- Vercel (Frontend hosting, API routes, edge functions)
- Supabase (PostgreSQL, Auth, Real-time subscriptions, Storage)
- Firebase Cloud Messaging (Mobile push notifications)
- Resend/SendGrid (Email notifications)

**Deployment Host and Regions:** Vercel Edge Network (Global), Supabase EU/US regions

### Repository Structure

**Structure:** T3 Stack Monorepo with mobile integration
**Monorepo Tool:** Turborepo (included in T3 Stack)
**Package Organization:** Apps (web/mobile) + Shared packages (types, UI, utilities)

### High Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web App<br/>Next.js PWA]
        Mobile[Mobile App<br/>React Native/Expo]
    end

    subgraph "Vercel Platform"
        Frontend[Static Assets<br/>CDN]
        API[API Routes<br/>tRPC + Next.js]
        BG[Background Jobs<br/>Vercel Cron]
        Edge[Edge Functions<br/>Notifications]
    end

    subgraph "Supabase Platform"
        DB[(PostgreSQL<br/>Multi-tenant)]
        Auth[Supabase Auth<br/>JWT + RLS]
        RT[Real-time<br/>Subscriptions]
        Storage[File Storage<br/>Reports/Exports]
    end

    subgraph "Notification Infrastructure"
        FCM[Firebase Cloud<br/>Messaging]
        Email[Email Service<br/>Resend/SendGrid]
        WA[WhatsApp<br/>Business API]
    end

    subgraph "External Services"
        Rates[Currency Rates<br/>API]
        Monitoring[Sentry<br/>Error Tracking]
    end

    Web --> Frontend
    Mobile --> API
    Frontend --> API
    API --> DB
    API --> Auth
    API --> RT
    BG --> Edge
    Edge --> FCM
    Edge --> Email
    Edge --> WA
    API --> Rates
    API --> Monitoring

    DB -.-> RT
    Auth -.-> DB
```

### Architectural Patterns

- **T3 Stack Architecture:** Unified TypeScript monolith with tRPC for type-safe APIs - _Rationale:_ Eliminates API layer complexity while maintaining type safety across full stack
- **Offline-First Pattern:** Local-first data with sync queues and conflict resolution - _Rationale:_ Critical for shop floor operations with unreliable internet connectivity
- **Multi-tenant with RLS:** Row-level security for complete data isolation between shops - _Rationale:_ Ensures secure data separation without application-layer complexity
- **Event-Driven Notifications:** Background job triggers for scheduled and real-time alerts - _Rationale:_ Enables reliable delivery of critical business notifications
- **Component-Based UI:** Reusable React components with Arabic/RTL support - _Rationale:_ Maintainability and consistency across bilingual interfaces
- **Repository Pattern:** Abstract data access through Prisma with business logic separation - _Rationale:_ Enables testing and future database migration flexibility
- **Optimistic UI Updates:** Immediate UI feedback with rollback on sync failure - _Rationale:_ Maintains responsive UX even during offline operations

---

## Tech Stack

This is the **DEFINITIVE technology selection** for the entire project. All development must use these exact versions and technologies.

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.3+ | Type-safe frontend development | End-to-end type safety with backend, reduces runtime errors |
| Frontend Framework | Next.js | 14.2+ | React framework with App Router | SSR/SSG capabilities, API routes, excellent performance |
| UI Component Library | Headless UI + shadcn/ui | Latest | Accessible component foundation | WAI-ARIA compliance, customizable, Arabic RTL support |
| State Management | Zustand | 4.4+ | Lightweight state management | Simple API, TypeScript support, offline state persistence |
| Backend Language | TypeScript | 5.3+ | Server-side development | Shared types with frontend, single language stack |
| Backend Framework | Next.js API Routes | 14.2+ | Serverless API endpoints | Integrated with frontend, automatic deployment scaling |
| API Style | tRPC | 10.45+ | End-to-end type-safe APIs | Eliminates API layer complexity, full TypeScript integration |
| Database | PostgreSQL | 15+ | Primary data storage | ACID compliance for financial data, JSON support, mature ecosystem |
| ORM | Prisma | 5.6+ | Database toolkit and ORM | Type-safe database access, migration system, excellent DX |
| Cache | Redis (Upstash) | 7+ | Session and data caching | Session storage, API response caching, rate limiting |
| File Storage | Supabase Storage | Latest | Document and export storage | Integrated with auth, CDN distribution, S3-compatible |
| Authentication | NextAuth.js + Supabase Auth | 4.24+ | User authentication and authorization | JWT tokens, multiple providers, session management |
| Frontend Testing | Vitest + React Testing Library | Latest | Unit and integration tests | Fast test runner, React component testing |
| Backend Testing | Vitest + Supertest | Latest | API endpoint testing | Same test runner as frontend, HTTP testing utilities |
| E2E Testing | Playwright | 1.40+ | End-to-end browser testing | Cross-browser support, mobile testing, Arabic text support |
| Build Tool | Turborepo | 1.10+ | Monorepo build orchestration | Incremental builds, dependency caching, parallel execution |
| Bundler | Next.js (Webpack/Turbopack) | Built-in | Application bundling | Optimized for Next.js, tree shaking, code splitting |
| CSS Framework | Tailwind CSS | 3.3+ | Utility-first styling | RTL support, responsive design, consistent design system |
| Mobile Framework | React Native + Expo | 49+ | Cross-platform mobile development | Shared codebase with web, managed workflow, OTA updates |
| Mobile Navigation | Expo Router | 3+ | File-based routing for mobile | Consistent with Next.js App Router patterns |
| Offline Storage | SQLite (Expo) + AsyncStorage | Latest | Mobile offline data storage | Reliable offline storage, automatic sync capabilities |
| Push Notifications | Firebase Cloud Messaging | Latest | Mobile push notifications | Cross-platform support, reliable delivery, rich notifications |
| Internationalization | next-i18next + react-i18next | 14+ | Arabic/English localization | SSR support, pluralization, RTL layout management |
| Form Handling | React Hook Form + Zod | 7.47+ / 3.22+ | Type-safe form validation | Performance optimization, schema validation, TypeScript integration |
| Date Handling | date-fns | 2.30+ | Date manipulation and formatting | Lightweight, modular, Arabic calendar support |
| Icons | Lucide React + Heroicons | Latest | Consistent icon system | RTL-aware icons, customizable, extensive library |
| Charts | Recharts | 2.8+ | Financial charts and analytics | React-native support, responsive, customizable |
| PDF Generation | Puppeteer + React-PDF | Latest | Report generation | Server-side PDF creation, Arabic text support |
| Email Service | Resend | Latest | Transactional emails | Developer-friendly API, reliable delivery, template support |
| Error Tracking | Sentry | 7+ | Error monitoring and performance | Real-time error tracking, performance monitoring, release tracking |
| Analytics | Vercel Analytics | Latest | Usage analytics and monitoring | Privacy-focused, Core Web Vitals, real user monitoring |
| Deployment Platform | Vercel | Latest | Frontend and API hosting | Seamless Next.js integration, global CDN, preview deployments |
| Database Hosting | Supabase | Latest | Managed PostgreSQL with real-time | Built-in auth, real-time subscriptions, API generation |
| CI/CD | GitHub Actions | Latest | Automated testing and deployment | Free for open source, excellent ecosystem, workflow flexibility |
| Code Quality | ESLint + Prettier + Husky | Latest | Code formatting and linting | Consistent code style, pre-commit hooks, TypeScript support |
| Package Manager | pnpm | 8+ | Fast, disk space efficient package management | Workspace support, deterministic installs, security features |

---

## Data Models

Core data models/entities shared between frontend and backend, derived from PRD requirements and business logic.

### Shop

**Purpose:** Central tenant entity representing a spare parts shop location with complete data isolation and bilingual naming support.

**Key Attributes:**
- id: string (UUID) - Unique shop identifier
- nameAr: string - Arabic shop name (primary)
- nameEn: string - English shop name (secondary)
- isActive: boolean - Shop operational status
- ownerId: string - Reference to admin user
- createdAt: DateTime - Shop creation timestamp
- updatedAt: DateTime - Last modification timestamp

#### TypeScript Interface
```typescript
interface Shop {
  id: string;
  nameAr: string;
  nameEn: string;
  isActive: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  // Navigation properties
  users: User[];
  accounts: Account[];
  financialYears: FinancialYear[];
  transactions: Transaction[];
}
```

#### Relationships
- Has many Users (shop workers)
- Has many Accounts (shop-specific account hierarchy)
- Has many FinancialYears (annual accounting periods)
- Has many Transactions (all financial activities)

### User

**Purpose:** System users with role-based access (Admin/Worker) and shop assignments for multi-tenant operations.

**Key Attributes:**
- id: string (UUID) - Unique user identifier
- email: string - Authentication email
- nameAr: string - Arabic display name
- nameEn: string - English display name
- role: UserRole - ADMIN or USER enum
- shopId: string - Assigned shop reference
- isActive: boolean - Account status
- lastSyncAt: DateTime - Last successful sync timestamp

#### TypeScript Interface
```typescript
enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

interface User {
  id: string;
  email: string;
  nameAr: string;
  nameEn: string;
  role: UserRole;
  shopId: string;
  isActive: boolean;
  lastSyncAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Navigation properties
  shop: Shop;
  transactions: Transaction[];
  activityLogs: ActivityLog[];
}
```

#### Relationships
- Belongs to one Shop
- Creates many Transactions
- Has many ActivityLogs (audit trail)

### Account

**Purpose:** Hierarchical chart of accounts with bilingual naming and automatic shop suffix generation for financial categorization.

**Key Attributes:**
- id: string (UUID) - Unique account identifier
- code: string - Account code (e.g., "1001")
- nameAr: string - Arabic account name
- nameEn: string - English account name
- accountType: AccountType - Asset, Liability, Equity, Revenue, Expense
- level: number - Hierarchy level (1=main, 2=sub, 3=detail)
- parentId: string - Parent account reference
- shopId: string - Shop context for data isolation
- isSystemAccount: boolean - Cannot be deleted/modified
- isActive: boolean - Account status

#### TypeScript Interface
```typescript
enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE'
}

interface Account {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  accountType: AccountType;
  level: number;
  parentId: string | null;
  shopId: string;
  isSystemAccount: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Navigation properties
  shop: Shop;
  parent: Account | null;
  children: Account[];
  transactions: Transaction[];
}
```

#### Relationships
- Belongs to one Shop
- Self-referencing hierarchy (parent/children)
- Has many Transactions

### Transaction

**Purpose:** Core financial transaction entity supporting sales, purchases, expenses, and transfers with partial payment tracking.

**Key Attributes:**
- id: string (UUID) - Unique transaction identifier
- type: TransactionType - Sales, Purchase, Expense, Transfer
- amount: Decimal - Transaction amount in base currency (SDG)
- amountPaid: Decimal - Amount actually paid (for partial payments)
- change: Decimal - Change given back
- description: string - Transaction description
- transactionDate: DateTime - When transaction occurred
- accountId: string - Primary account affected
- counterAccountId: string - Opposing account (for transfers)
- shopId: string - Shop context
- userId: string - User who created transaction
- isSynced: boolean - Sync status flag
- syncedAt: DateTime - When successfully synced

#### TypeScript Interface
```typescript
enum TransactionType {
  SALES = 'SALES',
  PURCHASE = 'PURCHASE',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  amountPaid: number;
  change: number;
  description: string;
  transactionDate: Date;
  accountId: string;
  counterAccountId: string | null;
  shopId: string;
  userId: string;
  isSynced: boolean;
  syncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Navigation properties
  shop: Shop;
  user: User;
  account: Account;
  counterAccount: Account | null;
}
```

#### Relationships
- Belongs to one Shop
- Created by one User
- References primary Account
- May reference counter Account (for transfers)

### FinancialYear

**Purpose:** Annual accounting periods with opening/closing stock values for accurate profit calculations per shop.

**Key Attributes:**
- id: string (UUID) - Unique financial year identifier
- startDate: DateTime - Year start date
- endDate: DateTime - Year end date
- openingStockValue: Decimal - Stock value at year start
- closingStockValue: Decimal - Stock value at year end
- isCurrent: boolean - Active financial year flag
- isClosed: boolean - Year closure status
- shopId: string - Shop context

#### TypeScript Interface
```typescript
interface FinancialYear {
  id: string;
  startDate: Date;
  endDate: Date;
  openingStockValue: number;
  closingStockValue: number | null;
  isCurrent: boolean;
  isClosed: boolean;
  shopId: string;
  createdAt: Date;
  updatedAt: Date;
  // Navigation properties
  shop: Shop;
}
```

#### Relationships
- Belongs to one Shop

### Notification

**Purpose:** Comprehensive notification system supporting in-app, push, and email delivery with scheduling and escalation.

**Key Attributes:**
- id: string (UUID) - Unique notification identifier
- type: NotificationType - Sync reminder, report missing, etc.
- title: string - Notification headline
- message: string - Detailed message content
- userId: string - Target user
- shopId: string - Shop context
- isRead: boolean - Read status
- deliveryChannels: array - In-app, push, email flags
- scheduledFor: DateTime - When to send
- sentAt: DateTime - Actual delivery time
- priority: NotificationPriority - Low, Medium, High, Critical

#### TypeScript Interface
```typescript
enum NotificationType {
  SYNC_REMINDER = 'SYNC_REMINDER',
  SYNC_OVERDUE = 'SYNC_OVERDUE',
  REPORT_MISSING = 'REPORT_MISSING',
  SYSTEM_ALERT = 'SYSTEM_ALERT'
}

enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  shopId: string;
  isRead: boolean;
  deliveryChannels: string[];
  scheduledFor: Date;
  sentAt: Date | null;
  priority: NotificationPriority;
  createdAt: Date;
  updatedAt: Date;
  // Navigation properties
  user: User;
  shop: Shop;
}
```

#### Relationships
- Belongs to one User
- Belongs to one Shop

### SyncLog

**Purpose:** Comprehensive audit trail of all synchronization operations with conflict resolution tracking and performance metrics.

**Key Attributes:**
- id: string (UUID) - Unique sync log identifier
- userId: string - User who performed sync
- shopId: string - Shop context
- syncType: SyncType - Manual or automatic
- status: SyncStatus - Success, failure, partial
- recordsProcessed: number - Transaction count synced
- conflictsResolved: number - Conflicts handled
- duration: number - Sync duration in milliseconds
- errorMessage: string - Failure details if applicable
- startedAt: DateTime - Sync start time
- completedAt: DateTime - Sync completion time

#### TypeScript Interface
```typescript
enum SyncType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC'
}

enum SyncStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  PARTIAL = 'PARTIAL'
}

interface SyncLog {
  id: string;
  userId: string;
  shopId: string;
  syncType: SyncType;
  status: SyncStatus;
  recordsProcessed: number;
  conflictsResolved: number;
  duration: number;
  errorMessage: string | null;
  startedAt: Date;
  completedAt: Date | null;
  // Navigation properties
  user: User;
  shop: Shop;
}
```

#### Relationships
- Belongs to one User
- Belongs to one Shop

---

## API Specification

Based on the tRPC selection from our Tech Stack, here are the complete router definitions for type-safe API communication.

### tRPC Router Definitions

```typescript
// Root router combining all feature routers
export const appRouter = router({
  auth: authRouter,
  shops: shopsRouter,
  accounts: accountsRouter,
  transactions: transactionsRouter,
  sync: syncRouter,
  notifications: notificationsRouter,
  reports: reportsRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;

// Authentication router
export const authRouter = router({
  // Get current user session
  getSession: publicProcedure
    .query(async ({ ctx }) => {
      return ctx.session;
    }),

  // Sign in with credentials
  signIn: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
      shopId: z.string().optional(), // For shop workers
    }))
    .mutation(async ({ input, ctx }) => {
      // Authentication logic
      return { user, session };
    }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(z.object({
      nameAr: z.string().min(1),
      nameEn: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      // Update user profile
      return updatedUser;
    }),

  // Change password
  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8),
    }))
    .mutation(async ({ input, ctx }) => {
      // Password change logic
      return { success: true };
    }),
});

// Shops management router
export const shopsRouter = router({
  // Get user's shop (for workers) or all shops (for admin)
  getMyShops: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role === 'ADMIN') {
        return await ctx.db.shop.findMany({
          where: { ownerId: ctx.user.id },
          include: { users: true, _count: { select: { transactions: true } } }
        });
      }
      return await ctx.db.shop.findUnique({
        where: { id: ctx.user.shopId },
        include: { accounts: true }
      });
    }),

  // Create new shop (admin only)
  create: adminProcedure
    .input(z.object({
      nameAr: z.string().min(1),
      nameEn: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      // Create shop with default accounts
      return createdShop;
    }),

  // Update shop details
  update: adminProcedure
    .input(z.object({
      id: z.string(),
      nameAr: z.string().min(1),
      nameEn: z.string().min(1),
      isActive: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      return updatedShop;
    }),

  // Get shop dashboard data
  getDashboard: protectedProcedure
    .input(z.object({
      shopId: z.string(),
      date: z.date().optional(),
    }))
    .query(async ({ input, ctx }) => {
      // Return dashboard metrics
      return {
        cashBalance: number,
        bankBalance: number,
        todayStats: { sales, purchases, expenses },
        pendingSyncCount: number,
        lastSyncAt: Date,
      };
    }),
});

// Transactions router
export const transactionsRouter = router({
  // Get daily transactions
  getDaily: protectedProcedure
    .input(z.object({
      shopId: z.string(),
      date: z.date(),
    }))
    .query(async ({ input, ctx }) => {
      return dailyTransactions;
    }),

  // Create new transaction
  create: protectedProcedure
    .input(z.object({
      type: z.enum(['SALES', 'PURCHASE', 'EXPENSE', 'TRANSFER']),
      amount: z.number().positive(),
      amountPaid: z.number().nonnegative(),
      change: z.number().nonnegative(),
      description: z.string().min(1),
      accountId: z.string(),
      counterAccountId: z.string().optional(),
      transactionDate: z.date(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Create transaction with balance updates
      return createdTransaction;
    }),

  // Sync router for offline operations
  syncNow: protectedProcedure
    .input(z.object({
      shopId: z.string(),
      localTransactions: z.array(LocalTransactionSchema),
    }))
    .mutation(async ({ input, ctx }) => {
      // Process sync with conflict resolution
      return {
        syncId: string,
        status: 'SUCCESS' | 'PARTIAL' | 'FAILURE',
        processedCount: number,
        conflictsResolved: number,
        errors: string[],
      };
    }),

  // Reports router
  generateDaily: protectedProcedure
    .input(z.object({
      shopId: z.string(),
      date: z.date(),
      format: z.enum(['PDF', 'EXCEL']),
      language: z.enum(['AR', 'EN']).default('AR'),
    }))
    .mutation(async ({ input, ctx }) => {
      return {
        reportUrl: string,
        filename: string,
        expiresAt: Date,
      };
    }),
});
```

---

## Components

Major logical components/services across the fullstack with clear boundaries and responsibilities.

### Frontend Web Application

**Responsibility:** Progressive Web App serving desktop and mobile web users with Arabic-first RTL interface, offline capabilities, and real-time data synchronization.

**Key Interfaces:**
- tRPC client for type-safe API calls
- Service Worker for offline caching and background sync
- WebSocket connection for real-time notifications
- Local storage APIs (IndexedDB, localStorage)

**Dependencies:** Next.js frontend framework, tRPC client, React Query for caching, Zustand for state management

**Technology Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, PWA manifest, Service Workers

### Mobile Application

**Responsibility:** Native mobile app for iOS/Android providing offline-first experience with local SQLite storage, push notifications, and camera integration for document capture.

**Key Interfaces:**
- tRPC client with React Native adapter
- SQLite database interface for local storage
- Firebase Cloud Messaging for push notifications
- Expo APIs for device features (camera, file system)

**Dependencies:** Shared UI components, shared types package, tRPC client, sync service

**Technology Stack:** React Native with Expo, SQLite, AsyncStorage, Expo Router, React Query Native

### API Gateway & Business Logic

**Responsibility:** Centralized API layer handling authentication, authorization, business rules enforcement, and orchestration of data operations across all services.

**Key Interfaces:**
- tRPC routers exposing typed procedures
- NextAuth.js authentication endpoints
- WebSocket server for real-time subscriptions
- Background job triggers for scheduled tasks

**Dependencies:** Database models via Prisma, authentication service, notification service, sync engine

**Technology Stack:** Next.js API Routes, tRPC server, Prisma ORM, NextAuth.js, Zod validation

### Synchronization Engine

**Responsibility:** Manages offline-to-online data synchronization, conflict resolution, and enforces 24-hour mandatory sync policy with automatic retry and escalation.

**Key Interfaces:**
- Sync queue processing API
- Conflict resolution algorithms
- Sync status monitoring endpoints
- Background sync triggers

**Dependencies:** Database for transaction storage, notification service for alerts, audit logging

**Technology Stack:** TypeScript services, Prisma transactions, Redis queue for sync jobs, Last-write-wins strategy

### Notification Service

**Responsibility:** Multi-channel notification delivery system handling in-app alerts, push notifications, email communications, and scheduled reminders with escalation logic.

**Key Interfaces:**
- Notification creation and scheduling API
- Push notification gateway (FCM)
- Email service integration (Resend)
- Real-time WebSocket publisher

**Dependencies:** User preferences, Firebase Cloud Messaging, email service provider, WebSocket server

**Technology Stack:** Vercel Edge Functions, Firebase Admin SDK, Resend API, Supabase Realtime

---

## External APIs

External service integrations required for the Multi-Shop Spare Parts Accounting application.

### Firebase Cloud Messaging (FCM) API

- **Purpose:** Deliver push notifications to mobile app users for sync reminders, daily report alerts, and escalation notifications
- **Documentation:** https://firebase.google.com/docs/cloud-messaging
- **Base URL(s):** https://fcm.googleapis.com/v1/projects/{project-id}/messages:send
- **Authentication:** OAuth 2.0 with service account credentials
- **Rate Limits:** 600,000 messages per minute per project

**Key Endpoints Used:**
- `POST /v1/projects/{project-id}/messages:send` - Send individual or batch notifications

**Integration Notes:** Device tokens stored per user, automatic retry for failed deliveries, handle token refresh on mobile app

### Resend Email API

- **Purpose:** Send transactional emails for daily reports, admin alerts, password resets, and escalation notifications
- **Documentation:** https://resend.com/docs
- **Base URL(s):** https://api.resend.com
- **Authentication:** Bearer token (API key)
- **Rate Limits:** 100 emails per day (free tier), 10,000+ per month (paid)

**Key Endpoints Used:**
- `POST /emails` - Send single transactional email

**Integration Notes:** HTML and plain text templates for Arabic/English, attachment support for PDF reports

### Currency Exchange Rate API

- **Purpose:** Fetch daily exchange rates for multi-currency display in financial reports and analytics
- **Documentation:** https://exchangerate-api.com/docs
- **Base URL(s):** https://api.exchangerate-api.com/v4/latest/{base_currency}
- **Authentication:** API key in query parameter (for paid tiers)
- **Rate Limits:** 1,500 requests per month (free), unlimited (paid)

**Key Endpoints Used:**
- `GET /v4/latest/SDG` - Get latest rates with SDG as base currency

**Integration Notes:** Daily cron job to update rates, cache rates for 24 hours, fallback to last known rates if API unavailable

---

## Core Workflows

Critical system workflows illustrating component interactions for key user journeys.

### Daily Transaction Entry with Offline Support

```mermaid
sequenceDiagram
    participant U as User
    participant M as Mobile App
    participant SW as Service Worker
    participant API as API Gateway
    participant DB as PostgreSQL
    participant S as Sync Engine

    Note over U,M: Offline Transaction Entry
    U->>M: Enter sales transaction
    M->>M: Validate input (Zod)
    M->>M: Calculate change/balance
    M->>SW: Save to IndexedDB/SQLite
    SW-->>M: Transaction saved locally
    M->>M: Update UI optimistically
    M-->>U: Show success + updated balance

    Note over M,S: Network Restored - Auto Sync
    M->>M: Detect network available
    M->>API: syncNow() with batch
    API->>S: Process sync queue

    loop For each transaction
        S->>DB: Check for conflicts
        alt No conflict
            S->>DB: Insert transaction
            S->>DB: Update account balances
        else Conflict detected
            S->>S: Apply last-write-wins
            S->>DB: Update with resolution
        end
    end

    S-->>API: Sync result
    API-->>M: Updated data + conflicts
    M->>SW: Update local storage
    M->>M: Reconcile UI state
    M-->>U: Sync complete notification
```

### 24-Hour Mandatory Sync Enforcement

```mermaid
sequenceDiagram
    participant BG as Background Job
    participant DB as Database
    participant NS as Notification Service
    participant FCM as Firebase FCM
    participant U as User Device
    participant Admin as Admin

    Note over BG: Hourly Sync Check Cron
    BG->>DB: Query users with pending sync
    DB-->>BG: Users list + last sync times

    loop For each user
        alt Last sync > 20 hours
            BG->>NS: Create warning notification
            NS->>FCM: Push notification
            FCM-->>U: "Sync required soon"
        else Last sync > 24 hours
            BG->>DB: Set user.isBlocked = true
            BG->>NS: Create lockout notification
            NS->>FCM: Lockout notification
            FCM-->>U: "Account locked - sync required"
            NS->>Admin: Escalation notification
        end
    end
```

---

## Database Schema

PostgreSQL database schema with multi-tenant isolation, Arabic support, and audit capabilities.

### Prisma Schema Definition

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["multiSchema", "views"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== ENUMS ====================
enum UserRole {
  ADMIN
  USER
}

enum AccountType {
  ASSET
  LIABILITY
  EQUITY
  REVENUE
  EXPENSE
}

enum TransactionType {
  SALES
  PURCHASE
  EXPENSE
  TRANSFER
}

enum NotificationType {
  SYNC_REMINDER
  SYNC_OVERDUE
  SYNC_BLOCKED
  REPORT_MISSING
  SYSTEM_ALERT
}

// ==================== MODELS ====================

model Shop {
  id        String   @id @default(uuid())
  nameAr    String
  nameEn    String
  code      String   @unique
  isActive  Boolean  @default(true)
  ownerId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  owner           User              @relation("ShopOwner", fields: [ownerId], references: [id])
  users           User[]            @relation("ShopUsers")
  accounts        Account[]
  transactions    Transaction[]
  financialYears  FinancialYear[]
  notifications   Notification[]
  syncLogs        SyncLog[]

  @@index([ownerId])
  @@index([isActive])
  @@map("shops")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  nameAr        String
  nameEn        String
  role          UserRole
  shopId        String?
  isActive      Boolean   @default(true)
  isBlocked     Boolean   @default(false)
  lastSyncAt    DateTime?
  language      String    @default("ar")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  shop            Shop?           @relation("ShopUsers", fields: [shopId], references: [id])
  ownedShops      Shop[]          @relation("ShopOwner")
  transactions    Transaction[]
  notifications   Notification[]
  syncLogs        SyncLog[]

  @@index([email])
  @@index([shopId])
  @@index([lastSyncAt])
  @@index([isBlocked])
  @@map("users")
}

model Account {
  id              String   @id @default(uuid())
  code            String
  nameAr          String
  nameEn          String
  accountType     AccountType
  level           Int
  parentId        String?
  shopId          String
  isSystemAccount Boolean  @default(false)
  isActive        Boolean  @default(true)
  balance         Decimal  @default(0) @db.Decimal(15, 2)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  shop                 Shop          @relation(fields: [shopId], references: [id], onDelete: Cascade)
  parent               Account?      @relation("AccountHierarchy", fields: [parentId], references: [id])
  children             Account[]     @relation("AccountHierarchy")
  debitTransactions    Transaction[] @relation("DebitAccount")
  creditTransactions   Transaction[] @relation("CreditAccount")

  @@unique([shopId, code])
  @@index([shopId])
  @@index([parentId])
  @@map("accounts")
}

model Transaction {
  id               String          @id @default(uuid())
  type             TransactionType
  amount           Decimal         @db.Decimal(15, 2)
  amountPaid       Decimal         @db.Decimal(15, 2)
  change           Decimal         @default(0) @db.Decimal(15, 2)
  description      String
  transactionDate  DateTime        @default(now())
  debitAccountId   String
  creditAccountId  String
  shopId           String
  userId           String
  financialYearId  String

  // Sync fields
  localId          String?
  isSynced         Boolean         @default(true)
  syncedAt         DateTime?
  conflictResolved Boolean         @default(false)

  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt

  // Relations
  shop          Shop          @relation(fields: [shopId], references: [id], onDelete: Cascade)
  user          User          @relation(fields: [userId], references: [id])
  debitAccount  Account       @relation("DebitAccount", fields: [debitAccountId], references: [id])
  creditAccount Account       @relation("CreditAccount", fields: [creditAccountId], references: [id])
  financialYear FinancialYear @relation(fields: [financialYearId], references: [id])

  @@index([shopId, transactionDate])
  @@index([userId])
  @@index([isSynced])
  @@map("transactions")
}

model FinancialYear {
  id                String   @id @default(uuid())
  name              String
  startDate         DateTime
  endDate           DateTime
  openingStockValue Decimal  @db.Decimal(15, 2)
  closingStockValue Decimal? @db.Decimal(15, 2)
  isCurrent         Boolean  @default(false)
  isClosed          Boolean  @default(false)
  shopId            String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  shop         Shop          @relation(fields: [shopId], references: [id], onDelete: Cascade)
  transactions Transaction[]

  @@unique([shopId, isCurrent])
  @@index([shopId])
  @@map("financial_years")
}

model Notification {
  id               String               @id @default(uuid())
  type             NotificationType
  titleAr          String
  titleEn          String
  messageAr        String
  messageEn        String
  userId           String
  shopId           String
  isRead           Boolean              @default(false)
  scheduledFor     DateTime
  sentAt           DateTime?
  createdAt        DateTime             @default(now())
  updatedAt        DateTime             @updatedAt

  // Relations
  user User @relation(fields: [userId], references: [id])
  shop Shop @relation(fields: [shopId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@index([shopId])
  @@map("notifications")
}

model SyncLog {
  id               String     @id @default(uuid())
  userId           String
  shopId           String
  recordsProcessed Int        @default(0)
  conflictsResolved Int       @default(0)
  duration         Int
  errorMessage     String?
  startedAt        DateTime   @default(now())
  completedAt      DateTime?

  // Relations
  user User @relation(fields: [userId], references: [id])
  shop Shop @relation(fields: [shopId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([shopId])
  @@map("sync_logs")
}
```

---

## Frontend Architecture

### Component Architecture

#### Component Organization

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

### State Management Architecture

#### State Structure

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

### Routing Architecture

#### Route Organization

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

## Backend Architecture

### Service Architecture

#### Serverless Architecture

##### Function Organization

```
apps/api/src/
├── server/
│   ├── routers/             # tRPC routers
│   ├── services/            # Business logic services
│   ├── db/                  # Database layer
│   ├── middleware/          # API middleware
│   └── utils/               # Utility functions
├── jobs/                    # Background jobs
└── api/
    └── trpc/
```

### Database Architecture

#### Data Access Layer

```typescript
// Prisma client with tenant context
export class TransactionRepository {
  constructor(
    private db: PrismaClient,
    private context: ShopContext,
  ) {}

  async create(data: Prisma.TransactionCreateInput) {
    const shopId = this.context.getShopId();
    return this.db.transaction.create({
      data: { ...data, shopId },
    });
  }
}
```

### Authentication and Authorization

#### Auth Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API Gateway
    participant Auth as Auth Service
    participant DB as Database

    C->>API: Login request
    API->>Auth: Validate credentials
    Auth->>DB: Check user
    DB-->>Auth: User data
    Auth-->>API: Auth success
    API-->>C: Tokens + User data
```

---

## Unified Project Structure

```plaintext
multi-shop-accounting/
├── .github/                           # CI/CD workflows
│   └── workflows/
├── apps/                              # Application packages
│   ├── web/                           # Next.js web application
│   │   ├── src/
│   │   │   ├── app/                   # App Router pages
│   │   │   ├── components/            # UI components
│   │   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── lib/                   # Library configs
│   │   │   ├── services/              # Frontend services
│   │   │   ├── stores/                # Zustand stores
│   │   │   └── styles/                # Global styles
│   │   ├── public/                    # Static assets
│   │   │   ├── locales/               # i18n translation files
│   │   │   └── fonts/                 # Arabic/English fonts
│   │   └── tests/                     # Frontend tests
│   ├── mobile/                        # React Native mobile app
│   │   ├── src/
│   │   │   ├── screens/               # Mobile screens
│   │   │   ├── components/            # Mobile components
│   │   │   ├── navigation/            # Expo Router setup
│   │   │   └── services/              # Mobile services
│   │   └── assets/                    # Mobile assets
│   └── api/                           # Backend API
│       ├── src/
│       │   ├── server/                # Server code
│       │   └── jobs/                  # Background jobs
│       └── prisma/
├── packages/                          # Shared packages
│   ├── shared/                        # Shared types/utilities
│   │   ├── src/
│   │   │   ├── types/                 # TypeScript interfaces
│   │   │   ├── constants/             # Shared constants
│   │   │   ├── validators/            # Shared Zod schemas
│   │   │   └── utils/                 # Shared utilities
│   │   └── package.json
│   ├── ui/                            # Shared UI components
│   └── config/                        # Shared configuration
├── infrastructure/                    # Infrastructure as Code
├── scripts/                          # Build/deploy scripts
├── docs/                             # Documentation
│   ├── prd.md                        # Product Requirements
│   └── architecture.md               # This document
├── turbo.json                        # Turborepo config
├── package.json                      # Root package.json
└── README.md                         # Project README
```

---

## Development Workflow

### Local Development Setup

#### Prerequisites

```bash
# Required tools and versions
node >= 18.17.0
pnpm >= 8.0.0
docker >= 24.0.0
```

#### Initial Setup

```bash
# Clone and setup
git clone https://github.com/your-org/multi-shop-accounting.git
cd multi-shop-accounting
pnpm install

# Environment setup
cp .env.example .env.local
docker-compose up -d

# Database setup
pnpm db:migrate
pnpm db:seed

# Start development
pnpm dev
```

#### Development Commands

```bash
# Start all services
pnpm dev

# Run tests
pnpm test

# Database commands
pnpm db:migrate
pnpm db:studio

# Build commands
pnpm build
```

### Environment Configuration

#### Required Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url

# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/accounting
NEXTAUTH_SECRET=your-secret-key
RESEND_API_KEY=your_resend_key
FCM_SERVICE_ACCOUNT={"type":"service_account"...}
```

---

## Deployment Architecture

### Deployment Strategy

**Frontend Deployment:**
- **Platform:** Vercel Edge Network
- **Build Command:** `pnpm build:web`
- **Output Directory:** `apps/web/.next`

**Backend Deployment:**
- **Platform:** Vercel Serverless Functions
- **Build Command:** `pnpm build:api`
- **Deployment Method:** Automatic with frontend

**Mobile Deployment:**
- **Platform:** Expo EAS Build
- **Distribution:** App Store / Google Play

### CI/CD Pipeline

```yaml
# .github/workflows/deploy-production.yaml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Run tests
        run: pnpm test:ci
      - name: Build applications
        run: pnpm build

  deploy-web:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

### Environments

| Environment | Frontend URL | Backend URL | Purpose |
|------------|--------------|-------------|---------|
| Development | http://localhost:3000 | http://localhost:3000/api | Local development |
| Staging | https://staging.accounting.app | https://staging.accounting.app/api | Pre-production testing |
| Production | https://accounting.app | https://accounting.app/api | Live environment |

---

## Security and Performance

### Security Requirements

**Frontend Security:**
- CSP Headers for XSS prevention
- Secure storage for sensitive data
- Input validation and sanitization

**Backend Security:**
- Input validation with Zod schemas
- Rate limiting on API endpoints
- Multi-tenant data isolation

**Authentication Security:**
- JWT tokens with secure storage
- Session management with timeouts
- Password complexity requirements

### Performance Optimization

**Frontend Performance:**
- Bundle size target: < 200KB initial JS
- Route-based code splitting
- Service worker caching

**Backend Performance:**
- Response time target: < 200ms P95
- Database connection pooling
- Redis caching with TTL

---

## Testing Strategy

### Testing Pyramid

```
        E2E Tests (10%)
       /              \
    Integration Tests (30%)
   /                      \
Frontend Unit (30%)  Backend Unit (30%)
```

### Test Organization

#### Frontend Tests

```
apps/web/tests/
├── unit/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── integration/
│   ├── api/
│   └── pages/
└── e2e/
    ├── auth.spec.ts
    ├── transactions.spec.ts
    └── sync.spec.ts
```

#### Test Examples

```typescript
// Frontend Component Test
describe('TransactionForm', () => {
  it('should submit transaction in Arabic mode', async () => {
    render(<TransactionForm shopId="shop-1" />);

    fireEvent.change(screen.getByLabelText('المبلغ'), {
      target: { value: '100' }
    });

    fireEvent.click(screen.getByText('حفظ'));

    expect(mockCreate).toHaveBeenCalledWith({
      amount: 100,
      shopId: 'shop-1',
    });
  });
});

// E2E Test
test('should handle offline-to-online sync', async ({ page, context }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('button[type="submit"]');

  // Go offline
  await context.setOffline(true);

  // Create transaction offline
  await page.click('button:has-text("إضافة معاملة")');
  await page.fill('[name="amount"]', '150');
  await page.click('button:has-text("حفظ")');

  // Verify saved locally
  await expect(page.locator('.pending-sync-badge')).toHaveText('1');

  // Go online and sync
  await context.setOffline(false);
  await page.waitForSelector('.sync-success-toast');

  // Verify synced
  await expect(page.locator('.pending-sync-badge')).toHaveText('0');
});
```

---

## Coding Standards

### Critical Fullstack Rules

- **Type Sharing:** Always define types in packages/shared and import from there
- **API Calls:** Never make direct HTTP calls - always use the tRPC client service layer
- **Environment Variables:** Access only through config objects, never process.env directly
- **Error Handling:** All API routes must use the standard error handler middleware
- **State Updates:** Never mutate state directly - use proper state management patterns
- **Multi-tenant Isolation:** Every database query must include shopId filtering
- **Arabic Support:** All user-facing strings must have Arabic translations
- **Offline First:** All data mutations must handle offline state and queue for sync

### Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `TransactionForm.tsx` |
| Hooks | camelCase with 'use' | - | `useOfflineSync.ts` |
| API Routes | - | kebab-case | `/api/transaction-sync` |
| Database Tables | - | snake_case | `financial_years` |

---

## Error Handling Strategy

### Error Response Format

```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}
```

### Error Handling Implementation

```typescript
// Frontend Error Handler
export function useErrorHandler() {
  const handleError = (error: unknown) => {
    if (error instanceof TRPCClientError) {
      switch (error.data?.code) {
        case 'UNAUTHORIZED':
          router.push('/login');
          break;
        case 'FORBIDDEN':
          if (error.message.includes('sync')) {
            showSyncRequiredDialog();
          }
          break;
        default:
          toast.error(error.message);
      }
    }
  };

  return { handleError };
}
```

---

## Monitoring and Observability

### Monitoring Stack

- **Frontend Monitoring:** Vercel Analytics + Sentry
- **Backend Monitoring:** Vercel Functions + Sentry
- **Error Tracking:** Sentry with source maps
- **Performance Monitoring:** Core Web Vitals

### Key Metrics

**Frontend Metrics:**
- Core Web Vitals (LCP, FID, CLS)
- JavaScript errors by page
- API response times
- Sync success rate

**Backend Metrics:**
- Request rate by endpoint
- Error rate by error code
- Response time P50/P95/P99
- Database query performance

**Business Metrics:**
- Daily active users per shop
- Transactions per day
- Sync compliance percentage
- Report generation count

---

## Document Summary

This fullstack architecture document provides a comprehensive blueprint for building the Multi-Shop Spare Parts Accounting application. Key architectural decisions include:

- **T3 Stack Foundation** for type-safe fullstack development
- **Offline-first design** with mandatory 24-hour sync policy
- **Multi-tenant isolation** at database level with RLS
- **Arabic-first UI** with complete RTL support
- **Comprehensive notification system** across multiple channels
- **Monorepo structure** for efficient code sharing

The architecture prioritizes developer experience, type safety, and user experience while maintaining security and scalability. With this foundation, the development team can confidently build a robust accounting system that meets all business requirements.