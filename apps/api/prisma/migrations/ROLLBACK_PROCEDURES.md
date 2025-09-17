# Database Migration Rollback Procedures

## Overview
This document outlines the procedures for rolling back database migrations in the Multi-Shop Accounting ERP system.

## Migration: 20250917_initial_multi_tenant_schema

### Rollback Script
To rollback this migration, execute the following SQL commands in reverse order:

```sql
-- Remove Foreign Keys
ALTER TABLE "public"."sync_logs" DROP CONSTRAINT "sync_logs_shopId_fkey";
ALTER TABLE "public"."notifications" DROP CONSTRAINT "notifications_userId_fkey";
ALTER TABLE "public"."notifications" DROP CONSTRAINT "notifications_shopId_fkey";
ALTER TABLE "public"."financial_years" DROP CONSTRAINT "financial_years_shopId_fkey";
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_financialYearId_fkey";
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_creditUserId_fkey";
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_debitUserId_fkey";
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_creditAccountId_fkey";
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_debitAccountId_fkey";
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_shopId_fkey";
ALTER TABLE "public"."accounts" DROP CONSTRAINT "accounts_parentId_fkey";
ALTER TABLE "public"."accounts" DROP CONSTRAINT "accounts_shopId_fkey";
ALTER TABLE "public"."users" DROP CONSTRAINT "users_shopId_fkey";

-- Drop Tables
DROP TABLE IF EXISTS "public"."sync_logs";
DROP TABLE IF EXISTS "public"."notifications";
DROP TABLE IF EXISTS "public"."financial_years";
DROP TABLE IF EXISTS "public"."transactions";
DROP TABLE IF EXISTS "public"."accounts";
DROP TABLE IF EXISTS "public"."users";
DROP TABLE IF EXISTS "public"."shops";

-- Drop Enums
DROP TYPE IF EXISTS "public"."SyncStatus";
DROP TYPE IF EXISTS "public"."SyncType";
DROP TYPE IF EXISTS "public"."NotificationType";
DROP TYPE IF EXISTS "public"."TransactionType";
DROP TYPE IF EXISTS "public"."AccountType";
DROP TYPE IF EXISTS "public"."UserRole";
```

### Verification Commands
After rollback, verify that all objects have been removed:

```sql
-- Check for remaining tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN (
  'shops', 'users', 'accounts', 'transactions',
  'financial_years', 'notifications', 'sync_logs'
);

-- Check for remaining enums
SELECT typname FROM pg_type WHERE typtype = 'e';
```

### Recovery Procedure
If you need to re-apply the migration after rollback:

1. Ensure the rollback was completed successfully
2. Re-run the migration: `npx prisma migrate deploy`
3. Verify all constraints and indexes are properly created
4. Restore any backed-up data if necessary

### Safety Guidelines
1. **Always backup the database before performing rollbacks**
2. **Test rollback procedures in a development environment first**
3. **Coordinate with team members before rolling back in production**
4. **Document any data loss or changes that occur during rollback**

### Emergency Contacts
- Database Administrator: [Contact Information]
- DevOps Team: [Contact Information]
- Development Team Lead: [Contact Information]