Budgeting Application Specification
Version 1.1
Date: March 2026

1. Purpose
   This document defines a simple, single-entry personal budgeting application. The goal is to help users track real-world income and expenses, set realistic monthly budgets, import data quickly, and easily “balance” (reconcile) their budget against bank statements — all without any double-entry bookkeeping, ledgers, debits/credits, or accounting complexity.
   Think Mint + YNAB lite — clean, fast, and approachable.
2. Core Concepts (Kept Extremely Simple)

- Transactions = one record only (income or expense)
- Amount = positive for income, negative for expense (or separate “Type” dropdown)
- Categories = user-defined (e.g., Rent, Groceries, Salary, Freelance)
- Accounts = optional simple list (Checking, Savings, Credit Card, Cash) — used for filtering, per-account balances, and reconciliation
- Budget = planned monthly amount per category
- Balance = running total of money left (Income – Expenses) or per-account balance
- Reconciled balance = starting balance + cleared income – cleared expenses (used only during reconciliation)
  No journals, no contra accounts, no equity/liability tracking.

3. Functional Requirements
   3.1 Manual Entry (Application Forms)

- Clean form on “Add Transaction” screen with:
  - Date (default today)
  - Amount
  - Type (Income / Expense) or automatic sign detection
  - Category (dropdown + “+ New”)
  - Payee / Description
  - Account (optional dropdown)
  - Cleared? checkbox (default checked)
  - Tags (optional, multi-select)
- Recurring transaction templates (monthly, weekly, yearly) with “Skip this month” option
- Bulk edit selected transactions (change category, mark cleared, etc.)
  3.2 CSV Import
- Support standard bank CSV exports (Chase, Bank of America, Capital One, etc.)
- Import wizard (3-step):
  1. Upload file
  2. Column mapping screen (drag-and-drop or dropdowns):
     - Date
     - Amount (or separate Debit/Credit columns)
     - Description/Payee
     - Category (if present)
     - Account (if present)
  3. Preview table with auto-categorization rules applied
- Smart defaults:
  - Auto-detect date formats
  - Auto-detect amount sign (negative = expense)
  - Option to “Import only new transactions” (match on date + amount + description hash)
- Save import rules per bank (e.g., “Chase always puts description in column 3”)
  3.3 Budgeting & Reconciliation (“Balance the Budget”)
- Monthly budget screen (grid view):
  - Category | Budgeted | Spent | Remaining | % Used
- Zero-based or “rollover” mode toggle (user chooses):
  - Zero-based: every dollar of income must be assigned to a category
  - Classic: just set targets, leftover income shows as “Unallocated”
- Reconciliation Feature — the core “balance” mechanismPurpose: Quickly prove the app matches the user’s real bank/credit-card statement for a given month and account (like balancing a checkbook).Principles: Single-entry only; per-account & per-month; uses only cleared transactions; locks once balanced.3.3.1 Access Points
  - Dashboard → big “Balance [Month]” button (red/yellow/green status)
  - Monthly Budget screen → “Reconcile” top-right button
  - Sidebar → “Reconciliations” → select any month + account
  - After CSV import → optional “Reconcile now?” prompt
- 3.3.2 Reconciliation Screen Layout (single screen, mobile-friendly)
- Top Summary Bar (sticky):
  - Month selector + Account selector
  - Statement Ending Balance (editable field; default blank)
    - Optional “Import Statement” (CSV/PDF → auto-extract ending balance)
  - App Calculated Balance (live):Starting Balance + Σ(Cleared Income) – Σ(Cleared Expenses)
  - Difference (large green/red): “You’re $47.32 short” or “Perfect match!”
  - Status banner: Red (“Not started”) → Yellow (“In progress”) → Green (“Balanced ✓”)
- Middle – Transaction List (sortable table)
  - Columns: Date | Description/Payee | Amount | Category | Cleared? (large checkbox/toggle)
  - Default: Uncleared transactions first, then chronological
  - Filters: “Only uncleared”, “Hide transfers”, by tag, search box
  - Bulk actions (on selected rows): Mark Cleared/Uncleared, Delete, Change category, Add note
