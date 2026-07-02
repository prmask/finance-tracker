// src/app/(app)/budgets/actions.ts
// Server Actions for Budget CRUD.
// One budget per (userId, categoryId) — saving is an upsert, since the
// single edit screen just lets you set/update/clear a limit per category.

'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

type ActionResult = { error?: string };

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Not authenticated');
  return session.user.id;
}

export async function saveBudget(formData: FormData): Promise<ActionResult> {
  const userId = await requireUserId();
  const categoryId = String(formData.get('categoryId') ?? '').trim();
  const limitRaw = String(formData.get('monthlyLimit') ?? '').trim();

  if (!categoryId) return { error: 'Missing category.' };

  const monthlyLimit = parseFloat(limitRaw);
  if (!limitRaw || isNaN(monthlyLimit) || monthlyLimit <= 0)
    return { error: 'Monthly limit must be a positive number.' };

  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId, type: 'EXPENSE' },
  });
  if (!category) return { error: 'Invalid category.' };

  await prisma.budget.upsert({
    where: { userId_categoryId: { userId, categoryId } },
    create: { userId, categoryId, monthlyLimit },
    update: { monthlyLimit },
  });

  revalidatePath('/budgets');
  return {};
}

export async function deleteBudget(categoryId: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!categoryId) return { error: 'Missing category id.' };

  await prisma.budget.deleteMany({ where: { userId, categoryId } });

  revalidatePath('/budgets');
  return {};
}
