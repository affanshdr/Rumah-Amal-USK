import { auth } from '@/lib/auth';
import { NextRequest } from 'next/server';

export default async function proxy(request: NextRequest) {
    // next-auth's auth function acts as the proxy/middleware handler
    return auth(request as any);
}

export const config = {
    // Jalankan proxy untuk semua route /admin
    matcher: ['/admin/:path*'],
};
