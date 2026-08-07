import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface InfaqRow {
  nip: string;
  jumlah_infaq: string | number;
  jenis_infaq: string;
  no_hp?: string;
  pesan?: string;
  tanggal?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rows: InfaqRow[] = body.rows;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Data tidak valid atau kosong' }, { status: 400 });
    }

    const errors: { row: number; nip: string; message: string }[] = [];
    let inserted = 0;

    const BATCH_SIZE = 100;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);

      // Batch lookup dosen
      const nips = [...new Set(batch.map((r) => r.nip?.toString().trim()).filter(Boolean))];
      const dosens = await prisma.dosen.findMany({
        where: { nip: { in: nips } },
        select: { nip: true, nama: true, alamat: true },
      });
      const dosenMap = new Map(dosens.map((d) => [d.nip, d]));

      const validRows: Prisma.InfaqCreateManyInput[] = [];

      for (let j = 0; j < batch.length; j++) {
        const rowIndex = i + j + 2;
        const row = batch[j];

        const nip = row.nip?.toString().trim();
        const jenisInfaq = row.jenis_infaq?.toString().trim();
        const jumlahInfaq = parseFloat(row.jumlah_infaq?.toString().replace(/[^0-9.]/g, '') || '0');

        if (!nip) {
          errors.push({ row: rowIndex, nip: '-', message: 'Kolom nip wajib diisi' });
          continue;
        }
        if (!jenisInfaq) {
          errors.push({ row: rowIndex, nip, message: 'Kolom jenis_infaq wajib diisi' });
          continue;
        }
        if (!jumlahInfaq || jumlahInfaq <= 0) {
          errors.push({ row: rowIndex, nip, message: 'jumlah_infaq tidak valid (harus angka > 0)' });
          continue;
        }

        const dosen = dosenMap.get(nip);
        if (!dosen) {
          errors.push({ row: rowIndex, nip, message: 'NIP tidak ditemukan di Master Data Dosen' });
          continue;
        }

        let createdAt: Date | undefined = undefined;
        if (row.tanggal) {
          const parsed = new Date(row.tanggal.toString().trim());
          if (!isNaN(parsed.getTime())) createdAt = parsed;
        }

        validRows.push({
          tipePembayar: 'dosen',
          jenisInfaq,
          jumlahInfaq,
          nama: dosen.nama,
          nip,
          noHp: row.no_hp?.toString().trim() || null,
          alamat: dosen.alamat || null,
          isHambaAllah: false,
          bersediaDihubungi: false,
          pesan: row.pesan?.toString().trim() || null,
          setujuTerms: true,
          status: 'lunas',
          ...(createdAt && { createdAt }),
        });
      }

      if (validRows.length > 0) {
        await prisma.infaq.createMany({ data: validRows });
        inserted += validRows.length;
      }
    }

    return NextResponse.json({ inserted, errors });
  } catch (err: unknown) {
    console.error('Import infaq error:', err);
    return NextResponse.json({ error: 'Gagal memproses file CSV' }, { status: 500 });
  }
}
