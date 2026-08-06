'use server';

import { prisma } from '@/lib/prisma';

export async function cariRiwayat(nip: string) {
  const cleanNip = nip.trim();

  const dosen = await prisma.dosen.findUnique({
    where: { nip: cleanNip },
  });

  const riwayatZakat = await prisma.zakat.findMany({
    where: { nip: cleanNip },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      jenisZakat: true,
      jumlahZakat: true,
      sumberDana: true,
      status: true,
      createdAt: true,
    },
  });

  const riwayatInfaq = await prisma.infaq.findMany({
    where: { nip: cleanNip },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      jenisInfaq: true,
      jumlahInfaq: true,
      status: true,
      createdAt: true,
      kampanye: {
        select: { judul: true },
      },
    },
  });

  const rekapZakatList = await prisma.rekapZakat.findMany({
    where: { dosenNIP: cleanNip },
    orderBy: { tahunRekap: 'desc' },
    select: {
      id: true,
      tahunRekap: true,
      fileUrl: true,
      createdAt: true,
    },
  });

  // Ambil nama dari Zakat/Infaq jika tidak ada di Dosen
  const zakatWithNama = await prisma.zakat.findFirst({
    where: { nip: cleanNip },
    select: { nama: true },
  });

  const infaqWithNama = await prisma.infaq.findFirst({
    where: { nip: cleanNip },
    select: { nama: true },
  });

  const nama = dosen?.nama || zakatWithNama?.nama || infaqWithNama?.nama || null;

  const totalZakatLunas = riwayatZakat
    .filter((z) => z.status === 'lunas')
    .reduce((acc, z) => acc + (z.jumlahZakat || 0), 0);

  const totalInfaqLunas = riwayatInfaq
    .filter((i) => i.status === 'lunas')
    .reduce((acc, i) => acc + (i.jumlahInfaq || 0), 0);

  return {
    nip: cleanNip,
    nama,
    unitKerja: dosen?.unitKerja || null,
    totalZakatLunas,
    totalInfaqLunas,
    riwayatZakat: riwayatZakat.map((z) => ({
      id: z.id,
      jenis_zakat: z.jenisZakat,
      jumlah_zakat: z.jumlahZakat,
      sumber_dana: z.sumberDana,
      status: z.status as 'pending' | 'lunas' | 'ditolak',
      created_at: z.createdAt,
    })),
    rekapZakat: rekapZakatList.map((r) => ({
      id: r.id,
      tahunRekap: r.tahunRekap,
      fileUrl: r.fileUrl,
      createdAt: r.createdAt,
    })),
    riwayatInfaq: riwayatInfaq.map((i) => ({
      id: i.id,
      jenis_infaq: i.jenisInfaq,
      kampanye_judul: i.kampanye?.judul || null,
      jumlah_infaq: i.jumlahInfaq,
      status: i.status as 'pending' | 'lunas' | 'ditolak',
      created_at: i.createdAt,
    })),
  };
}
