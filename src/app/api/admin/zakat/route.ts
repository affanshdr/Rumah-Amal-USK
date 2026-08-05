import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const zakats = await prisma.zakat.findMany({
            include: {
                dosen: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedData = zakats.map(z => ({
            id: z.id,
            nama: z.nama,
            nip: z.nip,
            dosen: z.dosen ? {
                nip: z.dosen.nip,
                nama: z.dosen.nama,
                npwp: z.dosen.npwp,
                alamat: z.dosen.alamat,
                unitKerja: z.dosen.unitKerja,
            } : null,
            tipePembayar: z.tipePembayar,
            jenisZakat: z.jenisZakat,
            sumberDana: z.sumberDana,
            jenisPerusahaan: z.jenisPerusahaan,
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
