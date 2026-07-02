// src/app/(app)/layout.tsx
import { auth, signOut } from '@/auth';
import { processDueRecurringRules } from '@/lib/recurring';
import { redirect } from 'next/navigation';
import { MobileNav, SidebarNav } from './sidebar-nav';

function initials(name: string | null | undefined, email: string | null | undefined) {
  const source = name?.trim() || email?.split('@')[0] || '?';
  const parts = source.split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  // Catch-up pass: materialize any RecurringRule that's come due since the
  // user was last here, before anything on the page reads transaction data.
  if (session.user.id) await processDueRecurringRules(session.user.id);

  const displayName = session.user.name ?? session.user.email ?? 'Account';

  return (
    <div className='flex min-h-screen bg-[var(--paper)]'>
      {/* Sidebar */}
      <aside className='sticky top-0 hidden h-screen w-[228px] shrink-0 flex-col bg-[var(--ink)] py-7 text-white md:flex'>
        {/* Brand */}
        <div className='mb-2 flex items-baseline gap-2 px-6 pb-6'>
          <span className='flex h-[26px] w-[26px] items-center justify-center rounded-full border-[1.5px] border-[var(--marigold)] font-mono text-sm text-[var(--marigold)]'>
            ₹
          </span>
          <h1 className='font-serif text-[1.65rem] leading-none tracking-[0.01em]'>
            Paisaa
          </h1>
        </div>

        <SidebarNav />

        {/* User + sign out */}
        <div className='mt-auto border-t border-white/[0.08] px-6 py-[18px]'>
          <div className='flex items-center gap-2.5'>
            <span className='flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[var(--marigold)] font-sans text-[0.8rem] font-semibold text-[var(--ink)]'>
              {initials(session.user.name, session.user.email)}
            </span>
            <div className='min-w-0'>
              <p className='truncate font-sans text-[0.85rem] font-semibold text-white'>
                {displayName}
              </p>
              <p className='truncate font-sans text-[0.72rem] text-[#8B94AD]'>
                Personal · INR
              </p>
            </div>
          </div>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}
          >
            <button
              type='submit'
              className='mt-3 font-sans text-xs text-[#8B94AD] transition-colors hover:text-white'
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className='fixed inset-x-0 top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[var(--ink)] px-4 py-3 md:hidden'>
        <span className='font-serif text-lg text-white'>
          Paisaa{' '}
          <span className='font-mono text-sm text-[var(--marigold)]'>₹</span>
        </span>
        <MobileNav />
      </div>

      {/* Main content */}
      <main className='mt-12 min-w-0 flex-1 overflow-y-auto px-4 py-6 md:mt-0 md:px-8 md:py-8'>
        {children}
      </main>
    </div>
  );
}
