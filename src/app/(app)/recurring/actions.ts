// src/app/(app)/recurring/actions.ts
// Server Actions for RecurringRule CRUD — SIP auto-invests and
// auto-debit subscriptions. v1 is reminder-only: nextRunDate is set by
// hand here and read by the dashboard card; auto-creating a Transaction
// on the due date is a later enhancement (see README).

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

const VALID_FREQUENCIES = ['WEEKLY', 'MONTHLY', 'YEARLY'] as const;
const VALID_KINDS = ['EXPENSE', 'INVESTMENT'] as const;

type Frequency = (typeof VALID_FREQUENCIES)[number];
type Kind = (typeof VALID_KINDS)[number];

function parseRecurringInput(formData: FormData):
  | { error: string }
  | {
      data: {
        name: string;
        amount: number;
        frequency: Frequency;
        nextRunDate: Date;
        kind: Kind;
        categoryId: string;
        moneyAccountId: string;
        isActive: boolean;
      };
    } {
  const name = String(formData.get('name') ?? '').trim();
  const amountRaw = String(formData.get('amount') ?? '').trim();
  const frequency = String(formData.get('frequency') ?? '');
  const nextRunDateRaw = String(formData.get('nextRunDate') ?? '').trim();
  const kind = String(formData.get('kind') ?? '');
  const categoryId = String(formData.get('categoryId') ?? '').trim();
  const moneyAccountId = String(formData.get('moneyAccountId') ?? '').trim();
  const isActive = formData.get('isActive') === 'on';

  if (!name) return { error: 'Name is required.' };
  if (name.length > 60) return { error: 'Name must be 60 characters or fewer.' };

  const amount = parseFloat(amountRaw);
  if (!amountRaw || isNaN(amount) || amount <= 0)
    return { error: 'Amount must be a positive number.' };

  if (!VALID_FREQUENCIES.includes(frequency as Frequency))
    return { error: 'Invalid frequency.' };

  if (!nextRunDateRaw) return { error: 'Next run date is required.' };
  const nextRunDate = new Date(nextRunDateRaw);
  if (isNaN(nextRunDate.getTime())) return { error: 'Invalid next run date.' };

  if (!VALID_KINDS.includes(kind as Kind)) return { error: 'Invalid kind.' };
  if (!categoryId) return { error: 'Category is required.' };
  if (!moneyAccountId) return { error: 'Account is required.' };

  return {
    data: {
      name,
      amount,
      frequency: frequency as Frequency,
      nextRunDate,
      kind: kind as Kind,
      categoryId,
      moneyAccountId,
      isActive,
    },
  };
}

export async function createRecurringRule(
  formData: FormData,
): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = parseRecurringInput(formData);
  if ('error' in parsed) return { error: parsed.error };

  const [category, account] = await Promise.all([
    prisma.category.findFirst({ where: { id: parsed.data.categoryId, userId } }),
    prisma.moneyAccount.findFirst({
      where: { id: parsed.data.moneyAccountId, userId },
    }),
  ]);
  if (!category) return { error: 'Invalid category.' };
  if (!account) return { error: 'Invalid account.' };

  await prisma.recurringRule.create({ data: { userId, ...parsed.data } });

  revalidatePath('/recurring');
  revalidatePath('/dashboard');
  return {};
}

export async function updateRecurringRule(
  formData: FormData,
): Promise<ActionResult> {
  const userId = await requireUserId();
  const id = String(formData.get('id') ?? '');
  if (!id) return { error: 'Missing recurring rule id.' };

  const parsed = parseRecurringInput(formData);
  if ('error' in parsed) return { error: parsed.error };

  const [category, account] = await Promise.all([
    prisma.category.findFirst({ where: { id: parsed.data.categoryId, userId } }),
    prisma.moneyAccount.findFirst({
      where: { id: parsed.data.moneyAccountId, userId },
    }),
  ]);
  if (!category) return { error: 'Invalid category.' };
  if (!account) return { error: 'Invalid account.' };

  const result = await prisma.recurringRule.updateMany({
    where: { id, userId },
    data: parsed.data,
  });
  if (result.count === 0) return { error: 'Recurring rule not found.' };

  revalidatePath('/recurring');
  revalidatePath('/dashboard');
  return {};
}

export async function deleteRecurringRule(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!id) return { error: 'Missing recurring rule id.' };

  const result = await prisma.recurringRule.deleteMany({ where: { id, userId } });
  if (result.count === 0) return { error: 'Recurring rule not found.' };

  revalidatePath('/recurring');
  revalidatePath('/dashboard');
  return {};
}
