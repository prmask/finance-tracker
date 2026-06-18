// src/app/(app)/dashboard/page.tsx
import { auth } from '@/auth';
import { getDashboardData } from '@/lib/dashboard';
import { redirect } from 'next/navigation';
import { BalanceStrip } from './_components/balance-strip';
import { CashflowChart } from './_components/cashflow-chart';
import { CategoryBreakdown } from './_components/category-breakdown';
import { RecentTransactions } from './_components/recent-transactions';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const data = await getDashboardData(session.user.id);

  return (
    <div className='space-y-5'>
      {/* Page header */}
      <div>
        <h1 className='font-serif text-2xl text-[var(--ink)]'>Dashboard</h1>
        <p className='font-sans text-sm text-[var(--ink)]/50 mt-0.5'>
          {data.month}
        </p>
      </div>

      {/* Balance strip */}
      <BalanceStrip
        netBalance={data.netBalance}
        totalIncome={data.totalIncome}
        totalExpense={data.totalExpense}
        month={data.month}
      />

      {/* Cash flow chart — full width */}
      <CashflowChart data={data.cashFlowData} month={data.month} />

      {/* Bottom row: category breakdown + recent transactions */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
        <CategoryBreakdown
          categories={data.categoryBreakdown}
          totalExpense={data.totalExpense}
        />
        <RecentTransactions transactions={data.recentTransactions} />
      </div>
    </div>
  );
}

// import { auth, signOut } from '@/auth';

// export default async function DashboardPage() {
//   const session = await auth();

//   return (
//     <main className='min-h-screen bg-paper text-ink p-10'>
//       <h1 className='font-serif text-4xl'>Welcome, {session?.user?.name}</h1>
//       <p className='font-mono mt-2 text-sm text-ink/70'>
//         {session?.user?.email}
//       </p>
//       <form
//         action={async () => {
//           'use server';
//           await signOut({ redirectTo: '/login' });
//         }}
//       >
//         <button
//           type='submit'
//           className='mt-6 px-4 py-2 border border-ink font-mono text-xs hover:bg-ink hover:text-paper'
//         >
//           SIGN OUT
//         </button>
//       </form>
//     </main>
//   );
// }
