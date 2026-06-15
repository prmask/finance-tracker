// src/app/(app)/accounts/page.tsx
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AccountManager } from './account-manager';

export default async function AccountsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const accounts = await prisma.moneyAccount.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, type: true, last4: true, color: true },
  });

  return (
    <main className='mx-auto max-w-2xl px-4 py-8'>
      <h1
        className='mb-1 text-2xl font-semibold'
        style={{ color: 'var(--ink)' }}
      >
        Accounts
      </h1>
      <p className='mb-6 text-sm opacity-70' style={{ color: 'var(--ink)' }}>
        Your banks, cards, wallets, and cash pockets.
      </p>
      <AccountManager accounts={accounts} />
    </main>
  );
}
