import { NextResponse, NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
    // TEMPORARY: Commented out auth check for easy admin page review
    // return auth(request as any);
    return NextResponse.next();
}

export const config = {
    // Jalankan proxy untuk semua route /admin
    matcher: ['/admin/:path*'],
};
