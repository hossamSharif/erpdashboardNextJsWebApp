# Multi-Shop Spare Parts Accounting App Product Requirements Document (PRD)

## Goals and Background Context

### Goals
- Enable centralized financial management across multiple spare parts shops with real-time visibility
- Automate profit margin calculations based on opening and ending stock values
- Provide offline-first mobile solution for shop floor operations with seamless sync
- Implement role-based access control separating admin (shop owners) and user (shop workers) capabilities
- Support multi-currency financial reporting with daily exchange rate updates
- Deliver automated daily financial reporting with comprehensive notification system
- Reduce manual accounting errors by 75% through digital transformation
- Achieve 80% daily active user adoption with 95% daily report compliance

### Background Context
The spare parts retail industry currently relies on manual financial tracking methods that lead to inconsistent reporting, delayed profit visibility, and difficulty monitoring worker performance across multiple shop locations. Shop owners need real-time insight into profitability through accurate stock value tracking and automated profit calculations. This PRD defines a comprehensive mobile-first accounting application specifically designed for multi-shop spare parts businesses, addressing the critical need for standardized financial management with robust offline capabilities to ensure uninterrupted operations regardless of network connectivity.

The solution leverages modern web technologies through the T3 Stack (Next.js, TypeScript, tRPC, Prisma) to deliver a unified codebase serving both web and mobile platforms, significantly reducing development complexity while ensuring type safety and maintainability across the entire application stack.

### Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-09-16 | 1.0 | Initial PRD creation from existing requirements | John (PM) |

---

## Requirements

### Functional

- FR1: The system shall support multi-tenant architecture allowing single admin to manage multiple spare parts shops with complete data isolation (each shop's data is completely segregated from other shops)
- FR2: The system shall calculate profit using the formula: Profit = (Ending Stock Value - Opening Stock Value) + Sales Revenue - Purchase Costs - Operating Expenses
- FR3: The system shall enable users to enter daily financial transactions including sales totals, purchase totals, and expenses without requiring item-level details
- FR4: The system shall maintain hierarchical account structure with bilingual names (Arabic and English) for all accounts and sub-accounts
- FR5: The system shall support offline operation with automatic synchronization when network connectivity is restored
- FR6: The system shall implement role-based access control with distinct Admin (shop owner) and User (shop worker) interfaces
- FR7: The system shall track partial payments for customer and supplier accounts with outstanding balance management
- FR8: The system shall generate automated daily financial reports with configurable notification schedules
- FR9: The system shall support multi-currency display with admin-managed daily exchange rates while storing all amounts in base currency (SDG)
- FR10: The system shall allow internal transfers between cash and bank accounts with balance reconciliation
- FR11: The system shall maintain opening and ending stock values as monetary amounts (not physical inventory) for profit calculations
- FR12: The system shall provide real-time financial dashboard showing cash balance, bank balance, and current stock values
- FR13: The system shall enforce daily financial report submission with escalation notifications for missing reports
- FR14: The system shall preserve audit trail for all financial transactions including modifications and user actions
- FR15: The system shall support financial year management with historical data preservation
- FR16: The system shall log all synchronization operations (manual and automatic) with timestamp, user ID, sync status, data volume, and duration
- FR17: The system shall provide admin interface to view detailed sync history including success/failure status, conflict resolutions, and affected records
- FR18: The system shall send daily notifications to users with pending unsynchronized local data prompting them to perform manual sync
- FR19: The system shall display visual indicators showing count of pending local transactions awaiting synchronization
- FR20: The system shall escalate sync alerts to admin if user has unsynchronized data older than 24 hours
- FR21: The system shall require mandatory synchronization every 24 hours when local transactions exist
- FR22: The system shall prevent new transaction entry if last sync was more than 24 hours ago and pending transactions exist
- FR23: The system shall automatically append shop name as suffix to all shop-specific sub-accounts (e.g., "Sales-Downtown", "المبيعات-وسط المدينة")
- FR24: The system shall default to Arabic language and RTL layout on first launch, with option to switch to English/LTR
- FR25: The system shall support right-to-left (RTL) layout when Arabic language is selected
- FR26: The system shall categorize expense sub-accounts for filtering, sorting, and analytics reporting (e.g., salaries, breakfast, utilities)
- FR27: The system shall track partial payments with separate fields for "amount paid" and "change" on invoices
- FR28: The system shall maintain user activity logs including entry actions (add/modify/delete), login/logout, sync operations, and profile changes
- FR29: The system shall generate and export daily reports in shareable formats (PDF, Excel) for email and WhatsApp sharing
- FR30: The system shall display real-time cash-in-hand and bank balance in the top status bar of daily entries page
- FR31: The system shall group daily entries by date with expandable/collapsible views in the records page
- FR32: The system shall provide animated navigation between daily entry pages with smooth transitions
- FR33: The system shall restrict sub-account creation permissions (users cannot create sub-accounts under sales, purchase, cash, bank, or stock accounts)
- FR34: The system shall allow admin to set notification timing preferences for missing daily entries
- FR35: The system shall track and display sync history including last sync time, data volume, and success/failure status
- FR36: The system shall provide visual account hierarchy viewer for admins to see all account relationships
- FR37: The system shall generate formal Profit & Loss statements per shop and consolidated
- FR38: The system shall allow bulk selection of entries for batch operations (delete, export)
- FR39: The system shall provide in-app help and tutorial system for user guidance
- FR40: The system shall display quick stats widget showing daily totals (sales, purchases, expenses)
- FR41: The system shall show clickable balance details revealing transaction history
- FR42: The system shall provide password reset flow via email verification
- FR43: The system shall support optional two-factor authentication for enhanced security
- FR44: The system shall allow bulk operations on multiple shops simultaneously for admin
- FR45: The system shall track and display currency rate history with change notifications
- FR46: The system shall provide comparative analytics allowing shop-to-shop comparison
- FR47: The system shall support data import/export operations for migration
- FR48: The system shall provide backup and restore functionality for data protection
- FR49: The system shall display version update notifications with changelog
- FR50: The system shall provide receipt/invoice preview before sharing via email/WhatsApp
- FR51: The system shall support Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) with option to switch to Western numerals
- FR52: The system shall display all system messages, errors, and notifications in user's selected language
- FR53: The system shall support both Hijri and Gregorian calendar systems with Arabic month/day names
- FR54: The system shall format all currency displays according to Arabic conventions (right-aligned with Arabic currency names)
- FR55: The system shall reverse all navigation gestures and animations when in RTL mode
- FR56: The system shall provide Arabic keyboard as default input method for Arabic interface
- FR57: The system shall display bilingual tooltips with Arabic as primary language
- FR58: The system shall generate reports in Arabic by default with option for English

