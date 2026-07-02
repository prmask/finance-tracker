import { describe, expect, it } from 'vitest';
import {
  buildCategoryBreakdown,
  buildMonthlyCashFlowBuckets,
  computeIncomeExpense,
  computeRunningBalance,
} from './dashboard-math';

describe('computeRunningBalance', () => {
  it('sums IN as positive and OUT as negative', () => {
    expect(
      computeRunningBalance([
        { direction: 'IN', amount: 50000 },
        { direction: 'OUT', amount: 12000 },
        { direction: 'OUT', amount: '3000' },
      ]),
    ).toBe(35000);
  });

  it('returns 0 for no transactions', () => {
    expect(computeRunningBalance([])).toBe(0);
  });

  it('can go negative when spend exceeds income', () => {
    expect(
      computeRunningBalance([
        { direction: 'IN', amount: 100 },
        { direction: 'OUT', amount: 500 },
      ]),
    ).toBe(-400);
  });
});

describe('computeIncomeExpense', () => {
  it('computes totals, net, and saved percentage', () => {
    const result = computeIncomeExpense([
      { direction: 'IN', amount: 100000 },
      { direction: 'OUT', amount: 60000 },
    ]);
    expect(result.totalIncome).toBe(100000);
    expect(result.totalExpense).toBe(60000);
    expect(result.netBalance).toBe(40000);
    expect(result.savedPct).toBeCloseTo(40);
  });

  it('reports 0% saved when there is no income, instead of NaN/Infinity', () => {
    const result = computeIncomeExpense([{ direction: 'OUT', amount: 500 }]);
    expect(result.totalIncome).toBe(0);
    expect(result.savedPct).toBe(0);
  });

  it('allows a negative saved percentage when overspending', () => {
    const result = computeIncomeExpense([
      { direction: 'IN', amount: 1000 },
      { direction: 'OUT', amount: 1500 },
    ]);
    expect(result.netBalance).toBe(-500);
    expect(result.savedPct).toBeCloseTo(-50);
  });
});

describe('buildMonthlyCashFlowBuckets', () => {
  it('produces exactly 6 months ending at the anchor month', () => {
    const buckets = buildMonthlyCashFlowBuckets(new Date(2026, 5, 15), []);
    expect(buckets.map((b) => b.date)).toEqual(['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN']);
  });

  it('rolls over the year boundary correctly (e.g. anchored in Feb)', () => {
    const buckets = buildMonthlyCashFlowBuckets(new Date(2026, 1, 10), []);
    // en-IN abbreviates September as "Sept", not "Sep" — that's real
    // Intl behavior, not a bug, so the assertion matches it.
    expect(buckets.map((b) => b.date)).toEqual(['SEPT', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB']);
  });

  it('assigns each flow to the correct month bucket', () => {
    const buckets = buildMonthlyCashFlowBuckets(new Date(2026, 5, 15), [
      { direction: 'IN', amount: 1000, date: new Date(2026, 4, 3) },
      { direction: 'OUT', amount: 400, date: new Date(2026, 4, 20) },
      { direction: 'OUT', amount: 200, date: new Date(2026, 5, 1) },
    ]);
    const may = buckets.find((b) => b.date === 'MAY');
    const jun = buckets.find((b) => b.date === 'JUN');
    expect(may).toMatchObject({ income: 1000, expense: 400 });
    expect(jun).toMatchObject({ income: 0, expense: 200 });
  });

  it('ignores flows outside the 6-month window', () => {
    const buckets = buildMonthlyCashFlowBuckets(new Date(2026, 5, 15), [
      { direction: 'IN', amount: 999, date: new Date(2025, 0, 1) },
    ]);
    const total = buckets.reduce((sum, b) => sum + b.income + b.expense, 0);
    expect(total).toBe(0);
  });
});

describe('buildCategoryBreakdown', () => {
  it('aggregates OUT transactions per category and sorts descending', () => {
    const breakdown = buildCategoryBreakdown([
      {
        categoryId: 'food',
        direction: 'OUT',
        amount: 100,
        category: { name: 'Food', emoji: '🍛', color: '#0F6B4F' },
      },
      {
        categoryId: 'transport',
        direction: 'OUT',
        amount: 500,
        category: { name: 'Transport', emoji: '🚗', color: '#3B5BA5' },
      },
      {
        categoryId: 'food',
        direction: 'OUT',
        amount: 50,
        category: { name: 'Food', emoji: '🍛', color: '#0F6B4F' },
      },
    ]);
    expect(breakdown.map((c) => c.name)).toEqual(['Transport', 'Food']);
    expect(breakdown.find((c) => c.name === 'Food')?.total).toBe(150);
  });

  it('ignores IN (income) transactions entirely', () => {
    const breakdown = buildCategoryBreakdown([
      {
        categoryId: 'salary',
        direction: 'IN',
        amount: 50000,
        category: { name: 'Salary', emoji: '💼', color: '#0F6B4F' },
      },
    ]);
    expect(breakdown).toEqual([]);
  });

  it('falls back to "Uncategorized" when there is no category', () => {
    const breakdown = buildCategoryBreakdown([
      { categoryId: null, direction: 'OUT', amount: 75, category: null },
    ]);
    expect(breakdown).toEqual([
      { name: 'Uncategorized', emoji: '📦', total: 75, color: '#94a3b8' },
    ]);
  });

  it('caps the result at the top 6 categories', () => {
    const transactions = Array.from({ length: 8 }, (_, i) => ({
      categoryId: `cat-${i}`,
      direction: 'OUT' as const,
      amount: 100 - i, // descending, so order is deterministic
      category: { name: `Cat ${i}`, emoji: '📦', color: '#000000' },
    }));
    expect(buildCategoryBreakdown(transactions)).toHaveLength(6);
  });
});
