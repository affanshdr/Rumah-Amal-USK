import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const zakats = await prisma.zakat.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Format data agar sesuai dengan frontend (AdminZakatPage)
        const formattedData = zakats.map(z => ({
            id: z.id,
            nama: z.nama,
            nip: z.nip,
            tipePembayar: z.tipePembayar,
            jenisZakat: z.jenisZakat,
            jumlahZakat: z.jumlahZakat,
            buktiPembayaran: z.buktiPembayaran,
            tanggal: new Date(z.createdAt).toLocaleDateString('id-ID'),
            pesan: z.pesan || '-',
            status: z.status
        }));

        return NextResponse.json(formattedData);
    } catch (error) {
        console.error("Error fetching zakat:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
