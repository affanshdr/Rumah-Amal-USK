import { NextResponse, NextRequest } from 'next/server';

// TEMPORARY BYPASS: Auth check commented out to allow checking admin pages without login
export default async function middleware(request: NextRequest) {
    return NextResponse.next();
}

export const config = {
    // Jalankan proxy untuk semua route /admin
    matcher: ['/admin/:path*'],
};
