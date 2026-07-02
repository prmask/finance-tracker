// src/lib/dashboard.ts
import {
  buildCategoryBreakdown,
  buildMonthlyCashFlowBuckets,
  computeIncomeExpense,
  computeRunningBalance,
} from '@/lib/dashboard-math';
import { getBudgetsData } from '@/lib/budgets';
import { prisma } from '@/lib/prisma';

export async function getDashboardData(userId: string, targetMonth?: Date) {
  // realNow is wall-clock time — it anchors things that don't change as you
  // browse months (total balance, the trailing 6-month chart, "updated at").
  // viewMonth is whichever month the topbar picker is pointed at.
  const realNow = new Date();
  const viewMonth = targetMonth ?? realNow;
  const startOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const endOfMonth = new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  const sixMonthsAgoStart = new Date(realNow.getFullYear(), realNow.getMonth() - 5, 1);
  const sixMonthsEnd = new Date(
    realNow.getFullYear(),
    realNow.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  const [
    transactions,
    allTimeFlows,
    sixMonthFlows,
    accounts,
    budgetsData,
    upcomingRecurring,
  ] = await Promise.all([
    // The viewed month's transactions
    prisma.transaction.findMany({
      where: { userId, date: { gte: startOfMonth, lte: endOfMonth } },
      include: { category: true, moneyAccount: true },
      orderBy: { date: 'desc' },
    }),
    // Every transaction ever — accounts have no stored balance, so the
    // passbook's "Total balance" is a running total derived from history.
    prisma.transaction.findMany({
      where: { userId },
      select: { amount: true, direction: true },
    }),
    // Trailing 6 real months, for the cash flow bar chart
    prisma.transaction.findMany({
      where: { userId, date: { gte: sixMonthsAgoStart, lte: sixMonthsEnd } },
      select: { amount: true, direction: true, date: true },
    }),
    prisma.moneyAccount.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
    getBudgetsData(userId, viewMonth),
    prisma.recurringRule.findFirst({
      where: { userId, isActive: true, nextRunDate: { gte: realNow } },
      orderBy: { nextRunDate: 'asc' },
      include: { category: true },
    }),
  ]);

  const totalBalance = computeRunningBalance(allTimeFlows);
  const { totalIncome, totalExpense, savedPct } = computeIncomeExpense(transactions);

  const activeBudgetRows = budgetsData.rows.filter((r) => r.monthlyLimit !== null);
  const totalBudgetLimit = activeBudgetRows.reduce(
    (sum, r) => sum + (r.monthlyLimit ?? 0),
    0,
  );

  const cashFlowData = buildMonthlyCashFlowBuckets(realNow, sixMonthFlows);
  const categoryBreakdown = buildCategoryBreakdown(transactions);

  // Recent transactions (latest 8 of the viewed month)
  const recentTransactions = transactions.slice(0, 8).map((t) => ({
    ...t,
    amount: Number(t.amount),
  }));

  return {
    totalBalance,
    totalIncome,
    totalExpense,
    savedPct,
    cashFlowData,
    categoryBreakdown,
    recentTransactions,
    accounts,
    accountLabels: accounts.map((a) =>
      a.last4 ? `${a.name} ····${a.last4}` : a.name,
    ),
    activeBudgetRows,
    totalBudgetLimit,
    allBudgetsOnTrack: budgetsData.allOnTrack,
    upcomingRecurring: upcomingRecurring
      ? {
          name: upcomingRecurring.name,
          amount: Number(upcomingRecurring.amount),
          frequency: upcomingRecurring.frequency,
          kind: upcomingRecurring.kind,
          emoji: upcomingRecurring.category?.emoji ?? null,
          daysUntil: Math.ceil(
            (upcomingRecurring.nextRunDate.getTime() - realNow.getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        }
      : null,
    viewYear: viewMonth.getFullYear(),
    viewMonthIndex: viewMonth.getMonth(),
    month: viewMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
    monthShort: viewMonth.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase(),
    updatedAt: realNow.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  };
}
