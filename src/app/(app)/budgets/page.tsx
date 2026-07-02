// src/app/(app)/budgets/page.tsx
import { auth } from '@/auth';
import { getBudgetsData } from '@/lib/budgets';
import { redirect } from 'next/navigation';
import { BudgetManager } from './budget-manager';

export default async function BudgetsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { rows, month, allOnTrack } = await getBudgetsData(session.user.id);

  return (
    <div className='space-y-5'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h1 className='font-serif text-2xl text-[var(--ink)]'>Budgets</h1>
          <p className='font-sans text-sm text-[var(--ink)]/50 mt-0.5'>
            {month} · monthly limit per category
          </p>
        </div>
        {allOnTrack && (
          <span className='rotate-[-4deg] rounded-full border-2 border-[var(--emerald)] px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-[var(--emerald)]'>
            On Track
          </span>
        )}
      </div>

      <BudgetManager rows={rows} />
    </div>
  );
}
