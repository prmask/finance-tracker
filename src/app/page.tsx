// src/app/page.tsx
// Marketing landing page for signed-out visitors. Signed-in users are
// bounced straight to the dashboard, same as /login already does.
import { auth } from '@/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const FEATURES = [
  {
    icon: '📲',
    title: 'UPI, NEFT, Auto Debit',
    body: 'First-class Indian payment methods — not a generic "payment type" dropdown.',
  },
  {
    icon: '📖',
    title: 'Passbook aesthetic',
    body: 'Ruled lines, mono figures, a real bank-passbook feel — not a dashboard full of pie charts.',
  },
  {
    icon: '₹',
    title: '₹-denominated, ground up',
    body: 'Indian account types, Indian categories, lakhs and crores where they belong.',
  },
  {
    icon: '🌱',
    title: 'Budgets & SIP reminders',
    body: 'Status bars that flip on-track → warning → over, and a nudge before your SIP runs.',
  },
];

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect('/dashboard');

  return (
    <main className='min-h-screen bg-[var(--paper)]'>
      {/* Top bar */}
      <header className='mx-auto flex max-w-5xl items-center justify-between px-6 py-6'>
        <div className='flex items-baseline gap-2'>
          <span className='flex h-[26px] w-[26px] items-center justify-center rounded-full border-[1.5px] border-[var(--marigold)] font-mono text-sm text-[var(--marigold)]'>
            ₹
          </span>
          <span className='font-serif text-xl text-[var(--ink)]'>Paisaa</span>
        </div>
        <Link
          href='/login'
          className='rounded-[9px] border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--ink)]/5'
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <section className='mx-auto max-w-3xl px-6 pt-12 pb-16 text-center'>
        <h1 className='font-serif text-5xl leading-tight text-[var(--ink)] md:text-6xl'>
          A personal finance tracker
          <br />
          built for India
        </h1>
        <p className='mx-auto mt-5 max-w-xl text-lg text-[var(--ink-soft)]'>
          Not a Western app with a ₹ sign slapped on it. UPI-aware, SIP-aware,
          and styled like the bank passbook you already trust.
        </p>

        <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
          <Link
            href='/login'
            className='rounded-[9px] bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1F3158]'
          >
            Continue with Google
          </Link>
          <a
            href='https://github.com/prmask/finance-tracker'
            target='_blank'
            rel='noopener noreferrer'
            className='font-mono text-xs tracking-widest text-[var(--ink-soft)] uppercase hover:text-[var(--ink)]'
          >
            Follow along on GitHub →
          </a>
        </div>
      </section>

      {/* Passbook preview */}
      <section className='mx-auto max-w-2xl px-6 pb-16'>
        <p className='mb-3 text-center font-mono text-[11px] tracking-widest text-[var(--ink-soft)] uppercase'>
          Preview
        </p>
        <div
          className='overflow-hidden rounded-2xl border border-[var(--line)] bg-white px-8 py-7'
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent 0 35px, var(--rule) 35px 36px)',
          }}
        >
          <p className='mb-2.5 font-mono text-[11px] tracking-[0.22em] text-[var(--ink-soft)] uppercase'>
            Total balance · All accounts
          </p>
          <p className='font-mono text-4xl font-semibold tracking-tight text-[var(--ink)]'>
            ₹4,82,650
            <span className='text-xl font-medium text-[var(--ink-soft)]'>.40</span>
          </p>
          <p className='mt-2 mb-6 text-sm text-[var(--ink-soft)]'>
            HDFC ····2841, ICICI ····7733, Cash
          </p>
          <div className='space-y-3 border-t border-[var(--line)] pt-5'>
            <div className='flex items-center gap-3'>
              <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--paper)] text-lg'>
                🍛
              </span>
              <div className='min-w-0 grow'>
                <p className='truncate text-sm font-medium text-[var(--ink)]'>
                  Paragon Restaurant
                </p>
                <p className='truncate font-mono text-xs text-[var(--ink-soft)]'>
                  UPI · HDFC ····2841 · 7 Jun
                </p>
              </div>
              <span className='shrink-0 font-mono text-sm font-semibold text-[var(--sienna)]'>
                −₹860
              </span>
            </div>
            <div className='flex items-center gap-3'>
              <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--paper)] text-lg'>
                💼
              </span>
              <div className='min-w-0 grow'>
                <p className='truncate text-sm font-medium text-[var(--ink)]'>
                  Client payment — Vertex Stores
                </p>
                <p className='truncate font-mono text-xs text-[var(--ink-soft)]'>
                  NEFT · ICICI ····7733 · Yesterday
                </p>
              </div>
              <span className='shrink-0 font-mono text-sm font-semibold text-[var(--emerald)]'>
                +₹45,000
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className='mx-auto max-w-4xl px-6 pb-20'>
        <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className='rounded-xl border border-[var(--line)] bg-white p-5'
            >
              <span className='text-2xl leading-none'>{f.icon}</span>
              <h3 className='mt-3 font-serif text-lg text-[var(--ink)]'>
                {f.title}
              </h3>
              <p className='mt-1.5 text-sm text-[var(--ink-soft)]'>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <footer className='border-t border-[var(--line)] px-6 py-10 text-center'>
        <p className='font-serif text-2xl text-[var(--ink)]'>
          Track your money, the Indian way.
        </p>
        <Link
          href='/login'
          className='mt-5 inline-block rounded-[9px] bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1F3158]'
        >
          Continue with Google
        </Link>
      </footer>
    </main>
  );
}
