import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface DosenRow {
  nip: string;
  nama: string;
  npwp?: string;
  alamat?: string;
  unit_kerja?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rows: DosenRow[] = body.rows;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Data tidak valid atau kosong' }, { status: 400 });
    }

    const errors: { row: number; nip: string; message: string }[] = [];
    let inserted = 0;
    let updated = 0;

    // Proses dalam batch untuk menghindari timeout
    const BATCH_SIZE = 100;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);

      for (let j = 0; j < batch.length; j++) {
        const rowIndex = i + j + 2; // +2: baris 1 = header, baris 2 = data pertama
        const row = batch[j];

        const nip = row.nip?.toString().trim();
        const nama = row.nama?.toString().trim();

        if (!nip || !nama) {
          errors.push({ row: rowIndex, nip: nip || '-', message: 'Kolom nip dan nama wajib diisi' });
          continue;
        }

        try {
          const existing = await prisma.dosen.findUnique({ where: { nip } });

          if (existing) {
            await prisma.dosen.update({
              where: { nip },
              data: {
                nama,
                npwp: row.npwp?.toString().trim() || existing.npwp,
                alamat: row.alamat?.toString().trim() || existing.alamat,
                unitKerja: row.unit_kerja?.toString().trim() || existing.unitKerja,
              },
            });
            updated++;
          } else {
            await prisma.dosen.create({
              data: {
                nip,
                nama,
                npwp: row.npwp?.toString().trim() || null,
                alamat: row.alamat?.toString().trim() || null,
                unitKerja: row.unit_kerja?.toString().trim() || null,
              },
            });
            inserted++;
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Gagal menyimpan data';
          errors.push({ row: rowIndex, nip, message });
        }
      }
    }

    return NextResponse.json({ inserted, updated, errors });
  } catch (err: unknown) {
    console.error('Import dosen error:', err);
    return NextResponse.json({ error: 'Gagal memproses file CSV' }, { status: 500 });
  }
}