### Non Functional

- NFR1: The mobile application shall launch in less than 3 seconds on devices with minimum 2GB RAM
- NFR2: Financial transaction entry shall complete within 1 second for optimal user experience
- NFR3: The system shall support 100+ concurrent active users without performance degradation
- NFR4: Daily data synchronization shall complete within 30 seconds for typical shop operations
- NFR5: The application shall function fully offline for up to 30 days with local storage of transaction history
- NFR6: The system shall handle 10,000+ financial transactions per day across all shops
- NFR7: All API communications shall use TLS 1.3 encryption with AES-256 encryption for data at rest
- NFR8: The system shall maintain 99.9% uptime availability for production environment
- NFR9: The system shall enforce mandatory sync within 24 hours of first unsynchronized transaction
- NFR10: Monthly financial reports shall generate within 10 seconds for performance optimization
- NFR11: The system shall implement automatic conflict resolution using last-write-wins strategy with audit trail
- NFR12: Mobile application shall minimize battery consumption through optimized background processing
- NFR13: The system shall support responsive design from 320px mobile to 1024px+ desktop viewports
- NFR14: User authentication tokens shall expire after 8 hours of inactivity for security
- NFR15: The system shall implement rate limiting on API endpoints to prevent abuse
- NFR16: The system shall persist sync logs for minimum 90 days for audit and troubleshooting purposes
- NFR17: Sync status notifications shall appear within 5 seconds of detecting unsynchronized local data
- NFR18: The system shall attempt automatic sync every 4 hours when network is available and transactions are pending
- NFR19: The system shall support full Unicode with proper Arabic text shaping and ligatures
- NFR20: Account name searches shall work with both Arabic and English names regardless of selected interface language
- NFR21: The system shall provide smooth page transition animations completed within 300ms
- NFR22: The export functionality shall generate reports within 3 seconds for daily data
- NFR23: The notification badge shall update in real-time when new notifications arrive
- NFR24: The side menu shall toggle with smooth animation in less than 200ms
- NFR25: Search and filter operations shall return results within 1 second for up to 10,000 records
- NFR26: The help system shall load within 2 seconds with offline content caching
- NFR27: Bulk operations shall process up to 100 items within 5 seconds
- NFR28: The account hierarchy viewer shall render up to 500 accounts without lag
- NFR29: P&L statement generation shall complete within 5 seconds per shop
- NFR30: Password reset email shall be sent within 30 seconds of request
- NFR31: Two-factor authentication codes shall be valid for 5 minutes
- NFR32: Comparative analytics shall load within 3 seconds for up to 10 shops
- NFR33: Data export shall handle up to 50,000 records in a single operation
- NFR34: Backup operations shall complete within 60 seconds for typical data volumes
- NFR35: Theme switching shall apply instantly without page reload
- NFR36: The system shall render Arabic fonts with appropriate size and weight for optimal readability
- NFR37: The RTL/LTR layout switch shall complete within 100ms without content jumping
- NFR38: The system shall properly mirror all icons and graphics for RTL layout
- NFR39: The system shall support Arabic text search with diacritics-insensitive matching
- NFR40: The system shall handle mixed RTL/LTR content (Arabic with English numbers/names) correctly

