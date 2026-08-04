import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// Kredensial admin dibaca dari environment variable, bukan dari database.
// ADMIN_EMAIL dan ADMIN_PASSWORD_HASH harus diset di .env.local
// Untuk membuat hash: bcrypt.hashSync('password_anda', 10)

export const { handlers, auth, signIn, signOut } = NextAuth({
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

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

        console.log('--- DEBUG LOGIN ---');
        console.log('Email diketik:', credentials.email);
        console.log('Email di env:', adminEmail);
        console.log('Password Hash di env:', adminPasswordHash ? 'Ada' : 'Kosong');

        if (!adminEmail || !adminPasswordHash) {
          console.error('ADMIN_EMAIL atau ADMIN_PASSWORD_HASH belum diset di .env.local');
          return null;
        }

        // Cek email cocok
        if (credentials.email !== adminEmail) {
          console.log('=> Email tidak cocok');
          return null;
        }

        // Verifikasi password dengan bcrypt hash
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          adminPasswordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: 'admin',
          email: adminEmail,
          name: 'Admin',
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
          // Kalau sudah login dan mencoba ke halaman login, redirect ke dashboard
          return Response.redirect(new URL('/admin/dashboard', nextUrl));
        }
        return true; // Izinkan akses ke halaman login
      }

      if (isAdminRoute) {
        if (isLoggedIn) return true; // Izinkan akses jika sudah login
        return false; // Redirect ke halaman login jika belum login
      }

      return true; // Izinkan route publik lainnya
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
    maxAge: 2 * 60 * 60, // Sesi akan otomatis kadaluarsa dalam 2 jam
  },
});
