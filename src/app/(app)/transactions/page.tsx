// src/app/(app)/transactions/page.tsx
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AddTransactionForm } from './add-transaction-form';
import { TransactionList } from './transaction-list';

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  const userId = session.user.id;

  const [transactions, categories, accounts] = await Promise.all([
    prisma.transaction
      .findMany({
        where: { userId },
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

      <div className='mt-8'>
        <TransactionList
          transactions={transactions}
          categories={categories}
          accounts={accounts}
        />
      </div>
    </main>
  );
}
