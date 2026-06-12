import { auth, signIn } from '@/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect('/dashboard');

  return (
    <main className='min-h-screen bg-paper text-ink flex item-center justify-center'>
      <div className='text-center'>
        <h1 className='font-serif text-6xl'>Paisaa</h1>
        <p className='mt-2 text-ink/70'>
          Indian-first personal finance tracker
        </p>
        <form
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/dashboard' });
          }}
        >
          <button
            type='submit'
            className='mt-4 px-6 py-3 bg-ink text-paper font-mono text-sm tracking-wide hover:opacity-90'
          >
            CONTINUE WITH GOOGLE
          </button>
        </form>
      </div>
    </main>
  );
}
