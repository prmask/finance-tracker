// src/lib/budgets.ts
import {
  buildBudgetRows,
  computeAllOnTrack,
  sumSpentByCategory,
} from '@/lib/budget-math';
import { prisma } from '@/lib/prisma';

export type { BudgetRow, BudgetStatus } from '@/lib/budget-math';

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

  const spentByCategory = sumSpentByCategory(transactions);
  const normalizedBudgets = budgets.map((b) => ({
    categoryId: b.categoryId,
    monthlyLimit: Number(b.monthlyLimit),
  }));
  const rows = buildBudgetRows(categories, normalizedBudgets, spentByCategory);
  const allOnTrack = computeAllOnTrack(rows);

  return {
    rows,
    month: now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
    allOnTrack,
  };
}
