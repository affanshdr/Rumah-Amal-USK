import { auth } from '@/lib/auth';
import { NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
    // next-auth's auth function acts as the middleware handler
    return auth(request as any);
}

export const config = {
    // Jalankan proxy untuk semua route /admin
    matcher: ['/admin/:path*'],
};
