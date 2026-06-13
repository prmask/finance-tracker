// src/app/(app)/categories/actions.ts
// Server Actions for Category CRUD.
// Every query is scoped to the logged-in user — updateMany/deleteMany
// with { id, userId } in the where clause means a user can never touch
// another user's rows, even with a stolen category id.

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

function parseCategoryInput(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const emoji = String(formData.get('emoji') ?? '').trim() || null;
  const type = String(formData.get('type') ?? '');

  if (!name) return { error: 'Name is required.' as const };
  if (name.length > 40)
    return { error: 'Name must be 40 characters or fewer.' as const };
  if (type !== 'INCOME' && type !== 'EXPENSE')
    return { error: 'Invalid type.' as const };

  return { data: { name, emoji, type: type as 'INCOME' | 'EXPENSE' } };
}

// Prisma error codes without importing the Prisma namespace
// (keeps this file independent of the generated client's import path).
function prismaCode(e: unknown): string | undefined {
  return typeof e === 'object' && e !== null && 'code' in e
    ? String((e as { code: unknown }).code)
    : undefined;
}

export async function createCategory(
  formData: FormData,
): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = parseCategoryInput(formData);
  if ('error' in parsed) return { error: parsed.error };

  try {
    await prisma.category.create({
      data: { userId, ...parsed.data, isDefault: false },
    });
  } catch (e) {
    if (prismaCode(e) === 'P2002') {
      return {
        error: `A ${parsed.data.type.toLowerCase()} category named “${parsed.data.name}” already exists.`,
      };
    }
    throw e;
  }

  revalidatePath('/categories');
  return {};
}

export async function updateCategory(
  formData: FormData,
): Promise<ActionResult> {
  const userId = await requireUserId();
  const id = String(formData.get('id') ?? '');
  if (!id) return { error: 'Missing category id.' };

  const parsed = parseCategoryInput(formData);
  if ('error' in parsed) return { error: parsed.error };

  try {
    const result = await prisma.category.updateMany({
      where: { id, userId }, // scoped: silently no-ops on someone else's id
      data: { name: parsed.data.name, emoji: parsed.data.emoji },
      // NOTE: type is intentionally NOT editable. Flipping a category from
      // EXPENSE to INCOME would silently invert the meaning of every
      // transaction already attached to it.
    });
    if (result.count === 0) return { error: 'Category not found.' };
  } catch (e) {
    if (prismaCode(e) === 'P2002') {
      return { error: 'Another category with that name already exists.' };
    }
    throw e;
  }

  revalidatePath('/categories');
  return {};
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!id) return { error: 'Missing category id.' };

  try {
    const result = await prisma.category.deleteMany({
      where: { id, userId },
    });
    if (result.count === 0) return { error: 'Category not found.' };
  } catch (e) {
    // onDelete: Restrict on Transaction → Category fires P2003
    if (prismaCode(e) === 'P2003') {
      return {
        error:
          'This category has transactions attached. Reassign or delete those first.',
      };
    }
    throw e;
  }

  revalidatePath('/categories');
  return {};
}
