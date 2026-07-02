// src/app/(app)/recurring/add-recurring-form.tsx
'use client';

import { useState } from 'react';
import { createRecurringRule } from './actions';

type Category = { id: string; name: string; emoji: string | null; type: string };
type Account = { id: string; name: string; last4: string | null };

function accountLabel(acc: Account) {
  return acc.last4 ? `${acc.name} ····${acc.last4}` : acc.name;
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function AddRecurringForm({
  categories,
  accounts,
}: {
  categories: Category[];
  accounts: Account[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const res = await createRecurringRule(formData);
    if (res.error) setError(res.error);
    else setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className='w-full rounded-lg border-2 border-dashed border-[var(--emerald)] py-3 text-sm font-medium text-[var(--emerald)] transition-opacity hover:opacity-80'
      >
        + Add Recurring Rule
      </button>
    );
  }

  return (
    <form
      action={handleSubmit}
      className='space-y-3 rounded-xl border border-[var(--ink)]/10 bg-white p-4'
    >
      <h2 className='text-sm font-semibold text-[var(--ink)]'>
        New Recurring Rule
      </h2>

      {error && (
        <p className='rounded-md border border-[var(--sienna)] px-3 py-2 text-xs text-[var(--sienna)]'>
          {error}
        </p>
      )}

      <div className='flex gap-2'>
        <label className='flex grow flex-col gap-1 text-xs text-[var(--ink)]'>
          Name
          <input
            name='name'
            required
            maxLength={60}
            placeholder='Nifty 50 SIP, Netflix…'
            className='rounded-md border border-[var(--ink)]/20 px-2 py-1.5 text-sm'
          />
        </label>
        <label className='flex flex-col gap-1 text-xs text-[var(--ink)]'>
          Amount (₹)
          <input
            name='amount'
            type='number'
            min='0.01'
            step='0.01'
            required
            placeholder='0.00'
            className='w-32 rounded-md border border-[var(--ink)]/20 px-2 py-1.5 text-sm'
          />
        </label>
      </div>

      <div className='flex gap-2'>
        <label className='flex flex-col gap-1 text-xs text-[var(--ink)]'>
          Kind
          <select
            name='kind'
            defaultValue='EXPENSE'
            className='rounded-md border border-[var(--ink)]/20 px-2 py-1.5 text-sm'
          >
            <option value='EXPENSE'>Expense (auto-debit)</option>
            <option value='INVESTMENT'>Investment (SIP)</option>
          </select>
        </label>
        <label className='flex flex-col gap-1 text-xs text-[var(--ink)]'>
          Frequency
          <select
            name='frequency'
            defaultValue='MONTHLY'
            className='rounded-md border border-[var(--ink)]/20 px-2 py-1.5 text-sm'
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
            required
            defaultValue={todayISO()}
            className='rounded-md border border-[var(--ink)]/20 px-2 py-1.5 text-sm'
          />
        </label>
      </div>

      <div className='flex gap-2'>
        <label className='flex grow flex-col gap-1 text-xs text-[var(--ink)]'>
          Category
          <select
            name='categoryId'
            required
            className='rounded-md border border-[var(--ink)]/20 px-2 py-1.5 text-sm'
          >
            <option value=''>Select…</option>
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
            required
            className='rounded-md border border-[var(--ink)]/20 px-2 py-1.5 text-sm'
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

      <label className='flex items-center gap-2 text-xs text-[var(--ink)]'>
        <input type='checkbox' name='isActive' defaultChecked />
        Active
      </label>

      <div className='flex gap-2 pt-1'>
        <button
          type='submit'
          className='rounded-md bg-[var(--emerald)] px-4 py-1.5 text-sm font-medium text-white'
        >
          Save
        </button>
        <button
          type='button'
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className='px-3 py-1.5 text-sm text-[var(--ink)] opacity-60'
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
