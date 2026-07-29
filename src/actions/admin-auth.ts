'use server';

import { signIn, signOut } from '@/lib/auth';
import { AuthError } from 'next-auth';

export async function loginAdmin(prevState: string | null, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return 'Email dan password wajib diisi.';
    }

    try {
        await signIn('credentials', {
            email,
            password,
            redirectTo: '/admin/dashboard',
        });
        return null;
    } catch (error) {
        if (error instanceof AuthError) {
            return 'Email atau password salah.';
        }
        throw error; // redirect internal NextAuth, harus dilempar ulang
    }
}

export async function logoutAdmin() {
    await signOut({ redirectTo: '/admin/login' });
}