import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const infaqs = await prisma.infaq.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const formattedData = infaqs.map(i => ({
            id: i.id,
            nama: i.nama,
            nip: i.nip,
            tipePembayar: i.tipePembayar,
            jenisInfaq: i.jenisInfaq,
            jumlahInfaq: i.jumlahInfaq,
            buktiPembayaran: i.buktiPembayaran,
            tanggal: new Date(i.createdAt).toLocaleDateString('id-ID'),
            pesan: i.pesan || '-',
            status: i.status
        }));

        return NextResponse.json(formattedData);
    } catch (error) {
        console.error("Error fetching infaq:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
