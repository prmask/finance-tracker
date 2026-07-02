import { describe, expect, it } from 'vitest';
import {
  buildBudgetRows,
  computeAllOnTrack,
  computeBudgetStatus,
  sumSpentByCategory,
} from './budget-math';

describe('computeBudgetStatus', () => {
  it('returns null pct/status when there is no limit', () => {
    expect(computeBudgetStatus(500, null)).toEqual({ pct: null, status: null });
  });

  it('is on-track just under 80%', () => {
    const { pct, status } = computeBudgetStatus(799, 1000);
    expect(pct).toBeCloseTo(79.9);
    expect(status).toBe('on-track');
  });

  it('flips to warning exactly at 80%', () => {
    expect(computeBudgetStatus(800, 1000).status).toBe('warning');
  });

  it('is still warning exactly at 100%, not over', () => {
    expect(computeBudgetStatus(1000, 1000).status).toBe('warning');
  });

  it('flips to over just past 100%', () => {
    const { pct, status } = computeBudgetStatus(1000.01, 1000);
    expect(status).toBe('over');
    expect(pct).toBeGreaterThan(100);
  });

  it('handles zero spend as on-track', () => {
    expect(computeBudgetStatus(0, 1000)).toEqual({ pct: 0, status: 'on-track' });
  });
});

describe('sumSpentByCategory', () => {
  it('aggregates multiple transactions per category', () => {
    const result = sumSpentByCategory([
      { categoryId: 'food', amount: 100 },
      { categoryId: 'food', amount: '250.50' },
      { categoryId: 'transport', amount: 40 },
    ]);
    expect(result).toEqual({ food: 350.5, transport: 40 });
  });

  it('returns an empty object for no transactions', () => {
    expect(sumSpentByCategory([])).toEqual({});
  });
});

describe('buildBudgetRows', () => {
  const categories = [
    { id: 'food', name: 'Groceries & Food', emoji: '🍛', color: '#0F6B4F' },
    { id: 'transport', name: 'Transport & Fuel', emoji: '🚗', color: '#3B5BA5' },
  ];

  it('leaves categories with no budget set as null status', () => {
    const rows = buildBudgetRows(categories, [], { food: 500 });
    const transport = rows.find((r) => r.categoryId === 'transport');
    expect(transport).toMatchObject({ monthlyLimit: null, status: null, spent: 0 });
  });

  it('computes spent/pct/status for a category with a budget', () => {
    const rows = buildBudgetRows(
      categories,
      [{ categoryId: 'food', monthlyLimit: 1000 }],
      { food: 900 },
    );
    const food = rows.find((r) => r.categoryId === 'food');
    expect(food).toMatchObject({ monthlyLimit: 1000, spent: 900, status: 'warning' });
    expect(food?.pct).toBeCloseTo(90);
  });

  it('defaults spend to 0 for a budgeted category with no transactions', () => {
    const rows = buildBudgetRows(
      categories,
      [{ categoryId: 'transport', monthlyLimit: 500 }],
      {},
    );
    const transport = rows.find((r) => r.categoryId === 'transport');
    expect(transport).toMatchObject({ spent: 0, pct: 0, status: 'on-track' });
  });
});

describe('computeAllOnTrack', () => {
  it('is false when there are no active budgets', () => {
    expect(
      computeAllOnTrack([
        {
          categoryId: 'food',
          categoryName: 'Food',
          emoji: null,
          color: null,
          monthlyLimit: null,
          spent: 0,
          pct: null,
          status: null,
        },
      ]),
    ).toBe(false);
  });

  it('is true when every active budget is on-track', () => {
    expect(
      computeAllOnTrack([
        {
          categoryId: 'food',
          categoryName: 'Food',
          emoji: null,
          color: null,
          monthlyLimit: 1000,
          spent: 500,
          pct: 50,
          status: 'on-track',
        },
        {
          categoryId: 'transport',
          categoryName: 'Transport',
          emoji: null,
          color: null,
          monthlyLimit: null,
          spent: 0,
          pct: null,
          status: null,
        },
      ]),
    ).toBe(true);
  });

  it('is false when any active budget is over or in warning', () => {
    expect(
      computeAllOnTrack([
        {
          categoryId: 'food',
          categoryName: 'Food',
          emoji: null,
          color: null,
          monthlyLimit: 1000,
          spent: 1200,
          pct: 120,
          status: 'over',
        },
      ]),
    ).toBe(false);
  });
});