---

## User Interface Design Goals

### Overall UX Vision
Create an intuitive, **Arabic-first** mobile accounting application with **Arabic as the default language** and full RTL layout support. The interface should prioritize speed and efficiency for daily financial operations by shop workers in Arabic-speaking markets. While supporting English as a secondary language, all UI elements, navigation, and interactions should be optimized for RTL reading patterns. Focus on one-handed operation for mobile users, with large touch targets and culturally appropriate gestures.

### Key Interaction Paradigms
- **RTL-Optimized Navigation**:
  - In Arabic mode: RIGHT arrow = next/future date, LEFT arrow = previous date
  - Swipe directions follow RTL patterns (swipe right-to-left for next)
- **Arabic-First Forms**: All forms default to Arabic with RTL text alignment
- **Bilingual Display**: Account names show Arabic primary, English secondary
- **Number Display**: Support both Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) and Western numerals
- **Calendar**: Support both Hijri and Gregorian calendars with Arabic month names
- **Cultural Date Format**: DD/MM/YYYY format as standard

### Core Screens and Views

**Shop Users Interface:**

1. **Daily Entries Page (Primary Landing)** - Opens immediately after authentication
   - **Toolbar Elements:**
     - Add New Entry button (opens modal)
     - Date picker to jump to specific date
     - RIGHT arrow to navigate to previous date
     - LEFT arrow to navigate to next/future date
     - Export button (generates daily report)
     - Share button (email/WhatsApp integration)
   - **Top Status Bar:**
     - Real-time cash-in-hand and bank balance (clickable for details)
     - Offline mode banner when no network
     - Pending sync count indicator
   - **Quick Stats Widget:** Today's totals (sales, purchases, expenses)
   - **Entry List:** All entries for selected day in descending order
   - **Entry Actions:** Direct edit/delete options on each entry
   - **Navigation:** Smooth animations when moving between dates

2. **Add/Edit Entry Modal** - Three transaction categories:
   - Sales/Purchase entries (with customer/supplier selection)
   - Expense entries (with category selection)
   - Internal transfers (cash to bank or vice versa)

3. **Toggle Side Menu (Icon Only)**
   - Sync button (manual sync trigger)
   - Notifications with unread badge count
   - Customer/Supplier accounts access
   - Help/Tutorial access
   - Language switcher (AR/EN)
   - Theme toggle (light/dark)

4. **Records of Daily Entries Page**
   - Default view: Entries grouped by day (expandable)
   - Alternative view: All entries ungrouped
   - Bulk selection mode for multiple entries
   - Click any grouped date to navigate to that day's daily entries
   - Filter/search/sort capabilities
   - Export filtered results via email/WhatsApp
   - Receipt/Invoice preview before sharing

5. **Customer/Supplier Accounts Page**
   - List of user-created sub-accounts
   - Add new customer/supplier
   - View account balance and history
   - Edit account details

6. **Account Balance Details Page**
   - Transaction history for cash/bank
   - Running balance display
   - Filter by date range

7. **User Profile Management**
   - Personal information updates
   - Password/email changes
   - Two-factor authentication setup

8. **Settings Page**
   - Sync controls and status
   - Online/offline mode toggle
   - Sync history display (last sync time)
   - Language preference
   - Theme preference
   - Notification preferences

9. **Logs Page**
   - User's own activity history
   - Filter by action type

10. **Notifications Page**
    - All notifications in chronological order
    - Read/unread status indicators
    - Clear all option

11. **Help/Tutorial Page**
    - In-app guidance
    - Common tasks walkthrough
    - FAQ section

**Admin Interface:**

1. **Admin Dashboard**
   - Multi-shop overview
   - Daily summary of all shops
   - Real-time user activity monitor
   - Alert notifications

2. **Shop Management**
   - Create/edit/delete shops
   - Account hierarchy viewer (visual tree)
   - Bulk shop operations
   - Shop-specific settings

3. **Financial Year Management**
   - Create new financial year
   - Edit year details
   - Close financial year
   - Historical years access

4. **Stock Value Management**
   - Set opening stock values per shop
   - Update ending stock values
   - Historical stock value tracking

5. **User Management**
   - Add/edit/remove users
   - Assign users to shops
   - User permission matrix
   - Activity monitoring per user

6. **Profit & Loss Statement**
   - Formal P&L per shop
   - Consolidated P&L for all shops
   - Export to PDF/Excel

7. **Reports & Analytics**
   - Visual profit analysis
   - Comparative analytics (shop vs shop)
   - Trend analysis
   - Custom date ranges

