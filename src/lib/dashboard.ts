// src/lib/dashboard.ts
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function getDashboardData(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  // All transactions this month
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: startOfMonth, lte: endOfMonth },
    },
    include: {
      category: true,
      moneyAccount: true,
    },
    orderBy: { date: 'desc' },
  });

  // All money accounts (for total balance)
  const accounts = await prisma.moneyAccount.findMany({
    where: { userId },
  });

  // Compute balance strip numbers
  const totalIncome = transactions
    .filter((t) => t.direction === 'IN')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.direction === 'OUT')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netBalance = totalIncome - totalExpense;

  // Cash flow: daily net for the month so far (for Recharts)
  const cashFlowByDay: Record<string, { income: number; expense: number }> = {};
  for (const t of transactions) {
    const day = t.date.toISOString().slice(0, 10); // "2026-06-03"
    if (!cashFlowByDay[day]) cashFlowByDay[day] = { income: 0, expense: 0 };
    if (t.direction === 'IN') cashFlowByDay[day].income += Number(t.amount);
    else cashFlowByDay[day].expense += Number(t.amount);
  }
  const cashFlowData = Object.entries(cashFlowByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({
      date: new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      }),
      income: vals.income,
      expense: vals.expense,
    }));

  // Category breakdown (expenses only, this month)
  const categoryMap: Record<
    string,
    { name: string; icon: string; total: number; color: string }
  > = {};
  for (const t of transactions.filter((t) => t.direction === 'OUT')) {
    const key = t.categoryId ?? 'uncategorized';
    if (!categoryMap[key]) {
      categoryMap[key] = {
        name: t.category?.name ?? 'Uncategorized',
        icon: t.category?.icon ?? '📦',
        total: 0,
        color: t.category?.color ?? '#94a3b8',
      };
    }
    categoryMap[key].total += Number(t.amount);
  }
  const categoryBreakdown = Object.values(categoryMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // Recent transactions (latest 8)
  /// const recentTransactions = transactions.slice(0, 8);

  const recentTransactions = transactions.slice(0, 8).map((t) => ({
    ...t,
    amount: Number(t.amount),
  }));

  return {
    netBalance,
    totalIncome,
    totalExpense,
    cashFlowData,
    categoryBreakdown,
    recentTransactions,
    accounts,
    month: now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
  };
}
