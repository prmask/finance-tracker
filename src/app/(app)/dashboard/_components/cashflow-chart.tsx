// src/app/(app)/dashboard/_components/cashflow-chart.tsx
// Monthly money-in vs money-out bars for the last 6 months, matching the
// "Cash flow" card in finance-tracker.html.
'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface DataPoint {
  date: string;
  income: number;
  expense: number;
}

interface Props {
  data: DataPoint[];
}

function fmtRs(value: number) {
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)}`;
}

export function CashflowChart({ data }: Props) {
  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  return (
    <div className='rounded-xl border border-[var(--ink)]/10 bg-white p-5'>
      <div className='mb-4 flex items-baseline justify-between'>
        <p className='font-serif text-lg text-[var(--ink)]'>Cash flow</p>
        <span className='font-mono text-[11px] tracking-widest text-[var(--ink-soft)] uppercase'>
          Last 6 months
        </span>
      </div>

      <div className='mb-3 flex gap-4 font-sans text-xs text-[var(--ink-soft)]'>
        <span className='flex items-center gap-1.5'>
          <i
            className='inline-block h-2.5 w-2.5 rounded-[3px]'
            style={{ backgroundColor: 'var(--emerald)' }}
          />
          Money in
        </span>
        <span className='flex items-center gap-1.5'>
          <i
            className='inline-block h-2.5 w-2.5 rounded-[3px]'
            style={{ backgroundColor: 'var(--sienna)' }}
          />
          Money out
        </span>
      </div>

      {!hasData ? (
        <div className='flex h-48 items-center justify-center font-sans text-sm text-[var(--ink)]/30'>
          No transactions in the last 6 months.
        </div>
      ) : (
        <ResponsiveContainer width='100%' height={220}>
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid vertical={false} strokeDasharray='3 3' stroke='#14213D10' />
            <XAxis
              dataKey='date'
              tick={{
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: 10,
                fill: '#14213D80',
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              tick={{
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: 11,
                fill: '#14213D80',
              }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip
              formatter={(value, name) => [
                fmtRs(Number(value)),
                name === 'income' ? 'Money in' : 'Money out',
              ]}
              contentStyle={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                border: '1px solid #14213D20',
                borderRadius: 8,
              }}
            />
            <Bar dataKey='income' fill='#0F6B4F' radius={[4, 4, 0, 0]} />
            <Bar
              dataKey='expense'
              fill='#B5482A'
              fillOpacity={0.85}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
