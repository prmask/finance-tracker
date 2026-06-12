import { auth, signOut } from '@/auth';

export default async function DashboardPage() {
  const session = await auth();

  return (
    <main className='min-h-screen bg-paper text-ink p-10'>
      <h1 className='font-serif text-4xl'>Welcome, {session?.user?.name}</h1>
      <p className='font-mono mt-2 text-sm text-ink/70'>
        {session?.user?.email}
      </p>
      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/login' });
        }}
      >
        <button
          type='submit'
          className='mt-6 px-4 py-2 border border-ink font-mono text-xs hover:bg-ink hover:text-paper'
        >
          SIGN OUT
        </button>
      </form>
    </main>
  );
}
