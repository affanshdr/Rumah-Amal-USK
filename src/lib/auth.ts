import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// Kredensial admin HARUS diatur di file .env (ADMIN_EMAIL dan ADMIN_PASSWORD_HASH).
// Untuk generate hash password: node -e "console.log(require('bcryptjs').hashSync('password_kamu', 10))"

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
        const inputPassword = credentials.password as string;

        // Email dan hash password wajib ada di .env
        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminEmail || !adminPasswordHash) {
          console.error('ADMIN_EMAIL atau ADMIN_PASSWORD_HASH tidak dikonfigurasi di .env');
          return null;
        }

        // Cek email
        if (inputEmail !== adminEmail) {
          return null;
        }

        // Verifikasi password menggunakan bcrypt (HANYA bcrypt, tidak ada plaintext fallback)
        const isPasswordValid = await bcrypt.compare(inputPassword, adminPasswordHash);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: 'admin',
          email: adminEmail,
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
