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

---

## Phases

### Phase 0 — Foundation (Day 1–2)

- Reuse existing scaffold at `/var/www/nextjs/finance-tracker` (`.env` already fixed, shadcn done) — just reset the schema; no need to re-scaffold
- Write complete `schema.prisma` up front: **User, Account, Category, Transaction, Budget, RecurringRule** (+ NextAuth tables)
- Run `npx prisma migrate dev --name init`
- Port design tokens: fonts via `next/font`, CSS variables in `globals.css`, Tailwind theme mapping
- **Done when:** `npx prisma studio` shows all tables, and a blank page renders in Paisaa fonts/colors

### Phase 1 — Auth + Core Data (Day 3–6)

- NextAuth Google login + login page (create real OAuth credentials now, replace placeholders)
- Protected routes via middleware
- Category CRUD + default seeding on first login
- Account CRUD
- Transaction CRUD with full meta (account, payment method)
- Transaction list styled to design
- **Done when:** you log in with Google, add a transaction, and it renders exactly like a Paisaa transaction row

### Phase 2 — Dashboard (Day 7–10)

- Balance strip with real computed numbers
- Cash flow chart from real transactions
- Category breakdown card
- Recent transactions card
- Sidebar + responsive layout
- **Done when:** dashboard at `localhost:3000` is side-by-side comparable to `finance-tracker.html`, powered by real data

### Phase 3 — Budgets + Recurring (Day 11–14)

- Budget CRUD + computed status states + ON TRACK stamp
- RecurringRule CRUD + upcoming card
- **Done when:** dashboard is feature-identical to the Paisaa design — every card live, zero hardcoded data

### Phase 4 — Polish & Ship (Day 15+)

- Empty states, loading states, error handling
- Mobile pass
- Deploy: Vercel + Neon/Supabase Postgres
- README with screenshots + live demo link → portfolio piece for freelance outreach
- **Done when:** a stranger can sign in at a public URL and use it without errors

### Phase 5 (Future / v2 — parked, not planned)

- Encryption at rest / privacy tier (the local-first or E2E ideas we discussed)
- Auto-create transactions from recurring rules
- CSV import, multi-currency, reports
