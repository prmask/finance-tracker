// src/app/(app)/transactions/actions.ts
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

const VALID_DIRECTIONS = ['IN', 'OUT'] as const;
const VALID_METHODS = ['UPI', 'AUTO_DEBIT', 'NEFT', 'CARD', 'CASH'] as const;

type Direction = (typeof VALID_DIRECTIONS)[number];
type Method = (typeof VALID_METHODS)[number];

function parseTransactionInput(formData: FormData):
  | { error: string }
  | {
      data: {
        amount: number;
        direction: Direction;
        date: Date;
        description: string;
        paymentMethod: Method;
        categoryId: string;
        moneyAccountId: string;
      };
    } {
  const amountRaw = String(formData.get('amount') ?? '').trim();
  const direction = String(formData.get('direction') ?? '');
  const dateRaw = String(formData.get('date') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const paymentMethod = String(formData.get('paymentMethod') ?? '');
  const categoryId = String(formData.get('categoryId') ?? '').trim();
  const moneyAccountId = String(formData.get('moneyAccountId') ?? '').trim();

  const amount = parseFloat(amountRaw);
  if (!amountRaw || isNaN(amount) || amount <= 0)
    return { error: 'Amount must be a positive number.' };
  if (!VALID_DIRECTIONS.includes(direction as Direction))
    return { error: 'Invalid direction.' };
  if (!dateRaw) return { error: 'Date is required.' };
  const date = new Date(dateRaw);
  if (isNaN(date.getTime())) return { error: 'Invalid date.' };
  if (!description) return { error: 'Description is required.' };
  if (description.length > 100)
    return { error: 'Description must be 100 characters or fewer.' };
  if (!VALID_METHODS.includes(paymentMethod as Method))
    return { error: 'Invalid payment method.' };
  if (!categoryId) return { error: 'Category is required.' };
  if (!moneyAccountId) return { error: 'Account is required.' };

  return {
    data: {
      amount,
      direction: direction as Direction,
      date,
      description,
      paymentMethod: paymentMethod as Method,
      categoryId,
      moneyAccountId,
    },
  };
}

export async function createTransaction(
  formData: FormData,
): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = parseTransactionInput(formData);
  if ('error' in parsed) return { error: parsed.error };

  // Verify the category and account belong to this user
  const [category, account] = await Promise.all([
    prisma.category.findFirst({
      where: { id: parsed.data.categoryId, userId },
    }),
    prisma.moneyAccount.findFirst({
      where: { id: parsed.data.moneyAccountId, userId },
    }),
  ]);
  if (!category) return { error: 'Invalid category.' };
  if (!account) return { error: 'Invalid account.' };

  await prisma.transaction.create({
    data: { userId, ...parsed.data },
  });

  revalidatePath('/transactions');
  return {};
}

export async function updateTransaction(
  formData: FormData,
): Promise<ActionResult> {
  const userId = await requireUserId();
  const id = String(formData.get('id') ?? '');
  if (!id) return { error: 'Missing transaction id.' };

  const parsed = parseTransactionInput(formData);
  if ('error' in parsed) return { error: parsed.error };

  const [category, account] = await Promise.all([
    prisma.category.findFirst({
      where: { id: parsed.data.categoryId, userId },
    }),
    prisma.moneyAccount.findFirst({
      where: { id: parsed.data.moneyAccountId, userId },
    }),
  ]);
  if (!category) return { error: 'Invalid category.' };
  if (!account) return { error: 'Invalid account.' };

  const result = await prisma.transaction.updateMany({
    where: { id, userId },
    data: parsed.data,
  });
  if (result.count === 0) return { error: 'Transaction not found.' };

  revalidatePath('/transactions');
  return {};
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!id) return { error: 'Missing transaction id.' };

  const result = await prisma.transaction.deleteMany({
    where: { id, userId },
  });
  if (result.count === 0) return { error: 'Transaction not found.' };

  revalidatePath('/transactions');
  return {};
}