8. **Currency Management**
   - Add/edit currencies
   - Daily rate updates
   - Currency rate history viewer
   - Rate change notifications

9. **Sync Operations Monitor**
   - All user sync logs
   - Success/failure tracking
   - Data volume metrics
   - Conflict resolution history

10. **Notification Settings**
    - Configure alert types
    - Set timing preferences
    - Alert rules configuration
    - Threshold settings

11. **Audit Trail Page**
    - Comprehensive activity logs
    - Advanced filtering
    - Export capabilities

12. **Data Management**
    - Import/Export operations
    - Backup & restore
    - Data migration tools

13. **User Activity Dashboard**
    - Real-time monitoring
    - Login/logout tracking
    - Transaction patterns
    - Alert generation

**Shared Features (Both User Types):**

1. **Password Reset Flow**
   - Email-based recovery
   - Security questions
   - Admin override option

2. **Network Status Indicator**
   - Persistent connection display
   - Auto-retry on reconnection

3. **Version Update Notifier**
   - New version alerts
   - Changelog display

### Accessibility: WCAG AA
- Minimum touch target size of 44x44 pixels for mobile
- Color contrast ratio of at least 4.5:1 for normal text
- Screen reader support for both Arabic and English
- Clear focus indicators for all interactive elements
- Keyboard navigation support for web interface

### Branding
- Clean, professional design suitable for business accounting
- Color coding: Green (sales), Red (purchases), Orange (expenses), Blue (transfers)
- Subtle animations for state changes and navigation
- Support for light and dark themes
- Consistent iconography across platforms

### Target Device and Platforms: Web Responsive, and all mobile platforms
- **Primary**: Mobile devices (iOS and Android) - 320px to 768px
- **Secondary**: Tablets (iPad, Android tablets) - 768px to 1024px
- **Tertiary**: Desktop browsers - 1024px+
- **Progressive Web App (PWA)** capabilities
- **Native mobile apps** via React Native/Expo

---

## Technical Assumptions

### Repository Structure: Monorepo
A single repository containing both web and mobile applications sharing common code, types, and business logic. This approach maximizes code reuse and ensures consistency across platforms.

### Service Architecture
**T3 Stack Monolithic Architecture with Serverless Functions**
- Single Next.js application serving both web and API
- API routes implemented as serverless functions via Next.js API routes
- tRPC for end-to-end type-safe API communication
- Shared business logic between web and mobile through TypeScript packages
- Database accessed through Prisma ORM with connection pooling

### Testing Requirements
**Comprehensive Testing Pyramid**
- Unit tests for business logic and calculations (Vitest)
- Integration tests for API endpoints and database operations
- E2E tests for critical user flows (Playwright for web, Detox for mobile)
- Manual testing convenience methods for offline/sync scenarios
- Automated testing in CI/CD pipeline with minimum 80% coverage requirement

### Additional Technical Assumptions and Requests

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

## Epic List

**Epic 1: Foundation & Core Infrastructure**
Establish project setup with T3 Stack, authentication system, multi-language support with Arabic as default, and basic database schema for multi-tenant architecture.

**Epic 2: Account Management & Shop Setup**
Create the hierarchical account system with bilingual naming, shop creation workflow, and financial year management including opening/ending stock values.

**Epic 3: Daily Transaction Operations**
Enable core transaction entry for sales, purchases, and expenses with partial payment tracking, customer/supplier management, and real-time balance updates.

**Epic 4: Offline Capability & Sync System**
Implement offline-first architecture with local storage, automatic synchronization, conflict resolution, and comprehensive sync logging with 24-hour mandatory sync policy.

**Epic 5: User Interface & Navigation**
Build the mobile-first responsive UI with Arabic RTL support, daily entries dashboard with swipe navigation, and all user-facing screens including side menu and settings.

**Epic 6: Admin Dashboard & Analytics**
Create admin interface with multi-shop overview, profit calculations based on stock values, comparative analytics, and multi-currency support with daily rate management.

**Epic 7: Notifications & Monitoring**
Implement comprehensive notification system for users and admins, activity logging, audit trails, and real-time monitoring of user actions and sync status.

**Epic 8: Reports & Export Functionality**
Enable report generation including P&L statements, daily reports, data export/sharing via email and WhatsApp, and backup/restore capabilities.

---

## Epic 1: Foundation & Core Infrastructure

**Goal:** Establish the foundational T3 Stack architecture with authentication, multi-language support (Arabic default), and core database schema for multi-tenant operations. This epic delivers the technical backbone and a simple health check page to verify the system is operational.

### Story 1.1: Project Setup & Configuration
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

### Story 1.2: Database Schema & Multi-tenant Setup
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

### Story 1.3: Authentication System
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

### Story 1.4: Internationalization Setup
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