- Right Sidebar / Bottom Sheet (stats & helpers)
  - Uncleared income / expenses totals
  - “12 transactions left to review”
  - Auto-suggest panel (see helpers below)
- Bottom Bar
  - “Mark all visible as cleared” (with confirmation)
  - “Finish & Lock” (only active when difference = $0.00)
  - “Save progress & exit”
- 3.3.3 Typical Flow
  1. Open reconciliation for March + Checking
  2. App loads: Starting balance (from prior month or manual override), all March transactions for account
  3. User enters statement balance: $3,284.17
  4. User checks “Cleared?” on transactions appearing on statement
  5. Difference updates live
  6. When difference = $0 → green banner + “Lock” button active
  7. Lock → month marked reconciled; transactions become read-only (unlock requires confirmation)
- 3.3.4 Smart Helpers
  - Auto-cleared: Transactions cleared in prior reconciliations stay cleared
  - Duplicate detection: After import, flag likely duplicates (“This matches cleared #142”)
  - Suggestion engine: When difference small (< $100), propose: “These 3 uncleared items sum to the difference — clear them?”
  - Pending/future transactions: Grayed out or hidden with note
  - Adjustment transaction: One-click “Add reconciliation adjustment” (tiny income/expense to force match)
- 3.3.5 History & Audit
  - “Reconciliation History” screen: Month | Account | Statement Balance | App Balance | Difference | Status
  - Re-open past reconciliations (read-only if locked)
  - Export history CSV
- 3.3.6 Edge Cases Handled
  - Negative balances (credit cards, overdrafts)
  - Multiple accounts: Reconcile individually or “All Accounts” combined
  - Transfers: Special “Transfer” category; nets to zero when both sides cleared
  - Post-lock edits: Requires explicit unlock + audit note
  - Zero-transaction months: Still allows entering balance and locking
  - Single currency only (user profile setting)
  - Local save
- 3.3.7 UX Polish
  _ Progress indicator: “8 of 15 cleared”
  _ Spacebar toggles cleared on focused row
  _ Green = cleared row, red/gray = uncleared
  _ Mobile: Swipe left → Clear \* Accessibility: High-contrast checkboxes, ARIA labels
  3.4 Dashboard & Reports
- Home dashboard:
  - Large “Money Left This Month” number
  - Income vs Expense bar chart
  - Top 5 spending categories
  - “Next bills due” list
  - Reconciliation status indicator per account/month
- Reports (monthly / yearly):
  _ Budget vs Actual
  _ Spending by category (pie)
  _ Cash flow line chart
  _ Export CSV/PDF
  3.5 Data & Rules
- User-defined categories (parent/child support)
- Auto-categorization rules (“Starbucks” → Restaurants)
- Search & filter across transactions
- Full data export (CSV or JSON backup)

4. Non-Functional Requirements

- Platforms: Web (PWA) + optional native mobile (iOS/Android)
- Performance: < 1 s for 1,000-transaction import; live recalculation < 100 ms
- Security: Bank-level encryption, optional biometric/PIN
- Data ownership: Full export anytime; no lock-in

5. Out of Scope (Explicitly Excluded)

- Double-entry accounting
- Bills/invoice management
- Investments/crypto tracking
- Multi-user family sharing with permissions
- Tax forms / Schedule C export
- Receipt OCR/photo scanning (future phase)

6. Next Steps / Open Questions

- Desired starting balance behavior on first use (manual entry vs assume $0?)
- Should locked months prevent category deletions that would orphan transactions?
- Any preference for handling split transactions (currently out of scope for simplicity)?
  This updated specification now fully incorporates the detailed reconciliation feature while keeping the overall application intentionally simple and non-accounting-like.
  Let me know if you'd like:
- Text-based wireframe/mockup of the reconciliation screen
- Database schema outline (tables/fields for reconciliation support)
- Developer-ready user stories or acceptance criteria
- Any other section expanded or adjusted
  Ready when you are!
