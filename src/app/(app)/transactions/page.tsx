// src/app/(app)/transactions/page.tsx
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { redirect } from 'next/navigation';
import { AddTransactionForm } from './add-transaction-form';
import { TransactionFilters } from './transaction-filters';
import { TransactionList } from './transaction-list';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; categoryId?: string; accountId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  const userId = session.user.id;

  const { month, categoryId, accountId } = await searchParams;

  const where: Prisma.TransactionWhereInput = { userId };
  if (categoryId) where.categoryId = categoryId;
  if (accountId) where.moneyAccountId = accountId;
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [year, monthNum] = month.split('-').map(Number);
    where.date = {
      gte: new Date(year, monthNum - 1, 1),
      lte: new Date(year, monthNum, 0, 23, 59, 59),
    };
  }

  const isFiltered = Boolean(month || categoryId || accountId);

  const [transactions, categories, accounts] = await Promise.all([
    prisma.transaction
      .findMany({
        where,
        orderBy: { date: 'desc' },
        take: 100,
        select: {
          id: true,
          direction: true,
          date: true,
          description: true,
          paymentMethod: true,
          category: {
            select: { id: true, name: true, emoji: true, type: true },
          },
          moneyAccount: {
            select: { id: true, name: true, last4: true, type: true },
          },
          amount: true,
        },
      })
      .then((rows) => rows.map((r) => ({ ...r, amount: r.amount.toFixed(2) }))),
    prisma.category.findMany({
      where: { userId },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, emoji: true, type: true },
    }),
    prisma.moneyAccount.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, last4: true, type: true },
    }),
  ]);

  return (
    <main className='mx-auto max-w-2xl px-4 py-8'>
      <h1
        className='mb-1 text-2xl font-semibold'
        style={{ color: 'var(--ink)' }}
      >
        Transactions
      </h1>
      <p className='mb-6 text-sm opacity-70' style={{ color: 'var(--ink)' }}>
        Every rupee in and out.
      </p>

      <AddTransactionForm categories={categories} accounts={accounts} />

      <div className='mt-6'>
        <TransactionFilters
          categories={categories}
          accounts={accounts}
          month={month ?? ''}
          categoryId={categoryId ?? ''}
          accountId={accountId ?? ''}
        />
      </div>

      <div className='mt-6'>
        {isFiltered && (
          <p
            className='mb-2 text-xs opacity-60'
            style={{ color: 'var(--ink)' }}
          >
            {transactions.length} result{transactions.length === 1 ? '' : 's'}
          </p>
        )}
        <TransactionList
          transactions={transactions}
          categories={categories}
          accounts={accounts}
          isFiltered={isFiltered}
        />
      </div>
    </main>
  );
}
