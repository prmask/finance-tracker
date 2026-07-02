// src/lib/budgets.ts
import { prisma } from '@/lib/prisma';

export type BudgetStatus = 'on-track' | 'warning' | 'over';

export interface BudgetRow {
  categoryId: string;
  categoryName: string;
  emoji: string | null;
  color: string | null;
  monthlyLimit: number | null;
  spent: number;
  pct: number | null;
  status: BudgetStatus | null;
}

export async function getBudgetsData(userId: string, targetMonth?: Date) {
  const now = targetMonth ?? new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  const [categories, budgets, transactions] = await Promise.all([
    prisma.category.findMany({
      where: { userId, type: 'EXPENSE' },
      orderBy: { name: 'asc' },
    }),
    prisma.budget.findMany({ where: { userId } }),
    prisma.transaction.findMany({
      where: {
        userId,
        direction: 'OUT',
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      select: { categoryId: true, amount: true },
    }),
  ]);

  const spentByCategory: Record<string, number> = {};
  for (const t of transactions) {
    spentByCategory[t.categoryId] =
      (spentByCategory[t.categoryId] ?? 0) + Number(t.amount);
  }

  const budgetByCategory = new Map(budgets.map((b) => [b.categoryId, b]));

  const rows: BudgetRow[] = categories.map((cat) => {
    const budget = budgetByCategory.get(cat.id);
    const spent = spentByCategory[cat.id] ?? 0;
    const monthlyLimit = budget ? Number(budget.monthlyLimit) : null;
    const pct = monthlyLimit ? (spent / monthlyLimit) * 100 : null;
    const status: BudgetStatus | null =
      pct === null ? null : pct > 100 ? 'over' : pct >= 80 ? 'warning' : 'on-track';

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      emoji: cat.emoji,
      color: cat.color,
      monthlyLimit,
      spent,
      pct,
      status,
    };
  });

  const activeBudgets = rows.filter((r) => r.monthlyLimit !== null);
  const allOnTrack =
    activeBudgets.length > 0 &&
    activeBudgets.every((r) => r.status === 'on-track');

  return {
    rows,
    month: now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
    allOnTrack,
  };
}
