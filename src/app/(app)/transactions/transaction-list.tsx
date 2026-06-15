// src/app/(app)/transactions/transaction-list.tsx
'use client';

import { useState, useTransition } from 'react';
import { deleteTransaction, updateTransaction } from './actions';

type Category = {
  id: string;
  name: string;
  emoji: string | null;
  type: string;
};
type Account = { id: string; name: string; last4: string | null; type: string };

type Transaction = {
  id: string;
  amount: unknown; // Prisma Decimal comes through as string over the wire
  direction: 'IN' | 'OUT';
  date: Date | string;
  description: string;
  paymentMethod: string;
  category: { id: string; name: string; emoji: string | null; type: string };
  moneyAccount: {
    id: string;
    name: string;
    last4: string | null;
    type: string;
  };
};

// "HDFC ····2841" or just "PhonePe"
function accountLabel(acc: { name: string; last4: string | null }) {
  return acc.last4 ? `${acc.name} ····${acc.last4}` : acc.name;
}

// "9 Jun" from a date
function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

// "UPI" → "UPI", "AUTO_DEBIT" → "Auto Debit"
function formatMethod(m: string) {
  return m === 'AUTO_DEBIT'
    ? 'Auto Debit'
    : m.charAt(0) + m.slice(1).toLowerCase().replace('_', ' ');
}

