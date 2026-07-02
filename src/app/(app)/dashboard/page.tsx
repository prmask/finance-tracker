// src/app/(app)/dashboard/page.tsx
import { auth } from '@/auth';
import { getDashboardData } from '@/lib/dashboard';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BalanceStrip } from './_components/balance-strip';
import { BudgetsSummary } from './_components/budgets-summary';
import { CashflowChart } from './_components/cashflow-chart';
import { CategoryBreakdown } from './_components/category-breakdown';
import { RecentTransactions } from './_components/recent-transactions';

function parseMonthParam(value: string | undefined): Date | undefined {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) return undefined;
  const [year, month] = value.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

function monthParam(year: number, monthIndex: number) {
  // Date() normalizes month over/underflow (e.g. index -1 -> Dec of the
  // previous year), so this handles year rollover at Jan/Dec correctly.
  const d = new Date(year, monthIndex, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const targetMonth = parseMonthParam((await searchParams).month);
  const data = await getDashboardData(session.user.id, targetMonth);

  const prevHref = `/dashboard?month=${monthParam(data.viewYear, data.viewMonthIndex - 1)}`;
  const nextHref = `/dashboard?month=${monthParam(data.viewYear, data.viewMonthIndex + 1)}`;

  return (
    <div className='space-y-5'>
      {/* Topbar */}
      <div className='flex flex-wrap items-center gap-3'>
        <h1 className='font-serif text-2xl text-[var(--ink)]'>Overview</h1>

        <div className='ml-auto flex items-center gap-1.5 rounded-[9px] border border-[var(--line)] bg-white px-2 py-1.5 font-mono text-sm font-medium text-[var(--ink)]'>
          <Link
            href={prevHref}
            aria-label='Previous month'
            className='px-1.5 text-[var(--ink-soft)] hover:text-[var(--ink)]'
          >
            ‹
          </Link>
          <span>
            {data.monthShort} {data.viewYear}
          </span>
          <Link
            href={nextHref}
            aria-label='Next month'
            className='px-1.5 text-[var(--ink-soft)] hover:text-[var(--ink)]'
          >
            ›
          </Link>
        </div>

        <Link
          href='/transactions'
          className='inline-flex items-center gap-1.5 rounded-[9px] bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1F3158]'
        >
          ＋ Add transaction
        </Link>
      </div>

      {/* Balance strip */}
      <BalanceStrip
        totalBalance={data.totalBalance}
        totalIncome={data.totalIncome}
        totalExpense={data.totalExpense}
        savedPct={data.savedPct}
        accountLabels={data.accountLabels}
        monthShort={data.monthShort}
        totalBudgetLimit={data.totalBudgetLimit}
        allBudgetsOnTrack={data.allBudgetsOnTrack}
        updatedAt={data.updatedAt}
      />

      {/* Row 1: cash flow chart + category breakdown */}
      <div className='grid grid-cols-1 gap-5 lg:grid-cols-[1.45fr_1fr]'>
        <CashflowChart data={data.cashFlowData} />
        <CategoryBreakdown
          categories={data.categoryBreakdown}
          totalExpense={data.totalExpense}
          monthShort={data.monthShort}
        />
      </div>

      {/* Row 2: recent transactions + budgets/SIP */}
      <div className='grid grid-cols-1 gap-5 lg:grid-cols-[1.45fr_1fr]'>
        <RecentTransactions transactions={data.recentTransactions} />
        <BudgetsSummary
          rows={data.activeBudgetRows}
          upcomingRecurring={data.upcomingRecurring}
        />
      </div>
    </div>
  );
}
