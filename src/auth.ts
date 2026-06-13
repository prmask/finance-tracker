import { seedDefaultCategories } from '@/lib/default-categories';
import { prisma } from '@/lib/prisma';
import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  callbacks: {
    // With database sessions, user.id isn't on the session by default.
    // Server Actions need it, so we attach it here.
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  events: {
    // Fires exactly once, when the Prisma adapter inserts a new User row.
    // Subsequent logins of the same user never trigger it.
    async createUser({ user }) {
      if (user.id) await seedDefaultCategories(user.id);
    },
  },
  pages: {
    signIn: '/login',
  },
});
