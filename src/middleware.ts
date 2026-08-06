import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export default async function middleware(request: NextRequest) {
    return auth(request as any);
}

export const config = {
    // Jalankan proxy untuk semua route /admin
    matcher: ['/admin/:path*'],
};
