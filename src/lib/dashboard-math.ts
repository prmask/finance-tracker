// src/lib/dashboard-math.ts
// Pure dashboard math, split out of lib/dashboard.ts so it's testable
// without a database connection. No imports from prisma or anywhere else
// that touches I/O — every function here takes plain data and returns
// plain data. (The Prisma import below is type-only — Decimal's shape,
// not the client — so it's erased at compile time and adds no runtime
// dependency.)
import type { Prisma } from '@prisma/client';

type Amount = number | string | Prisma.Decimal;

export function computeRunningBalance(
  flows: { direction: 'IN' | 'OUT'; amount: Amount }[],
): number {
  return flows.reduce(
    (sum, t) => sum + (t.direction === 'IN' ? Number(t.amount) : -Number(t.amount)),
    0,
  );
}

export function computeIncomeExpense(
  transactions: { direction: 'IN' | 'OUT'; amount: Amount }[],
): { totalIncome: number; totalExpense: number; netBalance: number; savedPct: number } {
  const totalIncome = transactions
    .filter((t) => t.direction === 'IN')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.direction === 'OUT')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const netBalance = totalIncome - totalExpense;
  const savedPct = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;

  return { totalIncome, totalExpense, netBalance, savedPct };
}

export function buildMonthlyCashFlowBuckets(
  anchorMonth: Date,
  flows: { direction: 'IN' | 'OUT'; amount: Amount; date: Date }[],
): { date: string; income: number; expense: number }[] {
  const monthBuckets = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(anchorMonth.getFullYear(), anchorMonth.getMonth() - (5 - i), 1);
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      date: d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase(),
      income: 0,
      expense: 0,
    };
  });

  for (const t of flows) {
    const bucket = monthBuckets.find(
      (b) => b.year === t.date.getFullYear() && b.month === t.date.getMonth(),
    );
    if (!bucket) continue;
    if (t.direction === 'IN') bucket.income += Number(t.amount);
    else bucket.expense += Number(t.amount);
  }

  return monthBuckets.map(({ date, income, expense }) => ({ date, income, expense }));
}

export function buildCategoryBreakdown(
  transactions: {
    categoryId: string | null;
    direction: 'IN' | 'OUT';
    amount: Amount;
    category: { name: string; emoji: string | null; color: string | null } | null;
  }[],
): { name: string; emoji: string; total: number; color: string }[] {
  const categoryMap: Record<
    string,
    { name: string; emoji: string; total: number; color: string }
  > = {};

  for (const t of transactions.filter((t) => t.direction === 'OUT')) {
    const key = t.categoryId ?? 'uncategorized';
    if (!categoryMap[key]) {
      categoryMap[key] = {
        name: t.category?.name ?? 'Uncategorized',
        emoji: t.category?.emoji ?? '📦',
        total: 0,
        color: t.category?.color ?? '#94a3b8',
      };
    }
    categoryMap[key].total += Number(t.amount);
  }

  return Object.values(categoryMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);
}
