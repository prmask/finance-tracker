// src/lib/default-categories.ts
// Seed data for a fresh user's first login.
// seedDefaultCategories is idempotent: skipDuplicates + the
// @@unique([userId, name, type]) constraint means calling it twice
// can never create duplicates.

import { prisma } from '@/lib/prisma';

export const DEFAULT_CATEGORIES = [
  // ── Expenses ──────────────────────────────
  { name: 'Groceries & Food', emoji: '🍛', color: '#0F6B4F', type: 'EXPENSE' },
  { name: 'Eating Out', emoji: '🍽️', color: '#A8552F', type: 'EXPENSE' },
  { name: 'Transport & Fuel', emoji: '🚗', color: '#3B5BA5', type: 'EXPENSE' },
  { name: 'Rent & Utilities', emoji: '🏠', color: '#6B4F8F', type: 'EXPENSE' },
  { name: 'Subscriptions', emoji: '📺', color: '#B0382F', type: 'EXPENSE' },
  { name: 'Shopping', emoji: '🛍️', color: '#C77D2E', type: 'EXPENSE' },
  { name: 'Health', emoji: '💊', color: '#2F7D6B', type: 'EXPENSE' },
  { name: 'Entertainment', emoji: '🎬', color: '#8F4F6B', type: 'EXPENSE' },

  // ── Income ────────────────────────────────
  { name: 'Salary', emoji: '💼', color: '#0F6B4F', type: 'INCOME' },
  { name: 'Investments', emoji: '📈', color: '#1F6B8F', type: 'INCOME' },
  { name: 'Other Income', emoji: '💸', color: '#6B6B2F', type: 'INCOME' },
] as const;

export async function seedDefaultCategories(userId: string) {
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({
      userId,
      name: c.name,
      emoji: c.emoji,
      color: c.color,
      type: c.type,
      isDefault: true,
    })),
    skipDuplicates: true,
  });
}
