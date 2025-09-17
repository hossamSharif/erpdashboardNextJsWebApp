# Data Models

Core data models/entities shared between frontend and backend, derived from PRD requirements and business logic.

## Shop

**Purpose:** Central tenant entity representing a spare parts shop location with complete data isolation and bilingual naming support.

**Key Attributes:**
- id: string (UUID) - Unique shop identifier
- nameAr: string - Arabic shop name (primary)
- nameEn: string - English shop name (secondary)
- isActive: boolean - Shop operational status
- ownerId: string - Reference to admin user
- createdAt: DateTime - Shop creation timestamp
- updatedAt: DateTime - Last modification timestamp

### TypeScript Interface
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

### Relationships
- Has many Users (shop workers)
- Has many Accounts (shop-specific account hierarchy)
- Has many FinancialYears (annual accounting periods)
- Has many Transactions (all financial activities)

## User

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

### TypeScript Interface
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

### Relationships
- Belongs to one Shop
- Creates many Transactions
- Has many ActivityLogs (audit trail)

## Account

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

### TypeScript Interface
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

### Relationships
- Belongs to one Shop
- Self-referencing hierarchy (parent/children)
- Has many Transactions

## Transaction

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

### TypeScript Interface
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

### Relationships
- Belongs to one Shop
- Created by one User
- References primary Account
- May reference counter Account (for transfers)

## FinancialYear

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

### TypeScript Interface
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

### Relationships
- Belongs to one Shop

## Notification

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

### TypeScript Interface
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

### Relationships
- Belongs to one User
- Belongs to one Shop

## SyncLog

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

### TypeScript Interface
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

### Relationships
- Belongs to one User
- Belongs to one Shop

---
