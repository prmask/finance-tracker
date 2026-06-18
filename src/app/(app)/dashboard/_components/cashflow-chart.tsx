// src/app/(app)/dashboard/_components/cashflow-chart.tsx
'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
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
  month: string;
}

function fmtRs(value: number) {
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)}`;
}

export function CashflowChart({ data, month }: Props) {
  if (data.length === 0) {
    return (
      <div className='rounded-xl border border-[var(--ink)]/10 bg-white p-5'>
        <p className='font-sans text-xs uppercase tracking-widest text-[var(--ink)]/50 mb-4'>
          Cash Flow · {month}
        </p>
        <div className='h-48 flex items-center justify-center text-[var(--ink)]/30 font-sans text-sm'>
          No transactions this month yet.
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-xl border border-[var(--ink)]/10 bg-white p-5'>
      <p className='font-sans text-xs uppercase tracking-widest text-[var(--ink)]/50 mb-4'>
        Cash Flow · {month}
      </p>
      <ResponsiveContainer width='100%' height={220}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id='incomeGrad' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#0F6B4F' stopOpacity={0.15} />
              <stop offset='95%' stopColor='#0F6B4F' stopOpacity={0} />
            </linearGradient>
            <linearGradient id='expenseGrad' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='#B5482A' stopOpacity={0.15} />
              <stop offset='95%' stopColor='#B5482A' stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' stroke='#14213D10' />
          <XAxis
            dataKey='date'
            tick={{
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
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
            formatter={(value: number, name: string) => [
              fmtRs(value),
              name === 'income' ? 'Income' : 'Expenses',
            ]}
            contentStyle={{
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              border: '1px solid #14213D20',
              borderRadius: 8,
            }}
          />
          <Legend
            formatter={(value) => (
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  color: '#14213D',
                }}
              >
                {value === 'income' ? 'Income' : 'Expenses'}
              </span>
            )}
          />
          <Area
            type='monotone'
            dataKey='income'
            stroke='#0F6B4F'
            strokeWidth={2}
            fill='url(#incomeGrad)'
            dot={false}
          />
          <Area
            type='monotone'
            dataKey='expense'
            stroke='#B5482A'
            strokeWidth={2}
            fill='url(#expenseGrad)'
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
