import { prisma } from '@/lib/prisma';

export async function getDashboardStats(yearParam?: string, monthParam?: string) {
    const currentYear = new Date().getFullYear().toString();
    const selectedYear = yearParam || currentYear;
    const selectedMonth = monthParam || 'all';

    // Summary cards & recent lists
    const [totalZakat, totalInfaq, pendingZakat, pendingInfaq, riwayatTerbaru, riwayatInfaqTerbaru] =
        await Promise.all([
            prisma.zakat.aggregate({ where: { status: 'lunas' }, _sum: { jumlahZakat: true } }),
            prisma.infaq.aggregate({ where: { status: 'lunas' }, _sum: { jumlahInfaq: true } }),
            prisma.zakat.count({ where: { status: 'pending' } }),
            prisma.infaq.count({ where: { status: 'pending' } }),
            prisma.zakat.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
            prisma.infaq.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { kampanye: true } }),
        ]);

    // Available years from database
    const yearsZakatRaw = await prisma.$queryRaw<{ tahun: string }[]>`
        SELECT DISTINCT TO_CHAR(created_at, 'YYYY') as tahun FROM zakats WHERE created_at IS NOT NULL
    `;
    const yearsInfaqRaw = await prisma.$queryRaw<{ tahun: string }[]>`
        SELECT DISTINCT TO_CHAR(created_at, 'YYYY') as tahun FROM infaqs WHERE created_at IS NOT NULL
    `;

    const yearSet = new Set<string>([
        currentYear,
        ...yearsZakatRaw.map(r => r.tahun).filter(Boolean),
        ...yearsInfaqRaw.map(r => r.tahun).filter(Boolean),
    ]);
    const availableYears = Array.from(yearSet).sort((a, b) => parseInt(b) - parseInt(a));

    // Determine date boundaries
    let startDate: Date;
    let endDate: Date;
    const is6Months = selectedYear === '6m';

    if (is6Months) {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
    } else {
        const yNum = parseInt(selectedYear) || parseInt(currentYear);
        startDate = new Date(Date.UTC(yNum, 0, 1, 0, 0, 0));
        endDate = new Date(Date.UTC(yNum, 11, 31, 23, 59, 59, 999));
    }

    // Pie chart date filter (can be month-specific within the selected year)
    let pieWhereDate: { createdAt?: { gte?: Date; lte?: Date } } = {};
    if (is6Months) {
        pieWhereDate = { createdAt: { gte: startDate, lte: endDate } };
    } else {
        const yNum = parseInt(selectedYear) || parseInt(currentYear);
        if (selectedMonth && selectedMonth !== 'all') {
            const mNum = parseInt(selectedMonth) - 1;
            const mStart = new Date(Date.UTC(yNum, mNum, 1, 0, 0, 0));
            const mEnd = new Date(Date.UTC(yNum, mNum + 1, 0, 23, 59, 59, 999));
            pieWhereDate = { createdAt: { gte: mStart, lte: mEnd } };
        } else {
            pieWhereDate = { createdAt: { gte: startDate, lte: endDate } };
        }
    }

    // Monthly raw aggregation
    const [grafikBulananRaw, grafikBulananInfaqRaw, grafikJenisRaw, grafikJenisInfaqRaw] = await Promise.all([
        prisma.$queryRaw<{ bulan: string; total: bigint | number }[]>`
            SELECT TO_CHAR(created_at, 'YYYY-MM') as bulan, SUM(jumlah_zakat) as total
            FROM zakats
            WHERE status = 'lunas' AND created_at >= ${startDate} AND created_at <= ${endDate}
            GROUP BY bulan
            ORDER BY bulan ASC
        `,
        prisma.$queryRaw<{ bulan: string; total: bigint | number }[]>`
            SELECT TO_CHAR(created_at, 'YYYY-MM') as bulan, SUM(jumlah_infaq) as total
            FROM infaqs
            WHERE status = 'lunas' AND created_at >= ${startDate} AND created_at <= ${endDate}
            GROUP BY bulan
            ORDER BY bulan ASC
        `,
        prisma.zakat.groupBy({
            by: ['jenisZakat'],
            where: { status: 'lunas', ...pieWhereDate },
            _sum: { jumlahZakat: true },
        }),
        prisma.infaq.groupBy({
            by: ['jenisInfaq'],
            where: { status: 'lunas', ...pieWhereDate },
            _sum: { jumlahInfaq: true },
        }),
    ]);

    // Format monthly data
    let formattedGrafikBulanan: { bulan: string; total: number }[] = [];
    let formattedGrafikBulananInfaq: { bulan: string; total: number }[] = [];

    if (!is6Months) {
        const yNum = selectedYear;
        const monthsList = Array.from({ length: 12 }, (_, i) => {
            const m = String(i + 1).padStart(2, '0');
            return `${yNum}-${m}`;
        });
        const zakatMap = new Map(grafikBulananRaw.map(item => [item.bulan, Number(item.total)]));
        const infaqMap = new Map(grafikBulananInfaqRaw.map(item => [item.bulan, Number(item.total)]));

        formattedGrafikBulanan = monthsList.map(bulan => ({
            bulan,
            total: zakatMap.get(bulan) || 0,
        }));
        formattedGrafikBulananInfaq = monthsList.map(bulan => ({
            bulan,
            total: infaqMap.get(bulan) || 0,
        }));
    } else {
        formattedGrafikBulanan = grafikBulananRaw.map(item => ({
            bulan: item.bulan,
            total: Number(item.total),
        }));
        formattedGrafikBulananInfaq = grafikBulananInfaqRaw.map(item => ({
            bulan: item.bulan,
            total: Number(item.total),
        }));
    }

    return {
        selectedYear,
        selectedMonth,
        availableYears,
        totalZakat: Number(totalZakat._sum.jumlahZakat ?? 0),
        totalInfaq: Number(totalInfaq._sum.jumlahInfaq ?? 0),
        pendingZakat,
        pendingInfaq,
        riwayatTerbaru: riwayatTerbaru.map(z => ({
            id: z.id,
            nama: z.nama,
            jenisZakat: z.jenisZakat,
            jumlahZakat: z.jumlahZakat,
            status: z.status,
            createdAt: z.createdAt,
        })),
        riwayatInfaqTerbaru: riwayatInfaqTerbaru.map(i => ({
            id: i.id,
            nama: i.nama,
            jenisInfaq: i.kampanye?.judul || i.jenisInfaq,
            jumlahInfaq: i.jumlahInfaq,
            status: i.status,
            createdAt: i.createdAt,
        })),
        grafikBulanan: formattedGrafikBulanan,
        grafikJenis: grafikJenisRaw.map(item => ({
            jenis: item.jenisZakat,
            total: Number(item._sum.jumlahZakat ?? 0),
        })),
        grafikBulananInfaq: formattedGrafikBulananInfaq,
        grafikJenisInfaq: grafikJenisInfaqRaw.map(item => ({
            jenis: item.jenisInfaq,
            total: Number(item._sum.jumlahInfaq ?? 0),
        })),
    };
}