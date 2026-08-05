import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const infaqs = await prisma.infaq.findMany({
            include: {
                kampanye: true,
                dosen: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedData = infaqs.map(i => ({
            id: i.id,
            nama: i.nama,
            nip: i.nip,
            dosen: i.dosen ? {
                nip: i.dosen.nip,
                nama: i.dosen.nama,
                npwp: i.dosen.npwp,
                alamat: i.dosen.alamat,
                unitKerja: i.dosen.unitKerja,
            } : null,
            tipePembayar: i.tipePembayar,
            jenisInfaq: i.jenisInfaq,
            kampanyeId: i.kampanyeId,
            kampanyeJudul: i.kampanye?.judul || null,
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
