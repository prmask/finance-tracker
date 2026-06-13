// src/app/(app)/categories/page.tsx
// Server component: fetches the logged-in user's categories and hands
// them to the client-side manager. The (app) layout already guards auth,
// but we re-check here defensively — never trust a layout alone.

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { CategoryManager } from './category-manager';

export default async function CategoriesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      emoji: true,
      color: true,
      type: true,
      isDefault: true,
    },
  });

  return (
    <main className='mx-auto max-w-2xl px-4 py-8'>
      <h1
        className='mb-1 text-2xl font-semibold'
        style={{ color: 'var(--ink)' }}
      >
        Categories
      </h1>
      <p className='mb-6 text-sm opacity-70' style={{ color: 'var(--ink)' }}>
        Organise where your money comes from and where it goes.
      </p>
      <CategoryManager categories={categories} />
    </main>
  );
}
