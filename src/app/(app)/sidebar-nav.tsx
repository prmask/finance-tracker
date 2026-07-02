// src/app/(app)/sidebar-nav.tsx
// Nav links for the dark passbook sidebar (and its mobile top-bar
// fallback). Client component so it can highlight the active route.
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function GridIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2}>
      <rect x='3' y='3' width='7' height='9' rx='1' />
      <rect x='14' y='3' width='7' height='5' rx='1' />
      <rect x='14' y='12' width='7' height='9' rx='1' />
      <rect x='3' y='16' width='7' height='5' rx='1' />
    </svg>
  );
}

function FlowIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2}>
      <path d='M3 17l5-5 4 4 7-8' />
      <path d='M14 8h5v5' />
    </svg>
  );
}

function BankIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2}>
      <rect x='3' y='5' width='18' height='14' rx='2' />
      <path d='M3 10h18' />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2}>
      <circle cx='12' cy='12' r='9' />
      <circle cx='12' cy='12' r='3' />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2}>
      <circle cx='12' cy='12' r='9' />
      <path d='M12 3v9l6 4' />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2}>
      <path d='M17 2l4 4-4 4' />
      <path d='M3 11V9a4 4 0 0 1 4-4h14' />
      <path d='M7 22l-4-4 4-4' />
      <path d='M21 13v2a4 4 0 0 1-4 4H3' />
    </svg>
  );
}

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', Icon: GridIcon },
  { href: '/transactions', label: 'Transactions', Icon: FlowIcon },
  { href: '/accounts', label: 'Accounts', Icon: BankIcon },
  { href: '/categories', label: 'Categories', Icon: TagIcon },
  { href: '/budgets', label: 'Budgets', Icon: TargetIcon },
  { href: '/recurring', label: 'Recurring', Icon: RepeatIcon },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className='flex flex-col gap-0.5 px-3.5' aria-label='Main'>
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-[9px] px-3 py-2.5 font-sans text-sm font-medium transition-colors ${
              active
                ? 'bg-[var(--marigold)]/[0.14] text-[var(--marigold)]'
                : 'text-[#B9C0D4] hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <span className='h-[17px] w-[17px] shrink-0'>
              <Icon />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className='flex gap-4'>
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={active ? 'text-[var(--marigold)]' : 'text-white/60 hover:text-white'}
          >
            <span className='block h-[18px] w-[18px]'>
              <Icon />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
