// src/app/(app)/transactions/transaction-filters.tsx
// Filter bar for the transactions list — month / category / account.
// Filter state lives entirely in the URL (server component re-reads it
// via searchParams), so this component just navigates on change rather
// than holding its own state.
'use client';

import { useRouter } from 'next/navigation';

type Category = { id: string; name: string; emoji: string | null; type: string };
type Account = { id: string; name: string; last4: string | null };

interface Props {
  categories: Category[];
  accounts: Account[];
  month: string;
  categoryId: string;
  accountId: string;
}

export function TransactionFilters({
  categories,
  accounts,
  month,
  categoryId,
  accountId,
}: Props) {
  const router = useRouter();
  const borderFaint = 'color-mix(in srgb, var(--ink) 15%, transparent)';

  function navigate(next: Partial<Props>) {
    const merged = { month, categoryId, accountId, ...next };
    const params = new URLSearchParams();
    if (merged.month) params.set('month', merged.month);
    if (merged.categoryId) params.set('categoryId', merged.categoryId);
    if (merged.accountId) params.set('accountId', merged.accountId);
    const qs = params.toString();
    router.push(qs ? `/transactions?${qs}` : '/transactions');
  }

  const hasFilters = Boolean(month || categoryId || accountId);

  const exportParams = new URLSearchParams();
  if (month) exportParams.set('month', month);
  if (categoryId) exportParams.set('categoryId', categoryId);
  if (accountId) exportParams.set('accountId', accountId);
  const exportQs = exportParams.toString();
  const exportHref = `/api/transactions/export${exportQs ? `?${exportQs}` : ''}`;

  return (
    <div className='flex flex-wrap items-end gap-2'>
      <label
        className='flex flex-col gap-1 text-xs'
        style={{ color: 'var(--ink)' }}
      >
        Month
        <input
          type='month'
          value={month}
          onChange={(e) => navigate({ month: e.target.value })}
          className='rounded-md border px-2 py-1.5 text-sm'
          style={{ borderColor: borderFaint }}
        />
      </label>

      <label
        className='flex flex-col gap-1 text-xs'
        style={{ color: 'var(--ink)' }}
      >
        Category
        <select
          value={categoryId}
          onChange={(e) => navigate({ categoryId: e.target.value })}
          className='rounded-md border px-2 py-1.5 text-sm'
          style={{ borderColor: borderFaint }}
        >
          <option value=''>All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
      </label>

      <label
        className='flex flex-col gap-1 text-xs'
        style={{ color: 'var(--ink)' }}
      >
        Account
        <select
          value={accountId}
          onChange={(e) => navigate({ accountId: e.target.value })}
          className='rounded-md border px-2 py-1.5 text-sm'
          style={{ borderColor: borderFaint }}
        >
          <option value=''>All accounts</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.last4 ? `${a.name} ····${a.last4}` : a.name}
            </option>
          ))}
        </select>
      </label>

      {hasFilters && (
        <button
          type='button'
          onClick={() => router.push('/transactions')}
          className='px-2 py-1.5 text-xs opacity-60 hover:opacity-100'
          style={{ color: 'var(--sienna)' }}
        >
          Clear filters
        </button>
      )}

      <a
        href={exportHref}
        className='ml-auto rounded-md px-3 py-1.5 text-xs font-medium text-white'
        style={{ backgroundColor: 'var(--emerald)' }}
      >
        Export CSV
      </a>
    </div>
  );
}
