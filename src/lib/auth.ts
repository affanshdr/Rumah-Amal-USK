import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// Kredensial admin — verifikasi bcrypt dilakukan di server action (bukan di sini)
// karena NextAuth v5 beta + Turbopack menjalankan authorize di Edge runtime yang
// tidak mendukung bcryptjs dengan benar.
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@rumahamal.usk.ac.id';
export const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ?? '$2b$10$m8/TJG5mmVkIWNbVTlvjdOLnDCm4uwbTT4oTLzUaWP8ffvoSO9aEq';
export const BYPASS_TOKEN = (process.env.AUTH_SECRET ?? 'rumah-amal-usk-secret-key-2026') + '_verified_bypass_2026';

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const inputEmail = (credentials.email as string).trim().toLowerCase();
        const inputToken = credentials.password as string;

        // Cek email
        if (inputEmail !== ADMIN_EMAIL.trim().toLowerCase()) {
          return null;
        }

        // Verifikasi bypass token — password hashing dilakukan di server action
        if (inputToken !== BYPASS_TOKEN) {
          return null;
        }

        return {
          id: 'admin',
          email: ADMIN_EMAIL,
          name: 'Admin Rumah Amal',
          role: 'admin',
        };
      },
    }),
  ],
  callbacks: {
    authorized({ request: { nextUrl }, auth }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith('/admin');
      const isLoginRoute = nextUrl.pathname === '/admin/login';

      if (isLoginRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL('/admin/dashboard', nextUrl));
        }
        return true;
      }

      if (isAdminRoute) {
        return isLoggedIn;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.sub as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 2 * 60 * 60, // 2 jam
  },
});
