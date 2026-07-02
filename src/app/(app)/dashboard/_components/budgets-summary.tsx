// src/app/(app)/dashboard/_components/budgets-summary.tsx
// "Budgets" card + upcoming SIP/auto-debit reminder, matching the
// reference's second-row Budgets card. Read-only here — editing happens
// on the dedicated /budgets page.
import type { BudgetRow, BudgetStatus } from '@/lib/budgets';
import Link from 'next/link';

const STATUS_COLOR: Record<BudgetStatus, string> = {
  'on-track': 'var(--emerald)',
  warning: 'var(--marigold)',
  over: 'var(--sienna)',
};

interface UpcomingRecurring {
  name: string;
  amount: number;
  frequency: string;
  kind: string;
  emoji: string | null;
  daysUntil: number;
}

interface Props {
  rows: BudgetRow[];
  upcomingRecurring: UpcomingRecurring | null;
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(n);
}

function formatFrequency(f: string) {
  return f === 'MONTHLY' ? 'Monthly' : f === 'WEEKLY' ? 'Weekly' : 'Yearly';
}

export function BudgetsSummary({ rows, upcomingRecurring }: Props) {
  return (
    <div className='rounded-xl border border-[var(--ink)]/10 bg-white p-5'>
      <div className='mb-4 flex items-baseline justify-between'>
        <p className='font-serif text-lg text-[var(--ink)]'>Budgets</p>
        <Link
          href='/budgets'
          className='font-mono text-[11px] tracking-widest text-[var(--ink-soft)] uppercase hover:text-[var(--ink)]'
        >
          Edit
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className='py-2 font-sans text-sm text-[var(--ink)]/40'>
          No budgets set yet.{' '}
          <Link href='/budgets' className='text-[var(--emerald)] underline'>
            Set one →
          </Link>
        </p>
      ) : (
        <ul className='space-y-4'>
          {rows.map((r) => (
            <li key={r.categoryId}>
              <div className='mb-1.5 flex items-center justify-between text-sm'>
                <span className='font-semibold text-[var(--ink)]'>
                  {r.categoryName}
                </span>
                <span
                  className='font-mono text-xs'
                  style={{
                    color:
                      r.status && r.status !== 'on-track'
                        ? STATUS_COLOR[r.status]
                        : 'var(--ink-soft)',
                  }}
                >
                  ₹{fmt(r.spent)} / ₹{fmt(r.monthlyLimit ?? 0)}
                </span>
              </div>
              <div className='h-2 overflow-hidden rounded-[5px] bg-[var(--paper)]'>
                <div
                  className='h-full rounded-[5px] transition-all'
                  style={{
                    width: `${Math.min(100, r.pct ?? 0)}%`,
                    backgroundColor: STATUS_COLOR[r.status ?? 'on-track'],
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {upcomingRecurring ? (
        <Link
          href='/recurring'
          className='mt-5 flex items-center gap-3.5 rounded-[11px] border border-dashed border-[var(--line)] bg-[var(--emerald-soft)] px-4 py-4 transition-opacity hover:opacity-90'
        >
          <span className='text-xl leading-none'>
            {upcomingRecurring.emoji ??
              (upcomingRecurring.kind === 'INVESTMENT' ? '🌱' : '🔁')}
          </span>
          <div className='min-w-0'>
            <p className='text-sm font-semibold text-[var(--ink)]'>
              {upcomingRecurring.kind === 'INVESTMENT'
                ? 'SIP auto-invest'
                : 'Auto-debit'}{' '}
              runs{' '}
              {upcomingRecurring.daysUntil <= 0
                ? 'today'
                : upcomingRecurring.daysUntil === 1
                  ? 'tomorrow'
                  : `in ${upcomingRecurring.daysUntil} days`}
            </p>
            <p className='mt-0.5 font-mono text-xs text-[var(--ink-soft)]'>
              {upcomingRecurring.name} ·{' '}
              {formatFrequency(upcomingRecurring.frequency)}
            </p>
          </div>
          <span className='ml-auto font-mono text-sm font-semibold text-[var(--emerald)]'>
            ₹{fmt(upcomingRecurring.amount)}
          </span>
        </Link>
      ) : (
        <p className='mt-5 border-t border-[var(--line)] pt-4 font-sans text-sm text-[var(--ink)]/40'>
          No upcoming payments.{' '}
          <Link href='/recurring' className='text-[var(--emerald)] underline'>
            Add a SIP or auto-debit →
          </Link>
        </p>
      )}
    </div>
  );
}
