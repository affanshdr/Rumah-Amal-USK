import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rekaps = await prisma.rekapZakat.findMany({
      include: {
        dosen: {
          select: { nama: true, unitKerja: true },
        },
      },
      orderBy: [{ tahunRekap: 'desc' }, { createdAt: 'desc' }],
    });

    const formatted = rekaps.map((r) => ({
      id: r.id,
      dosenNIP: r.dosenNIP,
      dosen: r.dosen,
      tahunRekap: r.tahunRekap,
      fileUrl: r.fileUrl,
      createdAt: new Date(r.createdAt).toLocaleDateString('id-ID'),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching rekap zakat:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