// Always positive display amount
function formatAmount(amount: unknown) {
  const n = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function toDateInputValue(d: Date | string) {
  return new Date(d).toISOString().split('T')[0];
}

export function TransactionList({
  transactions,
  categories,
  accounts,
}: {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const borderFaint = 'color-mix(in srgb, var(--ink) 12%, transparent)';
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');
  const incomeCategories = categories.filter((c) => c.type === 'INCOME');

  async function handleUpdate(formData: FormData) {
    setError(null);
    const res = await updateTransaction(formData);
    if (res.error) setError(res.error);
    else setEditingId(null);
  }

  function handleDelete(t: Transaction) {
    if (!confirm(`Delete "${t.description}"?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteTransaction(t.id);
      if (res.error) setError(res.error);
    });
  }

  if (transactions.length === 0) {
    return (
      <p
        className='py-8 text-center text-sm opacity-60'
        style={{ color: 'var(--ink)' }}
      >
        No transactions yet. Add your first one above.
      </p>
    );
  }

  return (
    <div className='space-y-1'>
      {error && (
        <p
          className='mb-2 rounded-md border px-3 py-2 text-xs'
          style={{ borderColor: 'var(--sienna)', color: 'var(--sienna)' }}
        >
          {error}
        </p>
      )}

      {transactions.map((t) =>
        editingId === t.id ? (
          // ── Inline edit form ───────────────────────────────────────
          <div
            key={t.id}
            className='rounded-lg border p-3'
            style={{ borderColor: borderFaint }}
          >
            <form action={handleUpdate} className='space-y-2'>
              <input type='hidden' name='id' value={t.id} />

              <div className='flex gap-2'>
                <label
                  className='flex grow flex-col gap-1 text-xs'
                  style={{ color: 'var(--ink)' }}
                >
                  Amount (₹)
                  <input
                    name='amount'
                    type='number'
                    min='0.01'
                    step='0.01'
                    defaultValue={String(t.amount)}
                    required
                    className='rounded-md border px-2 py-1 text-sm'
                  />
                </label>
                <label
                  className='flex flex-col gap-1 text-xs'
                  style={{ color: 'var(--ink)' }}
                >
                  Direction
                  <select
                    name='direction'
                    defaultValue={t.direction}
                    className='rounded-md border px-2 py-1 text-sm'
                  >
                    <option value='OUT'>Out</option>
                    <option value='IN'>In</option>
                  </select>
                </label>
              </div>

              <div className='flex gap-2'>
                <label
                  className='flex grow flex-col gap-1 text-xs'
                  style={{ color: 'var(--ink)' }}
                >
                  Description
                  <input
                    name='description'
                    defaultValue={t.description}
                    required
                    maxLength={100}
                    className='rounded-md border px-2 py-1 text-sm'
                  />
                </label>
                <label
                  className='flex flex-col gap-1 text-xs'
                  style={{ color: 'var(--ink)' }}
                >
                  Date
                  <input
                    name='date'
                    type='date'
                    defaultValue={toDateInputValue(t.date)}
                    required
                    className='rounded-md border px-2 py-1 text-sm'
                  />
                </label>
              </div>

              <div className='flex gap-2'>
                <label
                  className='flex grow flex-col gap-1 text-xs'
                  style={{ color: 'var(--ink)' }}
                >
                  Category
                  <select
                    name='categoryId'
                    defaultValue={t.category.id}
                    required
                    className='rounded-md border px-2 py-1 text-sm'
                  >
                    <optgroup label='Expenses'>
                      {expenseCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.emoji} {c.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label='Income'>
                      {incomeCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.emoji} {c.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </label>
                <label
                  className='flex grow flex-col gap-1 text-xs'
                  style={{ color: 'var(--ink)' }}
                >
                  Account
                  <select
                    name='moneyAccountId'
                    defaultValue={t.moneyAccount.id}
                    required
                    className='rounded-md border px-2 py-1 text-sm'
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {accountLabel(a)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label
                className='flex flex-col gap-1 text-xs'
                style={{ color: 'var(--ink)' }}
              >
                Payment Method
                <select
                  name='paymentMethod'
                  defaultValue={t.paymentMethod}
                  className='rounded-md border px-2 py-1 text-sm'
                >
                  <option value='UPI'>UPI</option>
                  <option value='AUTO_DEBIT'>Auto Debit</option>
                  <option value='NEFT'>NEFT</option>
                  <option value='CARD'>Card</option>
                  <option value='CASH'>Cash</option>
                </select>
              </label>

              <div className='flex gap-2 pt-1'>
                <button
                  type='submit'
                  className='rounded-md px-3 py-1 text-xs font-medium text-white'
                  style={{ backgroundColor: 'var(--emerald)' }}
                >
                  Save
                </button>
                <button
                  type='button'
                  onClick={() => setEditingId(null)}
                  className='px-2 py-1 text-xs opacity-60'
                  style={{ color: 'var(--ink)' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          // ── Paisaa passbook row ────────────────────────────────────
          // Layout: [emoji] [description + meta] [signed amount]
          <div
            key={t.id}
            className='flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-black/[0.02]'
          >
            {/* Category emoji bubble */}
            <div
              className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg'
              style={{
                backgroundColor:
                  'color-mix(in srgb, var(--ink) 8%, transparent)',
              }}
            >
              {t.category.emoji ?? '•'}
            </div>

            {/* Middle: description + meta line */}
            <div className='min-w-0 grow'>
              <p
                className='truncate text-sm font-medium'
                style={{ color: 'var(--ink)' }}
              >
                {t.description}
              </p>
              {/* "UPI · HDFC ····2841 · 9 Jun" */}
              <p
                className='mt-0.5 truncate text-xs opacity-60'
                style={{ color: 'var(--ink)' }}
              >
                {formatMethod(t.paymentMethod)}
                {' · '}
                {accountLabel(t.moneyAccount)}
                {' · '}
                {formatDate(t.date)}
              </p>
            </div>

            {/* Signed amount in mono */}
            <div className='shrink-0 text-right'>
              <p
                className='text-sm font-semibold'
                style={{
                  color:
                    t.direction === 'IN' ? 'var(--emerald)' : 'var(--sienna)',
                  fontFamily: 'var(--font-plex-mono, monospace)',
                }}
              >
                {t.direction === 'IN' ? '+' : '−'}₹{formatAmount(t.amount)}
              </p>
              <p
                className='mt-0.5 text-[10px] uppercase tracking-wide opacity-50'
                style={{ color: 'var(--ink)' }}
              >
                {t.category.name}
              </p>
            </div>

            {/* Edit / Delete */}
            <div className='flex shrink-0 flex-col gap-0.5'>
              <button
                onClick={() => setEditingId(t.id)}
                className='px-2 py-0.5 text-[10px] opacity-50 hover:opacity-100'
                style={{ color: 'var(--ink)' }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(t)}
                disabled={isPending}
                className='px-2 py-0.5 text-[10px] hover:opacity-100'
                style={{ color: 'var(--sienna)', opacity: 0.5 }}
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