### Story 1.5: Basic Health Check & Landing Page
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

## Epic 2: Account Management & Shop Setup

**Goal:** Implement the complete account hierarchy system with bilingual naming, enable admins to create and manage shops, set up financial years, and configure opening/ending stock values for profit calculations.

### Story 2.1: Shop Creation & Management
**As an** admin,
**I want** to create and manage multiple shops,
**so that** I can track finances for all my spare parts locations.

**Acceptance Criteria:**
1: Shop creation form with Arabic and English name fields
2: Automatic creation of shop-specific sub-accounts with proper suffixes (e.g., sales-downtown, المبيعات-وسط المدينة)
3: Default accounts created: direct-sales-{shop}, direct-purchase-{shop}
4: Shop listing page showing all shops with edit/delete options
5: Shop assignment to users during shop creation
6: Validation preventing duplicate shop names
7: Soft delete implementation to preserve historical data
8: Shop status (active/inactive) management

### Story 2.2: Financial Year Management
**As an** admin,
**I want** to set up and manage financial years,
**so that** I can track annual performance and close books properly.

**Acceptance Criteria:**
1: Financial year creation with start/end dates
2: Multiple financial years per shop support
3: Current financial year indicator
4: Prevent transaction entry in closed financial years
5: Financial year closing process with validation
6: Opening balances carry forward from previous year
7: Historical financial year access (read-only)
8: Warning when financial year end approaches

### Story 2.3: Account Hierarchy Configuration
**As an** admin,
**I want** to view and manage the complete account structure,
**so that** I can ensure proper financial categorization.

**Acceptance Criteria:**
1: Visual tree view of account hierarchy (3 levels)
2: Main accounts display (system-defined, non-editable)
3: Shop sub-accounts management interface
4: Bilingual account names (Arabic/English) display
5: Account type indicators (debit/credit nature)
6: Search functionality for accounts in both languages
7: Account activation/deactivation without deletion
8: Validation preventing circular account relationships

### Story 2.4: Opening & Ending Stock Value Management
**As an** admin,
**I want** to set opening and ending stock values,
**so that** profit calculations accurately reflect inventory changes.

**Acceptance Criteria:**
1: Opening stock value input per shop per financial year
2: Ending stock value periodic update capability
3: Stock value history tracking with timestamps
4: Validation ensuring stock values are non-negative
5: Stock value change audit log
6: Display current stock values on admin dashboard
7: Stock value used in profit calculation formula
8: Bulk stock value update for multiple shops

### Story 2.5: Cash & Bank Account Setup
**As an** admin,
**I want** to configure cash and bank accounts with opening balances,
**so that** financial tracking starts from accurate baseline.

**Acceptance Criteria:**
1: Cash account creation per shop with opening balance
2: Bank account creation per shop with opening balance
3: Multiple bank accounts per shop support
4: Account number and bank details storage
5: Opening balance validation (can be negative for overdraft)
6: Balance history tracking
7: Account reconciliation markers
8: Default payment account selection per shop

### Story 2.6: Expense Category Configuration
**As an** admin,
**I want** to create expense categories,
**so that** expenses can be properly classified for reporting.

**Acceptance Criteria:**
1: Expense category creation with Arabic/English names
2: Category hierarchy support (parent/child categories)
3: Category assignment to expense accounts
4: Default categories: Salaries, Utilities, Supplies, Transport, Other
5: Category-based reporting filters
6: Category activation/deactivation
7: Bulk category import from template
8: Category usage statistics display

---

## Epic 3: Daily Transaction Operations

**Goal:** Enable shop workers to perform daily financial operations including sales, purchases, and expense entry with partial payment tracking, customer/supplier management, and real-time balance updates. This epic delivers the core business functionality.

### Story 3.1: Daily Entries Dashboard
**As a** shop worker,
**I want** to land on a daily entries dashboard after login,
**so that** I can immediately see and manage today's transactions.

**Acceptance Criteria:**
1: Dashboard opens automatically post-authentication showing current date
2: Top status bar displays real-time cash-in-hand and bank balances
3: Quick stats widget shows today's totals (sales, purchases, expenses)
4: Transaction list displays in descending order (newest first)
5: Each entry shows type indicator with color coding (green/red/orange)
6: Edit and delete buttons available on each entry
7: Empty state message when no entries for selected date
8: Auto-refresh when returning from transaction modal

### Story 3.2: Sales Transaction Entry
**As a** shop worker,
**I want** to record daily sales transactions,
**so that** revenue is accurately tracked.

**Acceptance Criteria:**
1: "Add New Entry" button opens transaction modal
2: Transaction type selector with "Sales" option
3: Total amount field (required, positive numbers only)
4: Customer dropdown defaulting to "direct-sales-{shop}"
5: Payment fields: "Amount Paid" and "Change" for partial payments
6: Payment method selector (Cash/Bank)
7: Optional invoice comment field
8: Save updates dashboard and balances in real-time
9: Validation ensuring amount paid doesn't exceed total

