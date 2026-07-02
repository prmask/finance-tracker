// src/app/api/transactions/export/route.ts
// Exports the signed-in user's transactions as CSV. Honors the same
// month/category/account filters as the /transactions page (via the same
// query params), so "export" means "export what I'm currently looking
// at" — and exports the full matching set, not just the page's 100-row cap.
import { auth } from '@/auth';
import { buildCsv } from '@/lib/csv';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { NextRequest } from 'next/server';

// Leading BOM so Excel opens the file as UTF-8 instead of mojibake-ing
// any non-ASCII characters (e.g. account names).
const UTF8_BOM = '\uFEFF';

function accountLabel(acc: { name: string; last4: string | null }) {
  return acc.last4 ? `${acc.name} ····${acc.last4}` : acc.name;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month') ?? undefined;
  const categoryId = searchParams.get('categoryId') ?? undefined;
  const accountId = searchParams.get('accountId') ?? undefined;

  const where: Prisma.TransactionWhereInput = { userId };
  if (categoryId) where.categoryId = categoryId;
  if (accountId) where.moneyAccountId = accountId;
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [year, monthNum] = month.split('-').map(Number);
    where.date = {
      gte: new Date(year, monthNum - 1, 1),
      lte: new Date(year, monthNum, 0, 23, 59, 59),
    };
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
    include: {
      category: { select: { name: true } },
      moneyAccount: { select: { name: true, last4: true } },
    },
  });

  const rows = transactions.map((t) => [
    t.date.toISOString().slice(0, 10),
    t.description,
    t.category?.name ?? 'Uncategorized',
    t.moneyAccount ? accountLabel(t.moneyAccount) : '',
    t.paymentMethod,
    t.direction,
    t.amount.toFixed(2),
  ]);

  const csv = buildCsv(
    ['Date', 'Description', 'Category', 'Account', 'Payment Method', 'Direction', 'Amount (INR)'],
    rows,
  );

  const filename = month ? `paisaa-transactions-${month}.csv` : 'paisaa-transactions.csv';

  return new Response(UTF8_BOM + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
