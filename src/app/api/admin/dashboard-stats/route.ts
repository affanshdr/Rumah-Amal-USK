import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/dashboard-stats';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year') || undefined;
        const month = searchParams.get('month') || undefined;

        const stats = await getDashboardStats(year, month);
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats API:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
    }
}
