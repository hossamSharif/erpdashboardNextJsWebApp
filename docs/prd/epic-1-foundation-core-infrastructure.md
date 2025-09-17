# Epic 1: Foundation & Core Infrastructure

**Goal:** Establish the foundational T3 Stack architecture with authentication, multi-language support (Arabic default), and core database schema for multi-tenant operations. This epic delivers the technical backbone and a simple health check page to verify the system is operational.

## Story 1.1: Project Setup & Configuration
**As a** developer,
**I want** to initialize the T3 Stack monorepo with proper configuration,
**so that** we have a consistent development environment across the team.

**Acceptance Criteria:**
1. Next.js 14 project initialized with App Router and TypeScript
2. Monorepo structure created with separate packages for web and mobile
3: Tailwind CSS configured with RTL support and Arabic-friendly utilities
4: ESLint, Prettier, and Husky configured for code quality
5: Git repository initialized with proper .gitignore and conventional commits
6: Environment variables structure defined for development/staging/production
7: Docker compose file created for local PostgreSQL development
8: README with setup instructions and architecture overview

## Story 1.2: Database Schema & Multi-tenant Setup
**As a** system architect,
**I want** to implement the core database schema with multi-tenant isolation,
**so that** each shop's data is completely separated and secure.

**Acceptance Criteria:**
1: Prisma schema created with User, Shop, Account, Transaction, and FinancialYear models
2: Multi-tenant isolation implemented with shop-based data filtering
3: Bilingual fields (nameAr, nameEn) added to all relevant models
4: Database migrations created and tested
5: Seed data script created for development testing
6: Row-level security policies defined for tenant isolation
7: Database connection pooling configured for performance
8: Indexes created for common query patterns

## Story 1.3: Authentication System
**As a** user,
**I want** to securely login with role-based access,
**so that** I can access my assigned shop's data.

**Acceptance Criteria:**
1: NextAuth.js configured with JWT strategy
2: Login page created with Arabic/English language toggle
3: Role-based authentication (Admin/User) implemented
4: Shop selection/assignment during login for users
5: Session management with 8-hour timeout
6: Password encryption with bcrypt
7: Login attempt rate limiting implemented
8: Logout functionality with session cleanup

## Story 1.4: Internationalization Setup
**As a** Arabic-speaking user,
**I want** the application to default to Arabic with proper RTL layout,
**so that** I can use the system in my native language.

**Acceptance Criteria:**
1: i18next configured with Arabic as default language
2: RTL CSS utilities configured in Tailwind
3: Arabic and English translation files created for common UI elements
4: Language switcher component created and placed in UI
5: Arabic fonts (Cairo, Tajawal) configured with proper fallbacks
6: Number formatting configured for Arabic-Indic numerals option
7: Date formatting configured for DD/MM/YYYY format
8: All UI components tested for RTL layout compatibility

## Story 1.5: Basic Health Check & Landing Page
**As a** developer,
**I want** a simple landing page that verifies all systems are operational,
**so that** we can confirm the infrastructure is working correctly.

**Acceptance Criteria:**
1: Health check API endpoint created returning system status
2: Simple landing page showing "System Operational" in Arabic/English
3: Database connection test displayed on health check
4: Authentication status indicator
5: Current language and RTL mode displayed
6: API response time monitoring
7: Deployment to Vercel successful
8: Mobile app shell created with Expo showing same health check

---