### Story 3.3: Purchase Transaction Entry
**As a** shop worker,
**I want** to record purchase transactions,
**so that** costs are properly tracked.

**Acceptance Criteria:**
1: Transaction type selector with "Purchase" option
2: Total amount field (required, positive numbers only)
3: Supplier dropdown defaulting to "direct-purchase-{shop}"
4: Payment fields for partial payment tracking
5: Payment method selector affecting cash/bank balance
6: Optional comment field for invoice details
7: Outstanding balance calculation for partial payments
8: Supplier balance updated automatically
9: Arabic/English input support in all fields

### Story 3.4: Expense Entry with Categories
**As a** shop worker,
**I want** to record categorized expenses,
**so that** operational costs are tracked by type.

**Acceptance Criteria:**
1: Transaction type selector with "Expense" option
2: Expense category dropdown (required)
3: Amount field with validation
4: Description field (required for expenses)
5: Payment method selector (Cash/Bank)
6: Date defaults to today but editable
7: Category affects reporting and analytics
8: Expense reduces appropriate account balance
9: Quick-select for frequent expense types

### Story 3.5: Internal Transfer Operations
**As a** shop worker,
**I want** to transfer money between cash and bank,
**so that** I can manage liquidity properly.

**Acceptance Criteria:**
1: Transaction type selector with "Transfer" option
2: Transfer direction selector (Cash→Bank or Bank→Cash)
3: Amount field with available balance validation
4: Transfer reason/description field
5: Both accounts updated simultaneously
6: Transfer appears in both account histories
7: Cannot transfer more than available balance
8: Confirmation dialog for large transfers
9: Transfer receipt generation option

### Story 3.6: Customer & Supplier Sub-Account Management
**As a** shop worker,
**I want** to create customer and supplier accounts,
**so that** I can track individual business relationships.

**Acceptance Criteria:**
1: "Add Customer/Supplier" option in transaction modal
2: Account name fields (Arabic and English)
3: Contact information fields (phone, address)
4: Account type selector (Customer/Supplier)
5: Opening balance option for existing relationships
6: Account appears in relevant dropdowns immediately
7: Cannot create duplicate accounts
8: Search function in dropdown (Arabic/English)
9: Account balance display in selection dropdown

### Story 3.7: Date Navigation & Entry Management
**As a** shop worker,
**I want** to navigate between different dates easily,
**so that** I can manage entries for any day.

**Acceptance Criteria:**
1: Date picker in toolbar for direct date selection
2: LEFT arrow navigates to future/next date
3: RIGHT arrow navigates to past/previous date
4: Smooth animation between date transitions
5: Swipe gestures work same as arrow buttons
6: Cannot add entries to future dates
7: Previous dates allow entry with warning
8: Visual indicator for dates with entries
9: Quick "Today" button to return to current date

### Story 3.8: Transaction Validation & Balances
**As a** shop worker,
**I want** real-time validation and balance updates,
**so that** data integrity is maintained.

**Acceptance Criteria:**
1: Real-time balance calculation on transaction save
2: Negative balance warnings (but allowed for bank overdraft)
3: Transaction cannot be saved with invalid data
4: Duplicate transaction detection and warning
5: Balance changes reflected immediately in status bar
6: Running totals update for daily stats widget
7: Error messages in user's selected language
8: Confirmation for deletions with balance impact shown
9: Transaction limits configurable by admin

---

## Epic 4: Offline Capability & Sync System

**Goal:** Implement robust offline-first architecture with local storage, automatic synchronization, conflict resolution, and comprehensive sync logging with the mandatory 24-hour sync policy to ensure data integrity across all shops.

### Story 4.1: Offline Detection & Mode Switching
**As a** shop worker,
**I want** the app to detect network status and switch modes automatically,
**so that** I can continue working regardless of connectivity.

**Acceptance Criteria:**
1: Automatic network status detection on app launch
2: Real-time network monitoring with status indicator
3: Offline mode banner appears when connection lost
4: Manual offline/online mode toggle in settings
5: Pending sync count displayed when offline
6: Queue transactions locally when offline
7: Visual differentiation for unsynced transactions
8: Smooth transition between modes without data loss
9: Network status persists across app sessions

### Story 4.2: Local Storage Implementation
**As a** shop worker,
**I want** my transactions stored locally,
**so that** I don't lose data when offline.

**Acceptance Criteria:**
1: IndexedDB setup for web browser storage
2: SQLite database for mobile app storage
3: All transactions saved locally first
4: 30-day transaction history stored locally
5: Local storage encryption for sensitive data
6: Storage quota management with cleanup
7: Local data integrity validation
8: Offline data export capability
9: Local backup before sync operations

