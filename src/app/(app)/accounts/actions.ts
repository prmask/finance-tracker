// src/app/(app)/accounts/actions.ts
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

const VALID_TYPES = ['BANK', 'CREDIT_CARD', 'UPI_WALLET', 'CASH', 'LOAN'] as const;
type AccountType = (typeof VALID_TYPES)[number];

function parseAccountInput(
  formData: FormData,
):
  | { error: string }
  | { data: { name: string; type: AccountType; last4: string | null } } {
  const name = String(formData.get('name') ?? '').trim();
  const type = String(formData.get('type') ?? '');
  const last4Raw = String(formData.get('last4') ?? '').trim();

  if (!name) return { error: 'Account name is required.' };
  if (name.length > 50)
    return { error: 'Name must be 50 characters or fewer.' };
  if (!VALID_TYPES.includes(type as AccountType))
    return { error: 'Invalid account type.' };

  let last4: string | null = null;
  if (last4Raw) {
    if (!/^\d{4}$/.test(last4Raw))
      return { error: 'Last 4 digits must be exactly 4 numbers.' };
    last4 = last4Raw;
  }

  return { data: { name, type: type as AccountType, last4 } };
}

function prismaCode(e: unknown): string | undefined {
  return typeof e === 'object' && e !== null && 'code' in e
    ? String((e as { code: unknown }).code)
    : undefined;
}

export async function createAccount(formData: FormData): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = parseAccountInput(formData);
  if ('error' in parsed) return { error: parsed.error };

  try {
    await prisma.moneyAccount.create({
      data: { userId, ...parsed.data },
    });
  } catch (e) {
    if (prismaCode(e) === 'P2002') {
      return {
        error: `An account named "${parsed.data.name}" already exists.`,
      };
    }
    throw e;
  }

  revalidatePath('/accounts');
  return {};
}

export async function updateAccount(formData: FormData): Promise<ActionResult> {
  const userId = await requireUserId();
  const id = String(formData.get('id') ?? '');
  if (!id) return { error: 'Missing account id.' };

  const parsed = parseAccountInput(formData);
  if ('error' in parsed) return { error: parsed.error };

  const result = await prisma.moneyAccount.updateMany({
    where: { id, userId },
    data: parsed.data,
  });
  if (result.count === 0) return { error: 'Account not found.' };

  revalidatePath('/accounts');
  return {};
}

export async function deleteAccount(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!id) return { error: 'Missing account id.' };

  try {
    const result = await prisma.moneyAccount.deleteMany({
      where: { id, userId },
    });
    if (result.count === 0) return { error: 'Account not found.' };
  } catch (e) {
    // onDelete: Restrict on Transaction → MoneyAccount
    if (prismaCode(e) === 'P2003') {
      return {
        error: 'This account has transactions. Reassign or delete those first.',
      };
    }
    throw e;
  }

  revalidatePath('/accounts');
  return {};
}
