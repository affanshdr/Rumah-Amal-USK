import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page   = Math.max(1, parseInt(searchParams.get('page')  || '1'));
        const limit  = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20')));
        const search = searchParams.get('search')?.trim() || '';
        const status = searchParams.get('status') || 'all';
        const jenis  = (searchParams.get('jenisZakat') || searchParams.get('jenis') || 'all').trim();
        const skip   = (page - 1) * limit;

        // Search filter
        const searchFilter: Prisma.ZakatWhereInput = search
            ? {
                OR: [
                    { nama: { contains: search, mode: 'insensitive' } },
                    { nip:  { contains: search } },
                    { dosen: { nama: { contains: search, mode: 'insensitive' } } },
                ],
            }
            : {};

        // Jenis filter
        const jenisFilter: Prisma.ZakatWhereInput =
            jenis && jenis !== 'all'
                ? { jenisZakat: { equals: jenis, mode: 'insensitive' } }
                : {};

        // Full where (includes status filter for main query)
        const whereMain: Prisma.ZakatWhereInput = {
            AND: [
                searchFilter,
                jenisFilter,
                status !== 'all' ? { status } : {},
            ],
        };

        // Where without status filter (for per-status counts)
        const whereForCounts: Prisma.ZakatWhereInput = {
            AND: [
                searchFilter,
                jenisFilter,
            ],
        };

        const [zakats, total, allCount, pendingCount, lunasCount, ditolakCount, distinctJenis] = await Promise.all([
            prisma.zakat.findMany({
                where: whereMain,
                include: { dosen: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.zakat.count({ where: whereMain }),
            prisma.zakat.count({ where: whereForCounts }),
            prisma.zakat.count({ where: { ...whereForCounts, status: 'pending' } }),
            prisma.zakat.count({ where: { ...whereForCounts, status: 'lunas'   } }),
            prisma.zakat.count({ where: { ...whereForCounts, status: 'ditolak' } }),
            prisma.zakat.findMany({
                select: { jenisZakat: true },
                distinct: ['jenisZakat'],
                where: { jenisZakat: { not: '' } },
                orderBy: { jenisZakat: 'asc' },
            }),
        ]);

        const standardJenis = ['maal', 'profesi', 'emas', 'perniagaan', 'perusahaan', 'fitrah'];
        const allJenisSet = new Set<string>([
            ...standardJenis,
            ...distinctJenis.map(d => d.jenisZakat?.trim().toLowerCase()).filter(Boolean),
        ]);
        const availableJenis = Array.from(allJenisSet);

        const formattedData = zakats.map(z => ({
            id: z.id,
            nama: z.nama,
            nip: z.nip,
            noHp: z.noHp,
            dosen: z.dosen ? {
                nip:      z.dosen.nip,
                nama:     z.dosen.nama,
                npwp:     z.dosen.npwp,
                alamat:   z.dosen.alamat,
                unitKerja: z.dosen.unitKerja,
                noHp:     z.dosen.noHp,
            } : null,
            tipePembayar:    z.tipePembayar,
            jenisZakat:      z.jenisZakat,
            sumberDana:      z.sumberDana,
            jenisPerusahaan: z.jenisPerusahaan,
            jumlahZakat:     z.jumlahZakat,
            buktiPembayaran: z.buktiPembayaran,
            tanggal: new Date(z.createdAt).toLocaleDateString('id-ID'),
            pesan:   z.pesan || '-',
            status:  z.status,
        }));

        return NextResponse.json({
            data:       formattedData,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            counts: {
                all:     allCount,
                pending: pendingCount,
                lunas:   lunasCount,
                ditolak: ditolakCount,
            },
            availableJenis,
        });
    } catch (error) {
        console.error('Error fetching zakat:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

