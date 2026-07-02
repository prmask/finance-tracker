// src/app/(app)/dashboard/_components/balance-strip.tsx
// The "passbook" hero — ruled-paper background, mono balance with a
// smaller paise suffix, and a rotated budget stamp, matching the
// finance-tracker.html design reference.

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(n);
}

function paise(n: number) {
  return Math.round((Math.abs(n) % 1) * 100)
    .toString()
    .padStart(2, '0');
}

interface Props {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  savedPct: number;
  accountLabels: string[];
  monthShort: string;
  totalBudgetLimit: number;
  allBudgetsOnTrack: boolean;
  updatedAt: string;
}

export function BalanceStrip({
  totalBalance,
  totalIncome,
  totalExpense,
  savedPct,
  accountLabels,
  monthShort,
  totalBudgetLimit,
  allBudgetsOnTrack,
  updatedAt,
}: Props) {
  return (
    <section
      aria-label='Balance summary'
      className='relative overflow-hidden rounded-2xl border border-[var(--line)] bg-white px-6 py-6 md:px-8 md:py-7'
      style={{
        backgroundImage:
          'repeating-linear-gradient(to bottom, transparent 0 35px, var(--rule) 35px 36px)',
      }}
    >
      {/* Ruled-passbook margin line */}
      <div className='pointer-events-none absolute top-0 bottom-0 left-16 hidden w-px bg-[var(--sienna-soft)] md:block' />

      <p className='mb-2.5 font-mono text-[11px] tracking-[0.22em] text-[var(--ink-soft)] uppercase'>
        Total balance · All accounts
      </p>

      <div className='flex flex-wrap items-end gap-8 md:gap-12'>
        <div>
          <p className='font-mono text-4xl font-semibold tracking-tight text-[var(--ink)] md:text-5xl'>
            {totalBalance < 0 ? '−' : ''}₹{fmt(Math.abs(totalBalance))}
            <span className='text-xl font-medium text-[var(--ink-soft)] md:text-2xl'>
              .{paise(totalBalance)}
            </span>
          </p>
          <p className='mt-2 text-sm text-[var(--ink-soft)]'>
            Updated today, {updatedAt}
            {accountLabels.length > 0 && ` · ${accountLabels.join(', ')}`}
          </p>
        </div>

        <div className='flex gap-7 md:gap-9'>
          <Flow
            label={`Money in · ${monthShort}`}
            value={`+₹${fmt(totalIncome)}`}
            color='var(--emerald)'
          />
          <Flow
            label={`Money out · ${monthShort}`}
            value={`−₹${fmt(totalExpense)}`}
            color='var(--sienna)'
          />
          <Flow
            label='Saved this month'
            value={`${savedPct.toFixed(1)}%`}
            color='var(--ink)'
          />
        </div>
      </div>

      {totalBudgetLimit > 0 && (
        <div
          className='mt-3.5 inline-block -rotate-4 rounded-md border-2 px-3 py-1.5 text-center font-mono text-xs font-semibold tracking-[0.2em] opacity-90 md:absolute md:top-6 md:right-9 md:mt-0 md:-rotate-6'
          style={{
            borderColor: allBudgetsOnTrack ? 'var(--emerald)' : 'var(--sienna)',
            color: allBudgetsOnTrack ? 'var(--emerald)' : 'var(--sienna)',
          }}
        >
          {allBudgetsOnTrack ? 'ON TRACK' : 'OVER BUDGET'}
          <small className='mt-0.5 block text-[9px] font-medium tracking-[0.14em] text-[var(--ink-soft)]'>
            {monthShort} · BUDGET ₹{fmt(totalBudgetLimit)}
          </small>
        </div>
      )}
    </section>
  );
}

function Flow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div>
      <p className='mb-1 font-mono text-[10px] tracking-[0.16em] text-[var(--ink-soft)] uppercase'>
        {label}
      </p>
      <p className='font-mono text-xl font-semibold' style={{ color }}>
        {value}
      </p>
    </div>
  );
}
