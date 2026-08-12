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

    const where: Prisma.RekapZakatWhereInput = search
      ? {
          OR: [
            { dosenNIP: { contains: search } },
            { tahunRekap: { contains: search } },
            { dosen: { nama: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};

    const [rekaps, total] = await Promise.all([
      prisma.rekapZakat.findMany({
        where,
        include: {
          dosen: {
            select: { nama: true, unitKerja: true },
          },
        },
        orderBy: [{ tahunRekap: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.rekapZakat.count({ where }),
    ]);

    const formatted = rekaps.map((r) => ({
      id: r.id,
      dosenNIP: r.dosenNIP,
      dosen: r.dosen,
      tahunRekap: r.tahunRekap,
      fileUrl: r.fileUrl,
      createdAt: new Date(r.createdAt).toLocaleDateString('id-ID'),
    }));

    return NextResponse.json({
      data: formatted,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching rekap zakat:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

