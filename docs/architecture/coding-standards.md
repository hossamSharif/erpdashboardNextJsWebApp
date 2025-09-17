# Coding Standards

## Critical Fullstack Rules

- **Type Sharing:** Always define types in packages/shared and import from there
- **API Calls:** Never make direct HTTP calls - always use the tRPC client service layer
- **Environment Variables:** Access only through config objects, never process.env directly
- **Error Handling:** All API routes must use the standard error handler middleware
- **State Updates:** Never mutate state directly - use proper state management patterns
- **Multi-tenant Isolation:** Every database query must include shopId filtering
- **Arabic Support:** All user-facing strings must have Arabic translations
- **Offline First:** All data mutations must handle offline state and queue for sync

## Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `TransactionForm.tsx` |
| Hooks | camelCase with 'use' | - | `useOfflineSync.ts` |
| API Routes | - | kebab-case | `/api/transaction-sync` |
| Database Tables | - | snake_case | `financial_years` |

---
