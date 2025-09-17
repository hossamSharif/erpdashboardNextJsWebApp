# Database Schema

PostgreSQL database schema with multi-tenant isolation, Arabic support, and audit capabilities.

## Prisma Schema Definition

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
