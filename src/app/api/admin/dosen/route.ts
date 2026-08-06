import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const dosens = await prisma.dosen.findMany({
      orderBy: { nama: 'asc' },
    });
    return NextResponse.json(dosens);
  } catch (error) {
    console.error('Error fetching dosens:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
