# Epic 2: Account Management & Shop Setup

**Goal:** Implement the complete account hierarchy system with bilingual naming, enable admins to create and manage shops, set up financial years, and configure opening/ending stock values for profit calculations.

## Story 2.1: Shop Creation & Management
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

## Story 2.2: Financial Year Management
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

## Story 2.3: Account Hierarchy Configuration
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

## Story 2.4: Opening & Ending Stock Value Management
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

## Story 2.5: Cash & Bank Account Setup
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

## Story 2.6: Expense Category Configuration
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
