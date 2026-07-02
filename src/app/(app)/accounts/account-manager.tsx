// src/app/(app)/accounts/account-manager.tsx
'use client';

import { useState, useTransition } from 'react';
import { createAccount, deleteAccount, updateAccount } from './actions';

type MoneyAccount = {
  id: string;
  name: string;
  type: 'BANK' | 'CREDIT_CARD' | 'UPI_WALLET' | 'CASH' | 'LOAN';
  last4: string | null;
  color: string | null;
};

// Label + icon shown in the list for each account type
const TYPE_META: Record<MoneyAccount['type'], { label: string; icon: string }> =
  {
    BANK: { label: 'Bank', icon: '🏦' },
    CREDIT_CARD: { label: 'Credit Card', icon: '💳' },
    UPI_WALLET: { label: 'UPI / Wallet', icon: '📲' },
    CASH: { label: 'Cash', icon: '💵' },
    LOAN: { label: 'Loan', icon: '📉' },
  };

// Renders "HDFC ····2841" from name="HDFC" last4="2841"
function accountLabel(acc: MoneyAccount) {
  return acc.last4 ? `${acc.name} ····${acc.last4}` : acc.name;
}

export function AccountManager({ accounts }: { accounts: MoneyAccount[] }) {
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleCreate(formData: FormData) {
    setError(null);
    const res = await createAccount(formData);
    if (res.error) setError(res.error);
  }

  async function handleUpdate(formData: FormData) {
    setError(null);
    const res = await updateAccount(formData);
    if (res.error) setError(res.error);
    else setEditingId(null);
  }

  function handleDelete(acc: MoneyAccount) {
    if (!confirm(`Delete "${accountLabel(acc)}"?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteAccount(acc.id);
      if (res.error) setError(res.error);
    });
  }

  const borderFaint = 'color-mix(in srgb, var(--ink) 15%, transparent)';

  return (
    <div className='space-y-6'>
      {error && (
        <div
          className='rounded-md border px-3 py-2 text-sm'
          style={{ borderColor: 'var(--sienna)', color: 'var(--sienna)' }}
        >
          {error}
        </div>
      )}

      {/* ── Add form ─────────────────────────── */}
      <form
        action={handleCreate}
        className='flex flex-wrap items-end gap-2 rounded-lg border p-4'
        style={{ borderColor: borderFaint }}
      >
        <label
          className='flex grow flex-col gap-1 text-xs'
          style={{ color: 'var(--ink)' }}
        >
          Name
          <input
            name='name'
            required
            maxLength={50}
            placeholder='HDFC Savings'
            className='rounded-md border px-2 py-1.5 text-sm'
            style={{ borderColor: borderFaint }}
          />
        </label>

        <label
          className='flex flex-col gap-1 text-xs'
          style={{ color: 'var(--ink)' }}
        >
          Type
          <select
            name='type'
            defaultValue='BANK'
            className='rounded-md border px-2 py-1.5 text-sm'
            style={{ borderColor: borderFaint }}
          >
            <option value='BANK'>Bank</option>
            <option value='CREDIT_CARD'>Credit Card</option>
            <option value='UPI_WALLET'>UPI / Wallet</option>
            <option value='CASH'>Cash</option>
            <option value='LOAN'>Loan</option>
          </select>
        </label>

        <label
          className='flex flex-col gap-1 text-xs'
          style={{ color: 'var(--ink)' }}
        >
          Last 4 digits
          <input
            name='last4'
            maxLength={4}
            placeholder='2841'
            className='w-24 rounded-md border px-2 py-1.5 text-sm'
            style={{ borderColor: borderFaint }}
          />
        </label>

        <button
          type='submit'
          className='rounded-md px-4 py-1.5 text-sm font-medium text-white'
          style={{ backgroundColor: 'var(--emerald)' }}
        >
          Add
        </button>
      </form>

      {/* ── Account list ─────────────────────── */}
      <ul
        className='divide-y rounded-lg border'
        style={{ borderColor: borderFaint }}
      >
        {accounts.length === 0 && (
          <li
            className='px-3 py-3 text-sm opacity-60'
            style={{ color: 'var(--ink)' }}
          >
            No accounts yet. Add one above.
          </li>
        )}

        {accounts.map((acc) =>
          editingId === acc.id ? (
            <li key={acc.id} className='px-3 py-2'>
              <form
                action={handleUpdate}
                className='flex flex-wrap items-center gap-2'
              >
                <input type='hidden' name='id' value={acc.id} />
                <input
                  name='name'
                  defaultValue={acc.name}
                  required
                  maxLength={50}
                  className='grow rounded-md border px-2 py-1 text-sm'
                />
                <select
                  name='type'
                  defaultValue={acc.type}
                  className='rounded-md border px-2 py-1 text-sm'
                >
                  <option value='BANK'>Bank</option>
                  <option value='CREDIT_CARD'>Credit Card</option>
                  <option value='UPI_WALLET'>UPI / Wallet</option>
                  <option value='CASH'>Cash</option>
                  <option value='LOAN'>Loan</option>
                </select>
                <input
                  name='last4'
                  defaultValue={acc.last4 ?? ''}
                  maxLength={4}
                  placeholder='last 4'
                  className='w-20 rounded-md border px-2 py-1 text-sm'
                />
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
              </form>
            </li>
          ) : (
            <li key={acc.id} className='flex items-center gap-3 px-3 py-3'>
              <span className='text-xl'>{TYPE_META[acc.type].icon}</span>
              <span className='grow' style={{ color: 'var(--ink)' }}>
                {/* "HDFC ····2841" passbook style */}
                <span className='text-sm font-medium'>{accountLabel(acc)}</span>
                <span className='ml-2 text-xs opacity-60'>
                  {TYPE_META[acc.type].label}
                </span>
              </span>
              <button
                onClick={() => setEditingId(acc.id)}
                className='px-2 py-1 text-xs opacity-60 hover:opacity-100'
                style={{ color: 'var(--ink)' }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(acc)}
                disabled={isPending}
                className='px-2 py-1 text-xs'
                style={{ color: 'var(--sienna)' }}
              >
                Delete
              </button>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
