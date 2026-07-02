// src/lib/dashboard.ts
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

  const totalBalance = allTimeFlows.reduce(
    (sum, t) => sum + (t.direction === 'IN' ? Number(t.amount) : -Number(t.amount)),
    0,
  );

  // Compute balance strip numbers
  const totalIncome = transactions
    .filter((t) => t.direction === 'IN')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.direction === 'OUT')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netBalance = totalIncome - totalExpense;
  const savedPct = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;

  const activeBudgetRows = budgetsData.rows.filter((r) => r.monthlyLimit !== null);
  const totalBudgetLimit = activeBudgetRows.reduce(
    (sum, r) => sum + (r.monthlyLimit ?? 0),
    0,
  );

  // Cash flow: money in vs money out per month, last 6 real months
  const monthBuckets = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(realNow.getFullYear(), realNow.getMonth() - (5 - i), 1);
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      date: d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase(),
      income: 0,
      expense: 0,
    };
  });
  for (const t of sixMonthFlows) {
    const bucket = monthBuckets.find(
      (b) => b.year === t.date.getFullYear() && b.month === t.date.getMonth(),
    );
    if (!bucket) continue;
    if (t.direction === 'IN') bucket.income += Number(t.amount);
    else bucket.expense += Number(t.amount);
  }
  const cashFlowData = monthBuckets.map(({ date, income, expense }) => ({
    date,
    income,
    expense,
  }));

  // Category breakdown (expenses only, viewed month)
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
  const categoryBreakdown = Object.values(categoryMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // Recent transactions (latest 8 of the viewed month)
  const recentTransactions = transactions.slice(0, 8).map((t) => ({
    ...t,
    amount: Number(t.amount),
  }));

  return {
    totalBalance,
    netBalance,
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
