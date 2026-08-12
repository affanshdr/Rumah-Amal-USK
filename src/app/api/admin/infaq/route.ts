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
        const tab    = searchParams.get('tab') || 'bebas'; // 'bebas' | 'terikat'
        const skip   = (page - 1) * limit;

        // Tab filter
        const tabFilter: Prisma.InfaqWhereInput =
            tab === 'bebas'
                ? { kampanyeId: null }
                : { kampanyeId: { not: null } };

        // Search filter
        const searchFilter: Prisma.InfaqWhereInput = search
            ? {
                OR: [
                    { nama:    { contains: search, mode: 'insensitive' } },
                    { nip:     { contains: search } },
                    { kampanye: { judul: { contains: search, mode: 'insensitive' } } },
                    { dosen:   { nama:   { contains: search, mode: 'insensitive' } } },
                ],
            }
            : {};

        // Full where (includes status filter)
        const whereMain: Prisma.InfaqWhereInput = {
            AND: [tabFilter, searchFilter, status !== 'all' ? { status } : {}],
        };

        // Where without status filter (for per-status counts within current tab + search)
        const whereForStatusCounts: Prisma.InfaqWhereInput = {
            AND: [tabFilter, searchFilter],
        };

        const [
            infaqs, total,
            allCount, pendingCount, lunasCount, ditolakCount,
            bebasCount, terikatCount,
        ] = await Promise.all([
            prisma.infaq.findMany({
                where: whereMain,
                include: { kampanye: true, dosen: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.infaq.count({ where: whereMain }),
            prisma.infaq.count({ where: whereForStatusCounts }),
            prisma.infaq.count({ where: { ...whereForStatusCounts, status: 'pending' } }),
            prisma.infaq.count({ where: { ...whereForStatusCounts, status: 'lunas'   } }),
            prisma.infaq.count({ where: { ...whereForStatusCounts, status: 'ditolak' } }),
            // Tab counts (global, not filtered by search/status)
            prisma.infaq.count({ where: { kampanyeId: null } }),
            prisma.infaq.count({ where: { kampanyeId: { not: null } } }),
        ]);

        const formattedData = infaqs.map(i => ({
            id: i.id,
            nama: i.nama,
            nip: i.nip,
            noHp: i.noHp,
            dosen: i.dosen ? {
                nip:      i.dosen.nip,
                nama:     i.dosen.nama,
                npwp:     i.dosen.npwp,
                alamat:   i.dosen.alamat,
                unitKerja: i.dosen.unitKerja,
                noHp:     i.dosen.noHp,
            } : null,
            tipePembayar:    i.tipePembayar,
            jenisInfaq:      i.kampanye?.judul || i.jenisInfaq,
            kampanyeId:      i.kampanyeId,
            kampanyeJudul:   i.kampanye?.judul || null,
            jumlahInfaq:     i.jumlahInfaq,
            buktiPembayaran: i.buktiPembayaran,
            tanggal: new Date(i.createdAt).toLocaleDateString('id-ID'),
            pesan:   i.pesan || '-',
            status:  i.status,
        }));

        return NextResponse.json({
            data:       formattedData,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            statusCounts: {
                all:     allCount,
                pending: pendingCount,
                lunas:   lunasCount,
                ditolak: ditolakCount,
            },
            tabCounts: {
                bebas:   bebasCount,
                terikat: terikatCount,
            },
        });
    } catch (error) {
        console.error('Error fetching infaq:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
