# Epic 3: Daily Transaction Operations

**Goal:** Enable shop workers to perform daily financial operations including sales, purchases, and expense entry with partial payment tracking, customer/supplier management, and real-time balance updates. This epic delivers the core business functionality.

## Story 3.1: Daily Entries Dashboard
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

## Story 3.2: Sales Transaction Entry
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

## Story 3.3: Purchase Transaction Entry
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

## Story 3.4: Expense Entry with Categories
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

## Story 3.5: Internal Transfer Operations
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

## Story 3.6: Customer & Supplier Sub-Account Management
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

## Story 3.7: Date Navigation & Entry Management
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

## Story 3.8: Transaction Validation & Balances
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
