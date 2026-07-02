// src/lib/budget-math.ts
// Pure budget-status math, split out of lib/budgets.ts so it's testable
// without a database connection. No imports from prisma or anywhere else
// that touches I/O — every function here takes plain data and returns
// plain data. (The Prisma import below is type-only — Decimal's shape,
// not the client — so it's erased at compile time and adds no runtime
// dependency.)
import type { Prisma } from '@prisma/client';

export type BudgetStatus = 'on-track' | 'warning' | 'over';
type Amount = number | string | Prisma.Decimal;

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

export function computeBudgetStatus(
  spent: number,
  monthlyLimit: number | null,
): { pct: number | null; status: BudgetStatus | null } {
  const pct = monthlyLimit ? (spent / monthlyLimit) * 100 : null;
  const status: BudgetStatus | null =
    pct === null ? null : pct > 100 ? 'over' : pct >= 80 ? 'warning' : 'on-track';
  return { pct, status };
}

export function sumSpentByCategory(
  transactions: { categoryId: string; amount: Amount }[],
): Record<string, number> {
  const spentByCategory: Record<string, number> = {};
  for (const t of transactions) {
    spentByCategory[t.categoryId] =
      (spentByCategory[t.categoryId] ?? 0) + Number(t.amount);
  }
  return spentByCategory;
}

export function buildBudgetRows(
  categories: { id: string; name: string; emoji: string | null; color: string | null }[],
  budgets: { categoryId: string; monthlyLimit: number }[],
  spentByCategory: Record<string, number>,
): BudgetRow[] {
  const budgetByCategory = new Map(budgets.map((b) => [b.categoryId, b.monthlyLimit]));

  return categories.map((cat) => {
    const monthlyLimit = budgetByCategory.get(cat.id) ?? null;
    const spent = spentByCategory[cat.id] ?? 0;
    const { pct, status } = computeBudgetStatus(spent, monthlyLimit);

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
}

export function computeAllOnTrack(rows: BudgetRow[]): boolean {
  const activeBudgets = rows.filter((r) => r.monthlyLimit !== null);
  return activeBudgets.length > 0 && activeBudgets.every((r) => r.status === 'on-track');
}
