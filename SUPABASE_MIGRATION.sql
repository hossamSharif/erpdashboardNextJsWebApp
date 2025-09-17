-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "public"."AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('SALE', 'PURCHASE', 'PAYMENT', 'RECEIPT', 'ADJUSTMENT', 'TRANSFER', 'OPENING_BALANCE', 'CLOSING_BALANCE');

-- CreateEnum
CREATE TYPE "public"."AccountCategory" AS ENUM ('CASH', 'BANK');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('TRANSACTION_CREATED', 'TRANSACTION_UPDATED', 'SYNC_COMPLETED', 'SYNC_FAILED', 'LOW_STOCK_ALERT', 'PAYMENT_DUE', 'SYSTEM_UPDATE');

-- CreateEnum
CREATE TYPE "public"."SyncType" AS ENUM ('MANUAL', 'AUTOMATIC', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "public"."SyncStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable shops
CREATE TABLE "public"."shops" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "ownerId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable users
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hashedPassword" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "shopId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable accounts
CREATE TABLE "public"."accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "accountType" "public"."AccountType" NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "parentId" UUID,
    "shopId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystemAccount" BOOLEAN NOT NULL DEFAULT false,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable transactions
CREATE TABLE "public"."transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transactionType" "public"."TransactionType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "amountPaid" DECIMAL(15,2),
    "change" DECIMAL(15,2),
    "description" TEXT,
    "notes" TEXT,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "debitAccountId" UUID NOT NULL,
    "creditAccountId" UUID NOT NULL,
    "debitUserId" UUID NOT NULL,
    "creditUserId" UUID NOT NULL,
    "shopId" UUID NOT NULL,
    "financialYearId" UUID NOT NULL,
    "isSynced" BOOLEAN NOT NULL DEFAULT false,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable financial_years
CREATE TABLE "public"."financial_years" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "openingStockValue" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "closingStockValue" DECIMAL(15,2),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "shopId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "financial_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable stock_value_history
CREATE TABLE "public"."stock_value_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "financialYearId" UUID NOT NULL,
    "fieldChanged" TEXT NOT NULL,
    "oldValue" DECIMAL(15,2),
    "newValue" DECIMAL(15,2) NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stock_value_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable notifications
CREATE TABLE "public"."notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "messageAr" TEXT NOT NULL,
    "messageEn" TEXT NOT NULL,
    "notificationType" "public"."NotificationType" NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "isPushSent" BOOLEAN NOT NULL DEFAULT false,
    "isSMSSent" BOOLEAN NOT NULL DEFAULT false,
    "userId" UUID NOT NULL,
    "shopId" UUID NOT NULL,
    "relatedEntityId" UUID,
    "scheduledFor" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable sync_logs
CREATE TABLE "public"."sync_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "syncType" "public"."SyncType" NOT NULL,
    "syncStatus" "public"."SyncStatus" NOT NULL DEFAULT 'PENDING',
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "conflictsResolved" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER,
    "errorDetails" TEXT,
    "metadata" TEXT,
    "shopId" UUID NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable cash_accounts
CREATE TABLE "public"."cash_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "shopId" UUID NOT NULL,
    "openingBalance" DECIMAL(15,2) NOT NULL,
    "currentBalance" DECIMAL(15,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cash_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable bank_accounts
CREATE TABLE "public"."bank_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "iban" TEXT,
    "shopId" UUID NOT NULL,
    "openingBalance" DECIMAL(15,2) NOT NULL,
    "currentBalance" DECIMAL(15,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable balance_history
CREATE TABLE "public"."balance_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "accountType" "public"."AccountCategory" NOT NULL,
    "accountId" UUID NOT NULL,
    "previousBalance" DECIMAL(15,2) NOT NULL,
    "newBalance" DECIMAL(15,2) NOT NULL,
    "changeAmount" DECIMAL(15,2) NOT NULL,
    "changeReason" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "shopId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "balance_history_pkey" PRIMARY KEY ("id")
);

-- Create Indexes
CREATE UNIQUE INDEX "shops_code_key" ON "public"."shops"("code");
CREATE INDEX "shops_ownerId_idx" ON "public"."shops"("ownerId");
CREATE INDEX "shops_isActive_idx" ON "public"."shops"("isActive");

CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");
CREATE INDEX "users_shopId_idx" ON "public"."users"("shopId");
CREATE INDEX "users_email_idx" ON "public"."users"("email");
CREATE INDEX "users_lastSyncAt_idx" ON "public"."users"("lastSyncAt");
CREATE INDEX "users_role_idx" ON "public"."users"("role");

CREATE INDEX "accounts_shopId_idx" ON "public"."accounts"("shopId");
CREATE INDEX "accounts_accountType_idx" ON "public"."accounts"("accountType");
CREATE INDEX "accounts_parentId_idx" ON "public"."accounts"("parentId");
CREATE INDEX "accounts_level_idx" ON "public"."accounts"("level");
CREATE UNIQUE INDEX "accounts_shopId_code_key" ON "public"."accounts"("shopId", "code");

CREATE INDEX "transactions_shopId_idx" ON "public"."transactions"("shopId");
CREATE INDEX "transactions_shopId_transactionDate_idx" ON "public"."transactions"("shopId", "transactionDate");
CREATE INDEX "transactions_debitAccountId_idx" ON "public"."transactions"("debitAccountId");
CREATE INDEX "transactions_creditAccountId_idx" ON "public"."transactions"("creditAccountId");
CREATE INDEX "transactions_transactionType_idx" ON "public"."transactions"("transactionType");
CREATE INDEX "transactions_isSynced_idx" ON "public"."transactions"("isSynced");
CREATE INDEX "transactions_financialYearId_idx" ON "public"."transactions"("financialYearId");

CREATE INDEX "financial_years_shopId_idx" ON "public"."financial_years"("shopId");
CREATE INDEX "financial_years_isCurrent_idx" ON "public"."financial_years"("isCurrent");
CREATE INDEX "financial_years_isClosed_idx" ON "public"."financial_years"("isClosed");
CREATE UNIQUE INDEX "financial_years_shopId_isCurrent_key" ON "public"."financial_years"("shopId", "isCurrent");

CREATE INDEX "stock_value_history_financialYearId_idx" ON "public"."stock_value_history"("financialYearId");
CREATE INDEX "stock_value_history_changedAt_idx" ON "public"."stock_value_history"("changedAt");
CREATE INDEX "stock_value_history_fieldChanged_idx" ON "public"."stock_value_history"("fieldChanged");

CREATE INDEX "notifications_shopId_idx" ON "public"."notifications"("shopId");
CREATE INDEX "notifications_userId_isRead_idx" ON "public"."notifications"("userId", "isRead");
CREATE INDEX "notifications_notificationType_idx" ON "public"."notifications"("notificationType");
CREATE INDEX "notifications_priority_idx" ON "public"."notifications"("priority");
CREATE INDEX "notifications_scheduledFor_idx" ON "public"."notifications"("scheduledFor");

CREATE INDEX "sync_logs_shopId_idx" ON "public"."sync_logs"("shopId");
CREATE INDEX "sync_logs_syncType_idx" ON "public"."sync_logs"("syncType");
CREATE INDEX "sync_logs_syncStatus_idx" ON "public"."sync_logs"("syncStatus");
CREATE INDEX "sync_logs_startedAt_idx" ON "public"."sync_logs"("startedAt");
CREATE INDEX "sync_logs_completedAt_idx" ON "public"."sync_logs"("completedAt");

CREATE UNIQUE INDEX "cash_accounts_shopId_isDefault_key" ON "public"."cash_accounts"("shopId", "isDefault");
CREATE INDEX "cash_accounts_shopId_idx" ON "public"."cash_accounts"("shopId");

CREATE UNIQUE INDEX "bank_accounts_shopId_isDefault_key" ON "public"."bank_accounts"("shopId", "isDefault");
CREATE INDEX "bank_accounts_shopId_idx" ON "public"."bank_accounts"("shopId");

CREATE INDEX "balance_history_accountType_idx" ON "public"."balance_history"("accountType");
CREATE INDEX "balance_history_accountId_idx" ON "public"."balance_history"("accountId");
CREATE INDEX "balance_history_shopId_idx" ON "public"."balance_history"("shopId");
CREATE INDEX "balance_history_createdAt_idx" ON "public"."balance_history"("createdAt");

-- Add Foreign Keys
ALTER TABLE "public"."users" ADD CONSTRAINT "users_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_debitAccountId_fkey" FOREIGN KEY ("debitAccountId") REFERENCES "public"."accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_creditAccountId_fkey" FOREIGN KEY ("creditAccountId") REFERENCES "public"."accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_debitUserId_fkey" FOREIGN KEY ("debitUserId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_creditUserId_fkey" FOREIGN KEY ("creditUserId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_financialYearId_fkey" FOREIGN KEY ("financialYearId") REFERENCES "public"."financial_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."financial_years" ADD CONSTRAINT "financial_years_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."stock_value_history" ADD CONSTRAINT "stock_value_history_financialYearId_fkey" FOREIGN KEY ("financialYearId") REFERENCES "public"."financial_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."sync_logs" ADD CONSTRAINT "sync_logs_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."cash_accounts" ADD CONSTRAINT "cash_accounts_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."bank_accounts" ADD CONSTRAINT "bank_accounts_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Note: balance_history has dynamic references based on accountType
-- You may need to handle this in application logic rather than FK constraints