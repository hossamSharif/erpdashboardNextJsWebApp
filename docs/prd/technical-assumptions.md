# Technical Assumptions

## Repository Structure: Monorepo
A single repository containing both web and mobile applications sharing common code, types, and business logic. This approach maximizes code reuse and ensures consistency across platforms.

## Service Architecture
**T3 Stack Monolithic Architecture with Serverless Functions**
- Single Next.js application serving both web and API
- API routes implemented as serverless functions via Next.js API routes
- tRPC for end-to-end type-safe API communication
- Shared business logic between web and mobile through TypeScript packages
- Database accessed through Prisma ORM with connection pooling

## Testing Requirements
**Comprehensive Testing Pyramid**
- Unit tests for business logic and calculations (Vitest)
- Integration tests for API endpoints and database operations
- E2E tests for critical user flows (Playwright for web, Detox for mobile)
- Manual testing convenience methods for offline/sync scenarios
- Automated testing in CI/CD pipeline with minimum 80% coverage requirement

## Additional Technical Assumptions and Requests

**Core T3 Stack (As per original PRD):**
- Next.js 14 with App Router
- React 18 with TypeScript
- Tailwind CSS for styling
- **Headless UI** for accessible components
- React Hook Form with Zod validation
- Zustand for state management
- tRPC for APIs
- Prisma ORM with PostgreSQL
- NextAuth.js for authentication
- React Native + Expo for mobile
- Expo Router for navigation
- React Native AsyncStorage + **SQLite** for offline storage
- Service Workers & IndexedDB for web offline
- React Query (TanStack Query)
- **Vercel Analytics** for monitoring

**Arabic/RTL Support:**
- i18next for internationalization with Arabic as default
- RTL CSS utilities in Tailwind
- Arabic font stack with proper fallbacks
- Intl API for number/date formatting

**Enhanced Security:**
- Row-level security for multi-tenant isolation
- Encrypted local storage
- API rate limiting
- OWASP compliance

**Infrastructure:**
- Vercel for hosting
- Vercel Postgres or Supabase
- Expo EAS for mobile builds
- Firebase Cloud Messaging
- Sentry for error tracking
- GitHub Actions for CI/CD

**Development Tools:**
- pnpm for monorepo management
- Turborepo for build orchestration
- ESLint & Prettier
- Husky for git hooks

---
