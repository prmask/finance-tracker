// src/app/(app)/layout.tsx
import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className='min-h-screen' style={{ backgroundColor: 'var(--paper)' }}>
      {/* ── Top nav ── */}
      <nav
        className='flex items-center justify-between border-b px-4 py-3'
        style={{
          borderColor: 'color-mix(in srgb, var(--ink) 12%, transparent)',
          backgroundColor: 'var(--paper)',
        }}
      >
        {/* Brand */}
        <span
          className='text-lg font-semibold tracking-tight'
          style={{ color: 'var(--ink)', fontFamily: 'var(--font-instrument)' }}
        >
          Paisaa
        </span>

        {/* Nav links */}
        <div
          className='flex items-center gap-4 text-sm'
          style={{ color: 'var(--ink)' }}
        >
          <a href='/transactions' className='opacity-70 hover:opacity-100'>
            Transactions
          </a>
          <a href='/accounts' className='opacity-70 hover:opacity-100'>
            Accounts
          </a>
          <a href='/categories' className='opacity-70 hover:opacity-100'>
            Categories
          </a>

          {/* Sign out — server action inline */}
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}
          >
            <button
              type='submit'
              className='rounded-md border px-3 py-1 text-xs font-medium opacity-70 hover:opacity-100'
              style={{
                borderColor: 'color-mix(in srgb, var(--ink) 20%, transparent)',
                color: 'var(--ink)',
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>

      {children}
    </div>
  );
}
