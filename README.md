# Paisaa — Personal Finance Tracker (Final Spec)

**Positioning:** Indian-first personal finance tracker with a bank-passbook aesthetic. ₹-denominated, UPI-aware, SIP-aware — not a US template with the currency swapped.

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Prisma · PostgreSQL · NextAuth.js (Google) · Recharts

**Architecture:** Full-stack server app. All data in PostgreSQL, accessed via Prisma through API routes/Server Actions. Auth-gated per user.

---

## Features

### 1. Auth & User

- Google login via NextAuth.js
- Every query scoped to the logged-in user — users only ever see their own data
- Profile basics (name, avatar from Google)

### 2. Accounts (money sources)

- CRUD: bank account, credit card, UPI wallet, cash
- Fields: name, type, last-4 digits, color
- Per-account balance contribution
- Design ref: "HDFC ····2841", "ICICI ····7733" labels

### 3. Categories

- CRUD with name, emoji icon, color, type (income | expense)
- Seeded defaults on first login: Groceries & Food, Transport & Fuel, Eating Out, Subscriptions, Salary, Investments, etc.
- Design ref: ⛽ 📺 🍛 icons, category breakdown card

### 4. Transactions

- CRUD: amount, date, merchant/description, category, account, payment method (UPI / auto-debit / NEFT / card / cash), direction (in/out)
- List rows: icon · merchant · "UPI · HDFC ····2841 · 9 Jun" meta · signed ₹ amount (emerald in / sienna out)
- Filters: month, category, account
- Design ref: Recent Transactions card

### 5. Dashboard

- Balance strip: total balance, money in, money out (current month)
- Cash flow chart: income vs expense over time (Recharts)
- Category spending breakdown (top categories)
- Recent transactions (latest 5–6)
- Budgets summary with status bars
- Upcoming payment card (next due SIP/auto-debit)
- Design ref: the full Paisaa main layout

### 6. Budgets

- Monthly limit per category, spent computed from transactions
- Status: **on-track** (<80%) · **warning** (80–100%) · **over** (>100%)
- Status-colored progress bars; "ON TRACK" passbook stamp when the month is healthy overall
- Single edit screen for all budgets

### 7. Recurring & Scheduled

- `RecurringRule`: amount, frequency, next run date, category, account, kind (expense | investment)
- Covers both auto-debit subscriptions (Netflix) and SIP reminders ("SIP runs in 4 days · Nifty 50 · 15th monthly")
- v1 = dashboard reminder card only; auto-creating transactions on due date = later enhancement

### 8. Design System (non-negotiable — this is the differentiator)

- Fonts: Instrument Serif (headings) · IBM Plex Sans (body) · IBM Plex Mono (all figures)
- Tokens: `--ink #14213D` · `--paper #F2F4F1` · `--emerald #0F6B4F` · `--sienna #B5482A` · `--marigold #E8A33D`
- Sidebar nav, card layout, ruled-line passbook hero, responsive (sidebar collapses <760px)
