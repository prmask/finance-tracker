// src/app/(app)/budgets/budget-manager.tsx
// Client component. One row per expense category — set, update, or clear
// a monthly limit inline. Status bars use the Paisaa status palette:
// emerald (on-track, <80%) · marigold (warning, 80-100%) · sienna (over, >100%).

'use client';

import { useState, useTransition } from 'react';
import { deleteBudget, saveBudget } from './actions';

type Status = 'on-track' | 'warning' | 'over';

type Row = {
  categoryId: string;
  categoryName: string;
  emoji: string | null;
  color: string | null;
  monthlyLimit: number | null;
  spent: number;
  pct: number | null;
  status: Status | null;
};

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

const STATUS_COLOR: Record<Status, string> = {
  'on-track': 'var(--emerald)',
  warning: 'var(--marigold)',
  over: 'var(--sienna)',
};

const STATUS_LABEL: Record<Status, string> = {
  'on-track': 'On track',
  warning: 'Warning',
  over: 'Over budget',
};

export function BudgetManager({ rows }: { rows: Row[] }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSave(formData: FormData) {
    setError(null);
    const res = await saveBudget(formData);
    if (res.error) setError(res.error);
  }

  function handleClear(categoryId: string, categoryName: string) {
    if (!confirm(`Remove the budget for “${categoryName}”?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteBudget(categoryId);
      if (res.error) setError(res.error);
    });
  }

  return (
    <div className='space-y-4'>
      {error && (
        <div
          className='rounded-md border px-3 py-2 text-sm'
          style={{ borderColor: 'var(--sienna)', color: 'var(--sienna)' }}
        >
          {error}
        </div>
      )}

      {rows.length === 0 ? (
        <div className='rounded-xl border border-[var(--ink)]/10 bg-white p-5'>
          <p className='font-sans text-sm text-[var(--ink)]/50'>
            Add an expense category first — budgets are set per category.
          </p>
        </div>
      ) : (
        <ul className='divide-y divide-[var(--ink)]/10 rounded-xl border border-[var(--ink)]/10 bg-white'>
          {rows.map((row) => (
            <li key={row.categoryId} className='space-y-2 p-4'>
              <div className='flex items-center justify-between gap-3'>
                <div className='flex min-w-0 items-center gap-2'>
                  <span className='text-base leading-none'>
                    {row.emoji ?? '•'}
                  </span>
                  <span className='truncate font-sans text-sm text-[var(--ink)]'>
                    {row.categoryName}
                  </span>
                  {row.status && (
                    <span
                      className='shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white'
                      style={{ backgroundColor: STATUS_COLOR[row.status] }}
                    >
                      {STATUS_LABEL[row.status]}
                    </span>
                  )}
                </div>
                <span
                  className='shrink-0 font-mono text-sm'
                  style={{ color: row.status ? STATUS_COLOR[row.status] : 'var(--ink)' }}
                >
                  {fmt(row.spent)}
                  {row.monthlyLimit !== null && (
                    <span className='opacity-40'> / {fmt(row.monthlyLimit)}</span>
                  )}
                </span>
              </div>

              {row.monthlyLimit !== null && (
                <div className='h-1.5 rounded-full bg-[var(--ink)]/5'>
                  <div
                    className='h-1.5 rounded-full transition-all'
                    style={{
                      width: `${Math.min(100, row.pct ?? 0)}%`,
                      backgroundColor: STATUS_COLOR[row.status ?? 'on-track'],
                    }}
                  />
                </div>
              )}

              <form action={handleSave} className='flex items-center gap-2'>
                <input type='hidden' name='categoryId' value={row.categoryId} />
                <span className='font-mono text-xs text-[var(--ink)]/40'>₹</span>
                <input
                  name='monthlyLimit'
                  type='number'
                  min='1'
                  step='1'
                  defaultValue={row.monthlyLimit ?? ''}
                  placeholder='Set monthly limit'
                  className='w-32 rounded-md border border-[var(--ink)]/20 px-2 py-1 text-sm font-mono'
                />
                <button
                  type='submit'
                  className='rounded-md px-3 py-1 text-xs font-medium text-white'
                  style={{ backgroundColor: 'var(--emerald)' }}
                >
                  {row.monthlyLimit !== null ? 'Update' : 'Set'}
                </button>
                {row.monthlyLimit !== null && (
                  <button
                    type='button'
                    disabled={isPending}
                    onClick={() => handleClear(row.categoryId, row.categoryName)}
                    className='px-2 py-1 text-xs opacity-70 hover:opacity-100'
                    style={{ color: 'var(--sienna)' }}
                  >
                    Remove
                  </button>
                )}
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
