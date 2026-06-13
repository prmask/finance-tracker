// src/app/(app)/categories/category-manager.tsx
// Client component. Calls the Server Actions and surfaces their errors.
// Uses the Paisaa tokens (--ink, --paper, --emerald, --sienna) directly
// so it works regardless of how Tailwind utilities are named.

'use client';

import { useState, useTransition } from 'react';
import { createCategory, deleteCategory, updateCategory } from './actions';

type Category = {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  type: 'INCOME' | 'EXPENSE';
  isDefault: boolean;
};

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const expenses = categories.filter((c) => c.type === 'EXPENSE');
  const income = categories.filter((c) => c.type === 'INCOME');

  async function handleCreate(formData: FormData) {
    setError(null);
    const res = await createCategory(formData);
    if (res.error) setError(res.error);
  }

  async function handleUpdate(formData: FormData) {
    setError(null);
    const res = await updateCategory(formData);
    if (res.error) setError(res.error);
    else setEditingId(null);
  }

  function handleDelete(cat: Category) {
    if (!confirm(`Delete “${cat.name}”?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteCategory(cat.id);
      if (res.error) setError(res.error);
    });
  }

  return (
    <div className='space-y-8'>
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
        style={{
          borderColor: 'color-mix(in srgb, var(--ink) 15%, transparent)',
        }}
      >
        <label
          className='flex flex-col gap-1 text-xs'
          style={{ color: 'var(--ink)' }}
        >
          Emoji
          <input
            name='emoji'
            placeholder='🪔'
            maxLength={4}
            className='w-16 rounded-md border px-2 py-1.5 text-center'
            style={{
              borderColor: 'color-mix(in srgb, var(--ink) 20%, transparent)',
            }}
          />
        </label>
        <label
          className='flex grow flex-col gap-1 text-xs'
          style={{ color: 'var(--ink)' }}
        >
          Name
          <input
            name='name'
            required
            maxLength={40}
            placeholder='e.g. Mobile Recharge'
            className='rounded-md border px-2 py-1.5'
            style={{
              borderColor: 'color-mix(in srgb, var(--ink) 20%, transparent)',
            }}
          />
        </label>
        <label
          className='flex flex-col gap-1 text-xs'
          style={{ color: 'var(--ink)' }}
        >
          Type
          <select
            name='type'
            defaultValue='EXPENSE'
            className='rounded-md border px-2 py-1.5'
            style={{
              borderColor: 'color-mix(in srgb, var(--ink) 20%, transparent)',
            }}
          >
            <option value='EXPENSE'>Expense</option>
            <option value='INCOME'>Income</option>
          </select>
        </label>
        <button
          type='submit'
          className='rounded-md px-4 py-1.5 text-sm font-medium text-white'
          style={{ backgroundColor: 'var(--emerald)' }}
        >
          Add
        </button>
      </form>

      {/* ── Lists ────────────────────────────── */}
      <Section title='Expenses' items={expenses} />
      <Section title='Income' items={income} />
    </div>
  );

  function Section({ title, items }: { title: string; items: Category[] }) {
    return (
      <section>
        <h2
          className='mb-2 text-xs font-semibold uppercase tracking-wider opacity-60'
          style={{ color: 'var(--ink)' }}
        >
          {title}
        </h2>
        <ul
          className='divide-y rounded-lg border'
          style={{
            borderColor: 'color-mix(in srgb, var(--ink) 12%, transparent)',
          }}
        >
          {items.length === 0 && (
            <li
              className='px-3 py-3 text-sm opacity-60'
              style={{ color: 'var(--ink)' }}
            >
              No categories yet.
            </li>
          )}
          {items.map((cat) =>
            editingId === cat.id ? (
              <li key={cat.id} className='px-3 py-2'>
                <form action={handleUpdate} className='flex items-center gap-2'>
                  <input type='hidden' name='id' value={cat.id} />
                  <input type='hidden' name='type' value={cat.type} />
                  <input
                    name='emoji'
                    defaultValue={cat.emoji ?? ''}
                    maxLength={4}
                    className='w-12 rounded-md border px-1 py-1 text-center text-sm'
                  />
                  <input
                    name='name'
                    defaultValue={cat.name}
                    required
                    maxLength={40}
                    className='grow rounded-md border px-2 py-1 text-sm'
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
                    className='px-2 py-1 text-xs opacity-70'
                    style={{ color: 'var(--ink)' }}
                  >
                    Cancel
                  </button>
                </form>
              </li>
            ) : (
              <li key={cat.id} className='flex items-center gap-3 px-3 py-2.5'>
                <span className='w-7 text-center text-lg'>
                  {cat.emoji ?? '•'}
                </span>
                <span className='grow text-sm' style={{ color: 'var(--ink)' }}>
                  {cat.name}
                </span>
                {cat.isDefault && (
                  <span
                    className='rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide opacity-60'
                    style={{ color: 'var(--ink)' }}
                  >
                    default
                  </span>
                )}
                <button
                  onClick={() => setEditingId(cat.id)}
                  className='px-2 py-1 text-xs opacity-70 hover:opacity-100'
                  style={{ color: 'var(--ink)' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  disabled={isPending}
                  className='px-2 py-1 text-xs hover:opacity-100'
                  style={{ color: 'var(--sienna)' }}
                >
                  Delete
                </button>
              </li>
            ),
          )}
        </ul>
      </section>
    );
  }
}
