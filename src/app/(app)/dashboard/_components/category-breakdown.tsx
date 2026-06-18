// src/app/(app)/dashboard/_components/category-breakdown.tsx

interface Category {
  name: string;
  icon: string;
  total: number;
  color: string;
}

interface Props {
  categories: Category[];
  totalExpense: number;
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function CategoryBreakdown({ categories, totalExpense }: Props) {
  return (
    <div className='rounded-xl border border-[var(--ink)]/10 bg-white p-5'>
      <p className='font-sans text-xs uppercase tracking-widest text-[var(--ink)]/50 mb-4'>
        Spending by Category
      </p>

      {categories.length === 0 ? (
        <p className='font-sans text-sm text-[var(--ink)]/30 py-6 text-center'>
          No expense data yet.
        </p>
      ) : (
        <ul className='space-y-3'>
          {categories.map((cat) => {
            const pct = totalExpense > 0 ? (cat.total / totalExpense) * 100 : 0;
            return (
              <li key={cat.name}>
                <div className='flex items-center justify-between mb-1'>
                  <div className='flex items-center gap-2'>
                    <span className='text-base leading-none'>{cat.icon}</span>
                    <span className='font-sans text-sm text-[var(--ink)]'>
                      {cat.name}
                    </span>
                  </div>
                  <span className='font-mono text-sm text-[var(--sienna)]'>
                    {fmt(cat.total)}
                  </span>
                </div>
                <div className='h-1.5 rounded-full bg-[var(--ink)]/5'>
                  <div
                    className='h-1.5 rounded-full transition-all'
                    style={{
                      width: `${pct}%`,
                      backgroundColor: cat.color || 'var(--sienna)',
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
