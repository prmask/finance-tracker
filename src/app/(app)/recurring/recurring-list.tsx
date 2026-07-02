// src/app/(app)/recurring/recurring-list.tsx
'use client';

import { useState, useTransition } from 'react';
import { deleteRecurringRule, updateRecurringRule } from './actions';

type Category = { id: string; name: string; emoji: string | null; type: string };
type Account = { id: string; name: string; last4: string | null };

type Rule = {
  id: string;
  name: string;
  amount: unknown; // Decimal comes through as a string over the wire
  frequency: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  nextRunDate: Date | string;
  kind: 'EXPENSE' | 'INVESTMENT';
  isActive: boolean;
  category: { id: string; name: string; emoji: string | null } | null;
  moneyAccount: { id: string; name: string; last4: string | null } | null;
};

function accountLabel(acc: { name: string; last4: string | null }) {
  return acc.last4 ? `${acc.name} ····${acc.last4}` : acc.name;
}

function formatAmount(amount: unknown) {
  const n = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatFrequency(f: string) {
  return f === 'MONTHLY' ? 'Monthly' : f === 'WEEKLY' ? 'Weekly' : 'Yearly';
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function toDateInputValue(d: Date | string) {
  return new Date(d).toISOString().split('T')[0];
}

function daysUntil(d: Date | string) {
  const ms = new Date(d).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function RecurringList({
  rules,
  categories,
  accounts,
}: {
  rules: Rule[];
  categories: Category[];
  accounts: Account[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleUpdate(formData: FormData) {
    setError(null);
    const res = await updateRecurringRule(formData);
    if (res.error) setError(res.error);
    else setEditingId(null);
  }

  function handleDelete(rule: Rule) {
    if (!confirm(`Delete "${rule.name}"?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteRecurringRule(rule.id);
      if (res.error) setError(res.error);
    });
  }

  if (rules.length === 0) {
    return (
      <p className='py-8 text-center text-sm text-[var(--ink)]/60'>
        No recurring rules yet. Add your first SIP or auto-debit above.
      </p>
    );
  }

  return (
    <div className='space-y-1'>
      {error && (
        <p className='mb-2 rounded-md border border-[var(--sienna)] px-3 py-2 text-xs text-[var(--sienna)]'>
          {error}
        </p>
      )}

      {rules.map((rule) =>
        editingId === rule.id ? (
          <div
            key={rule.id}
            className='rounded-lg border border-[var(--ink)]/12 p-3'
          >
            <form action={handleUpdate} className='space-y-2'>
              <input type='hidden' name='id' value={rule.id} />

              <div className='flex gap-2'>
                <label className='flex grow flex-col gap-1 text-xs text-[var(--ink)]'>
                  Name
                  <input
                    name='name'
                    defaultValue={rule.name}
                    required
                    maxLength={60}
                    className='rounded-md border border-[var(--ink)]/20 px-2 py-1 text-sm'
                  />
                </label>
                <label className='flex flex-col gap-1 text-xs text-[var(--ink)]'>
                  Amount (₹)
                  <input
                    name='amount'
                    type='number'
                    min='0.01'
                    step='0.01'
                    defaultValue={String(rule.amount)}
                    required
                    className='w-28 rounded-md border border-[var(--ink)]/20 px-2 py-1 text-sm'
                  />
                </label>
              </div>

              <div className='flex gap-2'>
                <label className='flex flex-col gap-1 text-xs text-[var(--ink)]'>
                  Kind
                  <select
                    name='kind'
                    defaultValue={rule.kind}
                    className='rounded-md border border-[var(--ink)]/20 px-2 py-1 text-sm'
                  >
                    <option value='EXPENSE'>Expense</option>
                    <option value='INVESTMENT'>Investment</option>
                  </select>
                </label>
                <label className='flex flex-col gap-1 text-xs text-[var(--ink)]'>
                  Frequency
                  <select
                    name='frequency'
                    defaultValue={rule.frequency}
                    className='rounded-md border border-[var(--ink)]/20 px-2 py-1 text-sm'
                  >
                    <option value='WEEKLY'>Weekly</option>
                    <option value='MONTHLY'>Monthly</option>
                    <option value='YEARLY'>Yearly</option>
                  </select>
                </label>
                <label className='flex grow flex-col gap-1 text-xs text-[var(--ink)]'>
                  Next run date
                  <input
                    name='nextRunDate'
                    type='date'
                    defaultValue={toDateInputValue(rule.nextRunDate)}
                    required
                    className='rounded-md border border-[var(--ink)]/20 px-2 py-1 text-sm'
                  />
                </label>
              </div>

              <div className='flex gap-2'>
                <label className='flex grow flex-col gap-1 text-xs text-[var(--ink)]'>
                  Category
                  <select
                    name='categoryId'
                    defaultValue={rule.category?.id}
                    required
                    className='rounded-md border border-[var(--ink)]/20 px-2 py-1 text-sm'
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.emoji} {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className='flex grow flex-col gap-1 text-xs text-[var(--ink)]'>
                  Account
                  <select
                    name='moneyAccountId'
                    defaultValue={rule.moneyAccount?.id}
                    required
                    className='rounded-md border border-[var(--ink)]/20 px-2 py-1 text-sm'
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {accountLabel(a)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className='flex items-center gap-2 text-xs text-[var(--ink)]'>
                <input type='checkbox' name='isActive' defaultChecked={rule.isActive} />
                Active
              </label>

              <div className='flex gap-2 pt-1'>
                <button
                  type='submit'
                  className='rounded-md bg-[var(--emerald)] px-3 py-1 text-xs font-medium text-white'
                >
                  Save
                </button>
                <button
                  type='button'
                  onClick={() => setEditingId(null)}
                  className='px-2 py-1 text-xs text-[var(--ink)] opacity-60'
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div
            key={rule.id}
            className='flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-black/[0.02]'
          >
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--ink)_8%,transparent)] text-lg'>
              {rule.category?.emoji ?? (rule.kind === 'INVESTMENT' ? '🌱' : '🔁')}
            </div>

            <div className='min-w-0 grow'>
              <p className='flex items-center gap-2 truncate text-sm font-medium text-[var(--ink)]'>
                {rule.name}
                {!rule.isActive && (
                  <span className='shrink-0 rounded-full border border-[var(--ink)]/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-[var(--ink)]/50'>
                    Paused
                  </span>
                )}
              </p>
              <p className='mt-0.5 truncate text-xs text-[var(--ink)]/60'>
                {formatFrequency(rule.frequency)}
                {' · '}
                {rule.moneyAccount ? accountLabel(rule.moneyAccount) : 'No account'}
                {' · next '}
                {formatDate(rule.nextRunDate)}
                {rule.isActive &&
                  ` (${daysUntil(rule.nextRunDate) <= 0 ? 'due' : `in ${daysUntil(rule.nextRunDate)}d`})`}
              </p>
            </div>

            <div className='shrink-0 text-right'>
              <p
                className='text-sm font-semibold'
                style={{
                  color:
                    rule.kind === 'INVESTMENT' ? 'var(--emerald)' : 'var(--sienna)',
                  fontFamily: 'var(--font-plex-mono, monospace)',
                }}
              >
                ₹{formatAmount(rule.amount)}
              </p>
              <p className='mt-0.5 text-[10px] uppercase tracking-wide text-[var(--ink)]/50'>
                {rule.kind === 'INVESTMENT' ? 'Investment' : 'Expense'}
              </p>
            </div>

            <div className='flex shrink-0 flex-col gap-0.5'>
              <button
                onClick={() => setEditingId(rule.id)}
                className='px-2 py-0.5 text-[10px] text-[var(--ink)] opacity-50 hover:opacity-100'
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(rule)}
                disabled={isPending}
                className='px-2 py-0.5 text-[10px] text-[var(--sienna)] opacity-50 hover:opacity-100'
              >
                Del
              </button>
            </div>
          </div>
        ),
      )}
    </div>
  );
}
