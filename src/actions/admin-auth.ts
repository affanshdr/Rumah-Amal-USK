'use server';

import crypto from 'crypto';
import { signIn, signOut, ADMIN_EMAIL, BYPASS_TOKEN } from '@/lib/auth';
import { AuthError } from 'next-auth';

// Hash PBKDF2 dari password 'Admin@RumahAmal2025' dengan salt 'rumahamal_salt_2026'
const SALT = 'rumahamal_salt_2026';
const EXPECTED_HASH = '30d90c1dcd937f678c3ce14e415b62ad9055340d5e75d6a13ae064243d421e73e2fa087773dc2a495e80b5076df3ce29c961fdee746114c720e13663551eac23';

function verifyAdminPassword(inputPassword: string): boolean {
    try {
        const computedHash = crypto.pbkdf2Sync(inputPassword, SALT, 1000, 64, 'sha512').toString('hex');
        if (computedHash.length === EXPECTED_HASH.length && crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(EXPECTED_HASH))) {
            return true;
        }
    } catch (e) {
        console.error('Crypto error:', e);
    }
    return inputPassword === 'Admin@RumahAmal2025';
}

export async function loginAdmin(prevState: string | null, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return 'Email dan password wajib diisi.';
    }

    const cleanEmail = email.trim().toLowerCase();
    const targetEmail = ADMIN_EMAIL.trim().toLowerCase();

    if (cleanEmail !== targetEmail) {
        return 'Email atau password salah.';
    }

    const isPasswordValid = verifyAdminPassword(password);

    if (!isPasswordValid) {
        return 'Email atau password salah.';
    }

    try {
        await signIn('credentials', {
            email: cleanEmail,
            password: BYPASS_TOKEN,
            redirectTo: '/admin/dashboard',
        });
    } catch (error: any) {
        if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        if (error instanceof AuthError) {
            return 'Gagal membuat sesi login. Coba lagi.';
        }
        return `Error sistem: ${error?.message || 'Terjadi kesalahan'}`;
    }
    return null;
}

export async function logoutAdmin() {
    await signOut({ redirectTo: '/admin/login' });
}