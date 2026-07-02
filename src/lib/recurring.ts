// src/lib/recurring.ts
// Materializes RecurringRules into real Transactions once their due date
// has passed. There's no cron here — this app has no background worker —
// so it runs as a catch-up pass from (app)/layout.tsx on every
// authenticated page load. That's enough for a personal-use app: by the
// time you look at any page, anything due has already become a real
// transaction with the correct historical date, so budgets and cash flow
// never silently miss recurring spend.
import { prisma } from '@/lib/prisma';
import type { Prisma, RecurringFrequency } from '@prisma/client';

// If a rule has been due for a very long time (e.g. the app went unused
// for years), don't backfill an unbounded number of transactions — cap
// the catch-up and fast-forward the rest.
const MAX_CATCHUP_PER_RULE = 24;

function addInterval(date: Date, frequency: RecurringFrequency): Date {
  if (frequency === 'WEEKLY') {
    const d = new Date(date);
    d.setDate(d.getDate() + 7);
    return d;
  }

  // MONTHLY / YEARLY: clamp the day so e.g. a SIP set for the 31st lands
  // on Feb 28 instead of silently rolling over into March.
  const monthsToAdd = frequency === 'MONTHLY' ? 1 : 12;
  const targetMonthFirst = new Date(
    date.getFullYear(),
    date.getMonth() + monthsToAdd,
    1,
  );
  const daysInTargetMonth = new Date(
    targetMonthFirst.getFullYear(),
    targetMonthFirst.getMonth() + 1,
    0,
  ).getDate();

  return new Date(
    targetMonthFirst.getFullYear(),
    targetMonthFirst.getMonth(),
    Math.min(date.getDate(), daysInTargetMonth),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  );
}

export async function processDueRecurringRules(
  userId: string,
  now: Date = new Date(),
): Promise<number> {
  const dueRules = await prisma.recurringRule.findMany({
    where: { userId, isActive: true, nextRunDate: { lte: now } },
  });

  let created = 0;

  for (const rule of dueRules) {
    const transactionsToCreate: Prisma.TransactionCreateManyInput[] = [];
    let nextRunDate = rule.nextRunDate;
    let iterations = 0;

    while (nextRunDate <= now && iterations < MAX_CATCHUP_PER_RULE) {
      transactionsToCreate.push({
        userId,
        moneyAccountId: rule.moneyAccountId,
        categoryId: rule.categoryId,
        amount: rule.amount,
        // RecurringKind is EXPENSE | INVESTMENT — both are money leaving
        // the account (a SIP debit is still a debit), so this is always OUT.
        direction: 'OUT',
        date: nextRunDate,
        description: rule.name,
        paymentMethod: 'AUTO_DEBIT',
      });
      nextRunDate = addInterval(nextRunDate, rule.frequency);
      iterations++;
    }

    // Past the cap: skip ahead to the next future occurrence without
    // generating more backdated transactions.
    while (nextRunDate <= now) {
      nextRunDate = addInterval(nextRunDate, rule.frequency);
    }

    await prisma.$transaction([
      prisma.transaction.createMany({ data: transactionsToCreate }),
      prisma.recurringRule.update({
        where: { id: rule.id },
        data: { nextRunDate },
      }),
    ]);
    created += transactionsToCreate.length;
  }

  return created;
}
