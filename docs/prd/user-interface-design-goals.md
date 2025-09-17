# User Interface Design Goals

## Overall UX Vision
Create an intuitive, **Arabic-first** mobile accounting application with **Arabic as the default language** and full RTL layout support. The interface should prioritize speed and efficiency for daily financial operations by shop workers in Arabic-speaking markets. While supporting English as a secondary language, all UI elements, navigation, and interactions should be optimized for RTL reading patterns. Focus on one-handed operation for mobile users, with large touch targets and culturally appropriate gestures.

## Key Interaction Paradigms
- **RTL-Optimized Navigation**:
  - In Arabic mode: RIGHT arrow = next/future date, LEFT arrow = previous date
  - Swipe directions follow RTL patterns (swipe right-to-left for next)
- **Arabic-First Forms**: All forms default to Arabic with RTL text alignment
- **Bilingual Display**: Account names show Arabic primary, English secondary
- **Number Display**: Support both Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) and Western numerals
- **Calendar**: Support both Hijri and Gregorian calendars with Arabic month names
- **Cultural Date Format**: DD/MM/YYYY format as standard

## Core Screens and Views

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

## Accessibility: WCAG AA
- Minimum touch target size of 44x44 pixels for mobile
- Color contrast ratio of at least 4.5:1 for normal text
- Screen reader support for both Arabic and English
- Clear focus indicators for all interactive elements
- Keyboard navigation support for web interface

## Branding
- Clean, professional design suitable for business accounting
- Color coding: Green (sales), Red (purchases), Orange (expenses), Blue (transfers)
- Subtle animations for state changes and navigation
- Support for light and dark themes
- Consistent iconography across platforms

## Target Device and Platforms: Web Responsive, and all mobile platforms
- **Primary**: Mobile devices (iOS and Android) - 320px to 768px
- **Secondary**: Tablets (iPad, Android tablets) - 768px to 1024px
- **Tertiary**: Desktop browsers - 1024px+
- **Progressive Web App (PWA)** capabilities
- **Native mobile apps** via React Native/Expo

---
