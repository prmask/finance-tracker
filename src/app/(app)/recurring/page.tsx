// src/app/(app)/recurring/page.tsx
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AddRecurringForm } from './add-recurring-form';
import { RecurringList } from './recurring-list';

export default async function RecurringPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  const userId = session.user.id;

  const [rules, categories, accounts] = await Promise.all([
    prisma.recurringRule
      .findMany({
        where: { userId },
        orderBy: { nextRunDate: 'asc' },
        select: {
          id: true,
          name: true,
          amount: true,
          frequency: true,
          nextRunDate: true,
          kind: true,
          isActive: true,
          category: { select: { id: true, name: true, emoji: true, type: true } },
          moneyAccount: { select: { id: true, name: true, last4: true } },
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
      select: { id: true, name: true, last4: true },
    }),
  ]);

  return (
    <div className='space-y-5'>
      <div>
        <h1 className='font-serif text-2xl text-[var(--ink)]'>
          Recurring & Scheduled
        </h1>
        <p className='mt-0.5 text-sm text-[var(--ink)]/50'>
          SIP auto-invests and auto-debit subscriptions. Once a rule&apos;s
          due date passes, it posts as a real transaction automatically —
          no need to log it by hand.
        </p>
      </div>

      <AddRecurringForm categories={categories} accounts={accounts} />

      <RecurringList rules={rules} categories={categories} accounts={accounts} />
    </div>
  );
}
