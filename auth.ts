import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'Admin Login',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? '')
          .trim()
          .toLowerCase();

        const password = String(credentials?.password ?? '');

        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD ?? '';

        if (!adminEmail || !adminPassword) {
          return null;
        }

        if (email !== adminEmail || password !== adminPassword) {
          return null;
        }

        return {
          id: 'admin',
          email: adminEmail,
          name: 'NURANICO Admin',
        };
      },
    }),
  ],

  pages: {
    signIn: '/admin/login',
  },

  session: {
    strategy: 'jwt',
  },
});