### Story 4.3: Automatic Sync Operations
**As a** shop worker,
**I want** automatic synchronization when online,
**so that** my data is always backed up.

**Acceptance Criteria:**
1: Auto-sync triggers when connection restored
2: Sync attempts every 4 hours when online
3: Background sync for mobile app
4: Progress indicator during sync
5: Sync queue with priority ordering
6: Partial sync support for large datasets
7: Sync retry with exponential backoff
8: Sync cancellation option
9: Bandwidth-efficient delta sync

### Story 4.4: 24-Hour Mandatory Sync Policy
**As an** admin,
**I want** users to sync within 24 hours,
**so that** financial data remains current.

**Acceptance Criteria:**
1: Track time since last successful sync
2: Warning notification at 20 hours without sync
3: Alert notification at 23 hours
4: Block new transactions after 24 hours until sync
5: Force sync dialog that cannot be dismissed
6: Admin notification when user exceeds 24 hours
7: Sync timer resets only on successful sync
8: Override option for admin in emergencies
9: Clear messaging about sync requirements

### Story 4.5: Conflict Resolution System
**As a** system,
**I want** to resolve data conflicts automatically,
**so that** data integrity is maintained.

**Acceptance Criteria:**
1: Last-write-wins strategy implementation
2: Conflict detection for same record edits
3: Audit trail of conflict resolutions
4: Conflicted data backup before resolution
5: Server timestamp authority for conflicts
6: Duplicate transaction prevention
7: Balance reconciliation after conflicts
8: Admin notification for critical conflicts
9: Conflict resolution report generation

### Story 4.6: Sync History & Monitoring
**As a** user,
**I want** to see my sync history,
**so that** I know my data is safely backed up.

**Acceptance Criteria:**
1: Sync history page in settings
2: Last sync timestamp display
3: Data volume synced (records count)
4: Sync duration tracking
5: Success/failure status for each sync
6: Failed sync reason logging
7: Sync history for last 30 days
8: Export sync logs option
9: Clear visual sync status indicators

### Story 4.7: Admin Sync Monitoring Dashboard
**As an** admin,
**I want** to monitor all user sync operations,
**so that** I can ensure data consistency.

**Acceptance Criteria:**
1: Real-time sync status for all users
2: Users with pending sync highlight
3: Sync compliance percentage metrics
4: Alert for users approaching 24-hour limit
5: Force sync trigger for specific users
6: Sync failure pattern analysis
7: Data volume metrics per shop
8: Historical sync performance charts
9: Export sync reports for compliance

### Story 4.8: Optimistic UI Updates
**As a** shop worker,
**I want** immediate UI feedback for my actions,
**so that** the app feels responsive even offline.

**Acceptance Criteria:**
1: Immediate UI updates on transaction save
2: Optimistic balance calculations
3: Visual indicator for pending sync items
4: Rollback UI on sync failure
5: Smooth animations for state changes
6: Queue position indicator for pending items
7: Estimated sync time display
8: Success confirmation after sync
9: Failure handling with retry options

---

## Epic 5: User Interface & Navigation

**Goal:** Build the complete mobile-first responsive UI with Arabic RTL support, daily entries dashboard with swipe navigation, side menu, settings, and all user-facing screens.

### Story 5.1: Mobile-First Daily Entries Interface
**As a** shop worker, **I want** a mobile-optimized daily entries interface, **so that** I can efficiently manage transactions on my phone.

**Acceptance Criteria:** Responsive design 320px+, swipe gestures for date navigation, FAB for new entries, Arabic RTL layout support, smooth animations, touch-friendly targets 44px+.

### Story 5.2: Icon-Only Side Menu & Navigation
**As a** shop worker, **I want** a minimalist side menu, **so that** I can access features without cluttering the interface.

**Acceptance Criteria:** Toggle hamburger menu, sync button with status, notifications with badge, language switcher, theme toggle, profile access, smooth slide animations.

### Story 5.3: Settings & Profile Management
**As a** shop worker, **I want** comprehensive settings, **so that** I can customize my experience.

**Acceptance Criteria:** Language preferences, sync controls, offline mode toggle, sync history, theme selection, profile editing, password change, help access.

### Story 5.4: Records & History Interface
**As a** shop worker, **I want** to view historical transactions, **so that** I can track past activities.

**Acceptance Criteria:** Grouped by date view, ungrouped list view, search/filter functionality, bulk selection, export options, pagination for performance.

---

## Epic 6: Admin Dashboard & Analytics

**Goal:** Create comprehensive admin interface with multi-shop overview, profit calculations, comparative analytics, and multi-currency support.

### Story 6.1: Multi-Shop Dashboard
**As an** admin, **I want** an overview of all shops, **so that** I can monitor overall performance.

