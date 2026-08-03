import { prisma } from '@/lib/prisma';

export async function getDashboardStats() {
    const [totalZakat, totalInfaq, pendingZakat, pendingInfaq, riwayatTerbaru] =
        await Promise.all([
            prisma.zakat.aggregate({ where: { status: 'lunas' }, _sum: { jumlahZakat: true } }),
            prisma.infaq.aggregate({ where: { status: 'lunas' }, _sum: { jumlahInfaq: true } }),
            prisma.zakat.count({ where: { status: 'pending' } }),
            prisma.infaq.count({ where: { status: 'pending' } }),
            prisma.zakat.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
        ]);

    const enamBulanLalu = new Date();
    enamBulanLalu.setMonth(enamBulanLalu.getMonth() - 6);

    // PostgreSQL: pakai TO_CHAR, bukan DATE_FORMAT (itu khusus MySQL)
    const grafikBulananRaw = await prisma.$queryRaw<{ bulan: string; total: bigint | number }[]>`
    SELECT TO_CHAR(created_at, 'YYYY-MM') as bulan, SUM(jumlah_zakat) as total
    FROM zakats
    WHERE status = 'lunas' AND created_at >= ${enamBulanLalu}
    GROUP BY bulan
    ORDER BY bulan ASC
  `;

    const grafikJenisRaw = await prisma.zakat.groupBy({
        by: ['jenisZakat'],
        where: { status: 'lunas' },
        _sum: { jumlahZakat: true },
    });

    return {
        totalZakat: Number(totalZakat._sum.jumlahZakat ?? 0),
        totalInfaq: Number(totalInfaq._sum.jumlahInfaq ?? 0),
        pendingZakat,
        pendingInfaq,
        riwayatTerbaru,
        grafikBulanan: grafikBulananRaw.map((item: any) => ({ bulan: item.bulan, total: Number(item.total) })),
        grafikJenis: grafikJenisRaw.map((item: any) => ({ jenis: item.jenisZakat, total: Number(item._sum.jumlahZakat ?? 0) })),
    };
}