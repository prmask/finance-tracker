// src/app/(app)/dashboard/_components/balance-strip.tsx

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

interface Props {
  netBalance: number;
  totalIncome: number;
  totalExpense: number;
  month: string;
}

export function BalanceStrip({
  netBalance,
  totalIncome,
  totalExpense,
  month,
}: Props) {
  return (
    <div className='grid grid-cols-3 gap-4'>
      {/* Net Balance */}
      <div className='col-span-3 md:col-span-1 rounded-xl border border-[var(--ink)]/10 bg-[var(--ink)] p-5 text-[var(--paper)]'>
        <p className='font-sans text-xs uppercase tracking-widest opacity-60'>
          Net Balance · {month}
        </p>
        <p
          className='font-mono text-3xl font-semibold mt-2'
          style={{
            color: netBalance >= 0 ? 'var(--emerald)' : 'var(--sienna)',
          }}
        >
          {netBalance >= 0 ? '' : '−'}
          {fmt(Math.abs(netBalance))}
        </p>
        <p className='font-sans text-xs opacity-40 mt-1'>
          Income − Expenses this month
        </p>
      </div>

      {/* Income */}
      <div className='rounded-xl border border-[var(--ink)]/10 bg-white p-5'>
        <p className='font-sans text-xs uppercase tracking-widest text-[var(--ink)]/50'>
          Income
        </p>
        <p className='font-mono text-2xl font-semibold mt-2 text-[var(--emerald)]'>
          {fmt(totalIncome)}
        </p>
        <div className='mt-3 h-1 rounded-full bg-[var(--emerald)]/20'>
          <div
            className='h-1 rounded-full bg-[var(--emerald)]'
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Expenses */}
      <div className='rounded-xl border border-[var(--ink)]/10 bg-white p-5'>
        <p className='font-sans text-xs uppercase tracking-widest text-[var(--ink)]/50'>
          Expenses
        </p>
        <p className='font-mono text-2xl font-semibold mt-2 text-[var(--sienna)]'>
          {fmt(totalExpense)}
        </p>
        <div className='mt-3 h-1 rounded-full bg-[var(--sienna)]/20'>
          <div
            className='h-1 rounded-full bg-[var(--sienna)]'
            style={{
              width:
                totalIncome > 0
                  ? `${Math.min(100, (totalExpense / totalIncome) * 100)}%`
                  : '0%',
            }}
          />
        </div>
      </div>
    </div>
  );
}
