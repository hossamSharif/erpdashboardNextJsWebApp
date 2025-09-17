-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "public"."AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('SALE', 'PURCHASE', 'PAYMENT', 'RECEIPT', 'ADJUSTMENT', 'TRANSFER', 'OPENING_BALANCE', 'CLOSING_BALANCE');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('TRANSACTION_CREATED', 'TRANSACTION_UPDATED', 'SYNC_COMPLETED', 'SYNC_FAILED', 'LOW_STOCK_ALERT', 'PAYMENT_DUE', 'SYSTEM_UPDATE');

-- CreateEnum
CREATE TYPE "public"."SyncType" AS ENUM ('MANUAL', 'AUTOMATIC', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "public"."SyncStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."shops" (
    "id" UUID NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "ownerId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hashedPassword" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "shopId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "accountType" "public"."AccountType" NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "parentId" UUID,
    "shopId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transactions" (
    "id" UUID NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."financial_years" (
    "id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "openingStock" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "closingStock" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "shopId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" UUID NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sync_logs" (
    "id" UUID NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shops_ownerId_idx" ON "public"."shops"("ownerId");

-- CreateIndex
CREATE INDEX "shops_isActive_idx" ON "public"."shops"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_shopId_idx" ON "public"."users"("shopId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_lastSyncAt_idx" ON "public"."users"("lastSyncAt");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "public"."users"("role");

-- CreateIndex
CREATE INDEX "accounts_shopId_idx" ON "public"."accounts"("shopId");

-- CreateIndex
CREATE INDEX "accounts_accountType_idx" ON "public"."accounts"("accountType");

-- CreateIndex
CREATE INDEX "accounts_parentId_idx" ON "public"."accounts"("parentId");

-- CreateIndex
CREATE INDEX "accounts_level_idx" ON "public"."accounts"("level");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_shopId_code_key" ON "public"."accounts"("shopId", "code");

-- CreateIndex
CREATE INDEX "transactions_shopId_idx" ON "public"."transactions"("shopId");

-- CreateIndex
CREATE INDEX "transactions_shopId_transactionDate_idx" ON "public"."transactions"("shopId", "transactionDate");

-- CreateIndex
CREATE INDEX "transactions_debitAccountId_idx" ON "public"."transactions"("debitAccountId");

-- CreateIndex
CREATE INDEX "transactions_creditAccountId_idx" ON "public"."transactions"("creditAccountId");

-- CreateIndex
CREATE INDEX "transactions_transactionType_idx" ON "public"."transactions"("transactionType");

-- CreateIndex
CREATE INDEX "transactions_isSynced_idx" ON "public"."transactions"("isSynced");

-- CreateIndex
CREATE INDEX "transactions_financialYearId_idx" ON "public"."transactions"("financialYearId");

-- CreateIndex
CREATE INDEX "financial_years_shopId_idx" ON "public"."financial_years"("shopId");

-- CreateIndex
CREATE INDEX "financial_years_isCurrent_idx" ON "public"."financial_years"("isCurrent");

-- CreateIndex
CREATE INDEX "financial_years_isClosed_idx" ON "public"."financial_years"("isClosed");

-- CreateIndex
CREATE UNIQUE INDEX "financial_years_shopId_year_key" ON "public"."financial_years"("shopId", "year");

-- CreateIndex
CREATE INDEX "notifications_shopId_idx" ON "public"."notifications"("shopId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "public"."notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_notificationType_idx" ON "public"."notifications"("notificationType");

-- CreateIndex
CREATE INDEX "notifications_priority_idx" ON "public"."notifications"("priority");

-- CreateIndex
CREATE INDEX "notifications_scheduledFor_idx" ON "public"."notifications"("scheduledFor");

-- CreateIndex
CREATE INDEX "sync_logs_shopId_idx" ON "public"."sync_logs"("shopId");

-- CreateIndex
CREATE INDEX "sync_logs_syncType_idx" ON "public"."sync_logs"("syncType");

-- CreateIndex
CREATE INDEX "sync_logs_syncStatus_idx" ON "public"."sync_logs"("syncStatus");

-- CreateIndex
CREATE INDEX "sync_logs_startedAt_idx" ON "public"."sync_logs"("startedAt");

-- CreateIndex
CREATE INDEX "sync_logs_completedAt_idx" ON "public"."sync_logs"("completedAt");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_debitAccountId_fkey" FOREIGN KEY ("debitAccountId") REFERENCES "public"."accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_creditAccountId_fkey" FOREIGN KEY ("creditAccountId") REFERENCES "public"."accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_debitUserId_fkey" FOREIGN KEY ("debitUserId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_creditUserId_fkey" FOREIGN KEY ("creditUserId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_financialYearId_fkey" FOREIGN KEY ("financialYearId") REFERENCES "public"."financial_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."financial_years" ADD CONSTRAINT "financial_years_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sync_logs" ADD CONSTRAINT "sync_logs_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

