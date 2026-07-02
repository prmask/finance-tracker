// src/app/(app)/dashboard/_components/recent-transactions.tsx
import Link from 'next/link';

interface Transaction {
  id: string;
  amount: number | string;
  direction: string;
  description: string | null;
  date: Date;
  paymentMethod: string | null;
  category: { name: string; emoji: string | null } | null;
  moneyAccount: { name: string; last4: string | null } | null;
}

interface Props {
  transactions: Transaction[];
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function RecentTransactions({ transactions }: Props) {
  return (
    <div className='rounded-xl border border-[var(--ink)]/10 bg-white p-5'>
      <div className='flex items-baseline justify-between mb-4'>
        <p className='font-serif text-lg text-[var(--ink)]'>Recent transactions</p>
        <Link
          href='/transactions'
          className='font-mono text-[11px] uppercase tracking-widest text-[var(--ink-soft)] hover:text-[var(--ink)]'
        >
          See all
        </Link>
      </div>

      {transactions.length === 0 ? (
        <p className='font-sans text-sm text-[var(--ink)]/30 py-6 text-center'>
          No transactions this month.{' '}
          <Link
            href='/transactions'
            className='text-[var(--emerald)] underline'
          >
            Add one →
          </Link>
        </p>
      ) : (
        <ul className='divide-y divide-[var(--ink)]/5'>
          {transactions.map((t) => {
            const isIn = t.direction === 'IN';
            const metaParts = [
              t.paymentMethod ?? null,
              t.moneyAccount
                ? `${t.moneyAccount.name}${t.moneyAccount.last4 ? ` ····${t.moneyAccount.last4}` : ''}`
                : null,
              new Date(t.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              }),
            ].filter(Boolean);

            return (
              <li key={t.id} className='flex items-center gap-3 py-3'>
                {/* Icon */}
                <div className='w-9 h-9 rounded-full bg-[var(--ink)]/5 flex items-center justify-center text-base shrink-0'>
                  {t.category?.emoji ?? (isIn ? '💰' : '📦')}
                </div>

                {/* Description + meta */}
                <div className='flex-1 min-w-0'>
                  <p className='font-sans text-sm font-medium text-[var(--ink)] truncate'>
                    {t.description ?? t.category?.name ?? 'Transaction'}
                  </p>
                  <p className='font-sans text-xs text-[var(--ink)]/40 truncate'>
                    {metaParts.join(' · ')}
                  </p>
                </div>

                {/* Amount */}
                <span
                  className='font-mono text-sm font-semibold shrink-0'
                  style={{ color: isIn ? 'var(--emerald)' : 'var(--sienna)' }}
                >
                  {isIn ? '+' : '−'}
                  {fmt(Math.abs(Number(t.amount)))}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
