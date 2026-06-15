// src/app/(app)/transactions/add-transaction-form.tsx
'use client';

import { useState } from 'react';
import { createTransaction } from './actions';

type Category = {
  id: string;
  name: string;
  emoji: string | null;
  type: string;
};
type Account = { id: string; name: string; last4: string | null; type: string };

function accountLabel(acc: Account) {
  return acc.last4 ? `${acc.name} ····${acc.last4}` : acc.name;
}

// Today's date in YYYY-MM-DD for the date input default
function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function AddTransactionForm({
  categories,
  accounts,
}: {
  categories: Category[];
  accounts: Account[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const borderFaint = 'color-mix(in srgb, var(--ink) 15%, transparent)';

  async function handleSubmit(formData: FormData) {
    setError(null);
    const res = await createTransaction(formData);
    if (res.error) {
      setError(res.error);
    } else {
      setOpen(false);
    }
  }

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');
  const incomeCategories = categories.filter((c) => c.type === 'INCOME');

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className='w-full rounded-lg border-2 border-dashed py-3 text-sm font-medium transition-opacity hover:opacity-80'
        style={{
          borderColor: 'var(--emerald)',
          color: 'var(--emerald)',
        }}
      >
        + Add Transaction
      </button>
    );
  }

  return (
    <form
      action={handleSubmit}
      className='space-y-3 rounded-lg border p-4'
      style={{ borderColor: borderFaint }}
    >
      <h2 className='text-sm font-semibold' style={{ color: 'var(--ink)' }}>
        New Transaction
      </h2>

      {error && (
        <p
          className='rounded-md border px-3 py-2 text-xs'
          style={{ borderColor: 'var(--sienna)', color: 'var(--sienna)' }}
        >
          {error}
        </p>
      )}

      {/* Row 1: Amount + Direction */}
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
            required
            placeholder='0.00'
            className='rounded-md border px-2 py-1.5 text-sm'
            style={{ borderColor: borderFaint }}
          />
        </label>

        <label
          className='flex flex-col gap-1 text-xs'
          style={{ color: 'var(--ink)' }}
        >
          Direction
          <select
            name='direction'
            defaultValue='OUT'
            className='rounded-md border px-2 py-1.5 text-sm'
            style={{ borderColor: borderFaint }}
          >
            <option value='OUT'>Out (Expense)</option>
            <option value='IN'>In (Income)</option>
          </select>
        </label>
      </div>

      {/* Row 2: Description + Date */}
      <div className='flex gap-2'>
        <label
          className='flex grow flex-col gap-1 text-xs'
          style={{ color: 'var(--ink)' }}
        >
          Description / Merchant
          <input
            name='description'
            required
            maxLength={100}
            placeholder='Swiggy, HDFC EMI…'
            className='rounded-md border px-2 py-1.5 text-sm'
            style={{ borderColor: borderFaint }}
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
            required
            defaultValue={todayISO()}
            className='rounded-md border px-2 py-1.5 text-sm'
            style={{ borderColor: borderFaint }}
          />
        </label>
      </div>

      {/* Row 3: Category + Account */}
      <div className='flex gap-2'>
        <label
          className='flex grow flex-col gap-1 text-xs'
          style={{ color: 'var(--ink)' }}
        >
          Category
          <select
            name='categoryId'
            required
            className='rounded-md border px-2 py-1.5 text-sm'
            style={{ borderColor: borderFaint }}
          >
            <option value=''>Select…</option>
            {expenseCategories.length > 0 && (
              <optgroup label='Expenses'>
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </optgroup>
            )}
            {incomeCategories.length > 0 && (
              <optgroup label='Income'>
                {incomeCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </label>

        <label
          className='flex grow flex-col gap-1 text-xs'
          style={{ color: 'var(--ink)' }}
        >
          Account
          <select
            name='moneyAccountId'
            required
            className='rounded-md border px-2 py-1.5 text-sm'
            style={{ borderColor: borderFaint }}
          >
            <option value=''>Select…</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {accountLabel(a)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Row 4: Payment Method */}
      <label
        className='flex flex-col gap-1 text-xs'
        style={{ color: 'var(--ink)' }}
      >
        Payment Method
        <select
          name='paymentMethod'
          defaultValue='UPI'
          className='rounded-md border px-2 py-1.5 text-sm'
          style={{ borderColor: borderFaint }}
        >
          <option value='UPI'>UPI</option>
          <option value='AUTO_DEBIT'>Auto Debit</option>
          <option value='NEFT'>NEFT</option>
          <option value='CARD'>Card</option>
          <option value='CASH'>Cash</option>
        </select>
      </label>

      {/* Actions */}
      <div className='flex gap-2 pt-1'>
        <button
          type='submit'
          className='rounded-md px-4 py-1.5 text-sm font-medium text-white'
          style={{ backgroundColor: 'var(--emerald)' }}
        >
          Save
        </button>
        <button
          type='button'
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className='px-3 py-1.5 text-sm opacity-60'
          style={{ color: 'var(--ink)' }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
