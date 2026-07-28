'use server';

import { prisma } from '@/lib/prisma';

export async function cariRiwayat(nip: string) {
  const riwayatZakat = await prisma.zakat.findMany({
    where: { nip },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      jenisZakat: true,
      jumlahZakat: true,
      status: true,
      createdAt: true,
    },
  });

  const riwayatInfaq = await prisma.infaq.findMany({
    where: { nip },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      jenisInfaq: true,
      jumlahInfaq: true,
      status: true,
      createdAt: true,
    },
  });

  // Ambil nama dari zakat/infaq pertama yang ditemukan
  const zakatWithNama = await prisma.zakat.findFirst({
    where: { nip },
    select: { nama: true },
  });

  const infaqWithNama = await prisma.infaq.findFirst({
    where: { nip },
    select: { nama: true },
  });

  const nama = zakatWithNama?.nama || infaqWithNama?.nama;

  return {
    nip,
    nama,
    riwayatZakat: riwayatZakat.map((z) => ({
      id: z.id,
      jenis_zakat: z.jenisZakat,
      jumlah_zakat: z.jumlahZakat,
      status: z.status as 'pending' | 'lunas' | 'ditolak',
      created_at: z.createdAt,
    })),
    riwayatInfaq: riwayatInfaq.map((i) => ({
      id: i.id,
      jenis_infaq: i.jenisInfaq,
      jumlah_infaq: i.jumlahInfaq,
      status: i.status as 'pending' | 'lunas' | 'ditolak',
      created_at: i.createdAt,
    })),
  };
}
