// src/types/next-auth.d.ts
// With database sessions, NextAuth doesn't put the user id on the
// session by default — we add it in the session callback in auth.ts.
// This file teaches TypeScript that session.user.id exists.

import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}