**Acceptance Criteria:** Shop summary cards, real-time metrics, profit indicators, user activity status, alert notifications, quick actions.

### Story 6.2: Profit & Loss Calculations
**As an** admin, **I want** automated profit calculations, **so that** I can assess shop performance.

**Acceptance Criteria:** Real-time P&L based on stock values formula, comparative shop analysis, historical trends, export capabilities.

### Story 6.3: Multi-Currency Support
**As an** admin, **I want** multi-currency reporting, **so that** I can view finances in different currencies.

**Acceptance Criteria:** Currency switcher on all pages, daily rate management, historical rates, SDG as base currency, automatic conversions.

### Story 6.4: User Activity Monitoring
**As an** admin, **I want** to monitor user activities, **so that** I can ensure compliance.

**Acceptance Criteria:** Real-time user status, login/logout tracking, transaction patterns, performance metrics, alert triggers.

---

## Epic 7: Notifications & Monitoring

**Goal:** Implement comprehensive notification system for users and admins with activity logging and audit trails.

### Story 7.1: User Notification System
**As a** shop worker, **I want** timely notifications, **so that** I don't miss important tasks.

**Acceptance Criteria:** Daily entry reminders, sync alerts, network status changes, customizable timing, badge counts, in-app notifications.

### Story 7.2: Admin Alert System
**As an** admin, **I want** comprehensive alerts, **so that** I can monitor all operations.

**Acceptance Criteria:** User activity alerts, sync compliance notifications, financial threshold alerts, system status updates, configurable rules.

### Story 7.3: Activity Logging & Audit Trail
**As an** admin, **I want** complete audit trails, **so that** I can track all system changes.

**Acceptance Criteria:** User action logging, transaction modifications, login events, export activities, search/filter capabilities, retention policies.

---

## Epic 8: Reports & Export Functionality

**Goal:** Enable comprehensive reporting including P&L statements, daily reports, export/sharing capabilities, and backup/restore functionality.

### Story 8.1: Daily Report Generation
**As a** shop worker, **I want** to generate daily reports, **so that** I can share financial summaries.

**Acceptance Criteria:** PDF/Excel export, WhatsApp sharing, email integration, customizable formats, Arabic/English reports.

### Story 8.2: Financial Reports & Analytics
**As an** admin, **I want** comprehensive financial reports, **so that** I can make informed decisions.

**Acceptance Criteria:** P&L statements, comparative analytics, trend analysis, visual charts, export capabilities, scheduled reports.

### Story 8.3: Data Export & Backup
**As an** admin, **I want** data backup capabilities, **so that** I can protect financial information.

**Acceptance Criteria:** Full data export, selective backup, restore functionality, scheduled backups, encryption, audit logging.

---

## Checklist Results Report

### Executive Summary

- **Overall PRD Completeness**: 95%
- **MVP Scope Appropriateness**: Just Right - well-balanced for initial delivery
- **Readiness for Architecture Phase**: Ready - comprehensive technical guidance provided
- **Most Critical Concerns**: Minor gaps in user research documentation and MVP validation approach

### Category Analysis Table

| Category                         | Status  | Critical Issues                                    |
| -------------------------------- | ------- | -------------------------------------------------- |
| 1. Problem Definition & Context  | PASS    | No user research data (assumed based on domain)   |
| 2. MVP Scope Definition          | PASS    | Well-defined with clear boundaries                |
| 3. User Experience Requirements  | PASS    | Comprehensive UI/UX goals with Arabic-first focus |
| 4. Functional Requirements       | PASS    | 58 detailed functional requirements                |
| 5. Non-Functional Requirements   | PASS    | 40 performance/security requirements               |
| 6. Epic & Story Structure        | PASS    | 8 sequential epics with detailed stories          |
| 7. Technical Guidance            | PASS    | T3 Stack with Arabic/RTL specifications           |
| 8. Cross-Functional Requirements | PARTIAL | Limited backup/disaster recovery details          |
| 9. Clarity & Communication       | PASS    | Well-structured, bilingual considerations          |

### Final Decision

**✅ READY FOR ARCHITECT**: The PRD and epics are comprehensive, properly structured, and ready for architectural design phase. The minor gaps identified are not blockers for moving forward and can be addressed during development iterations.

## Next Steps

### UX Expert Prompt
Review the comprehensive PRD with focus on Arabic-first mobile interface design. Create wireframes and user flow diagrams for the daily entries dashboard with RTL navigation, ensuring optimal user experience for shop workers managing financial transactions on mobile devices.

### Architect Prompt
Design the technical architecture for this T3 Stack spare parts accounting application. Focus on multi-tenant database design, offline-first sync architecture, and Arabic/RTL implementation. Address the 24-hour mandatory sync policy, real-time balance calculations, and secure multi-shop data isolation. Provide detailed implementation guidance for the development team.