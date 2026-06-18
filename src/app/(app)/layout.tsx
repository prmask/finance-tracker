// src/app/(app)/layout.tsx
import { auth, signOut } from '@/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { href: '/transactions', label: 'Transactions', icon: '↕' },
  { href: '/accounts', label: 'Accounts', icon: '🏦' },
  { href: '/categories', label: 'Categories', icon: '⊜' },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className='min-h-screen bg-[var(--paper)] flex'>
      {/* Sidebar */}
      <aside className='hidden md:flex w-56 shrink-0 flex-col border-r border-[var(--ink)]/10 bg-white px-4 py-6'>
        {/* Logo */}
        <div className='mb-8 px-2'>
          <span className='font-serif text-xl text-[var(--ink)]'>Paisaa</span>
          <span className='font-mono text-xs text-[var(--emerald)] ml-1'>
            ₹
          </span>
        </div>

        {/* Nav */}
        <nav className='flex-1 space-y-1'>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className='flex items-center gap-3 px-3 py-2 rounded-lg font-sans text-sm text-[var(--ink)]/70
                         hover:bg-[var(--ink)]/5 hover:text-[var(--ink)] transition-colors'
            >
              <span className='w-4 text-center text-base leading-none'>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User + sign out */}
        <div className='border-t border-[var(--ink)]/10 pt-4 mt-4'>
          <p className='font-sans text-xs text-[var(--ink)]/40 px-3 truncate'>
            {session.user.email}
          </p>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}
          >
            <button
              type='submit'
              className='mt-2 w-full text-left px-3 py-2 font-sans text-sm text-[var(--ink)]/50
                         hover:text-[var(--sienna)] hover:bg-[var(--sienna)]/5 rounded-lg transition-colors'
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className='md:hidden fixed top-0 inset-x-0 z-10 bg-white border-b border-[var(--ink)]/10 px-4 py-3 flex items-center justify-between'>
        <span className='font-serif text-lg text-[var(--ink)]'>
          Paisaa <span className='font-mono text-[var(--emerald)]'>₹</span>
        </span>
        {/* Mobile nav is minimal for now — can add a hamburger later */}
        <div className='flex gap-3'>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className='font-sans text-xs text-[var(--ink)]/60 hover:text-[var(--ink)]'
            >
              {item.icon}
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className='flex-1 min-w-0 px-4 md:px-8 py-6 md:py-8 mt-12 md:mt-0 overflow-y-auto'>
        {children}
      </main>
    </div>
  );
}

// // src/app/(app)/layout.tsx
// import { auth, signOut } from '@/auth';
// import { redirect } from 'next/navigation';

// export default async function AppLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const session = await auth();
//   if (!session?.user) redirect('/login');

//   return (
//     <div className='min-h-screen' style={{ backgroundColor: 'var(--paper)' }}>
//       {/* ── Top nav ── */}
//       <nav
//         className='flex items-center justify-between border-b px-4 py-3'
//         style={{
//           borderColor: 'color-mix(in srgb, var(--ink) 12%, transparent)',
//           backgroundColor: 'var(--paper)',
//         }}
//       >
//         {/* Brand */}
//         <span
//           className='text-lg font-semibold tracking-tight'
//           style={{ color: 'var(--ink)', fontFamily: 'var(--font-instrument)' }}
//         >
//           Paisaa
//         </span>

//         {/* Nav links */}
//         <div
//           className='flex items-center gap-4 text-sm'
//           style={{ color: 'var(--ink)' }}
//         >
//           <a href='/transactions' className='opacity-70 hover:opacity-100'>
//             Transactions
//           </a>
//           <a href='/accounts' className='opacity-70 hover:opacity-100'>
//             Accounts
//           </a>
//           <a href='/categories' className='opacity-70 hover:opacity-100'>
//             Categories
//           </a>

//           {/* Sign out — server action inline */}
//           <form
//             action={async () => {
//               'use server';
//               await signOut({ redirectTo: '/login' });
//             }}
//           >
//             <button
//               type='submit'
//               className='rounded-md border px-3 py-1 text-xs font-medium opacity-70 hover:opacity-100'
//               style={{
//                 borderColor: 'color-mix(in srgb, var(--ink) 20%, transparent)',
//                 color: 'var(--ink)',
//               }}
//             >
//               Sign out
//             </button>
//           </form>
//         </div>
//       </nav>

//       {children}
//     </div>
//   );
// }
