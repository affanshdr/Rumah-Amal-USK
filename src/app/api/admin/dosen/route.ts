import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20')));
    const search = searchParams.get('search')?.trim() || '';
    const skip = (page - 1) * limit;

    const where: Prisma.DosenWhereInput = search
      ? {
          OR: [
            { nama: { contains: search, mode: 'insensitive' } },
            { nip: { contains: search } },
            { idDonatur: { contains: search, mode: 'insensitive' } },
            { unitKerja: { contains: search, mode: 'insensitive' } },
            { noHp: { contains: search } },
          ],
        }
      : {};

    const [dosens, total] = await Promise.all([
      prisma.dosen.findMany({
        where,
        orderBy: { nama: 'asc' },
        skip,
        take: limit,
      }),
      prisma.dosen.count({ where }),
    ]);

    return NextResponse.json({
      data: dosens,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching dosens:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

