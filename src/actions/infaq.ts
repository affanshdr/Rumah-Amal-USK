'use server';

import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function submitInfaq(formData: FormData) {
  const tipePembayar = formData.get('tipe_pembayar') as string;
  const jenisInfaq = formData.get('jenis_infaq') as string;
  const kampanyeId = formData.get('kampanye_id') as string | null;
  const jumlahInfaq = Number(formData.get('jumlah_infaq'));
  const nama = formData.get('nama') as string;
  const nip = formData.get('nip') as string | null;
  const email = formData.get('email') as string | null;
  const alamat = formData.get('alamat') as string | null;
  const noHp = formData.get('no_hp') as string | null;
  const isHambaAllah = formData.get('is_hamba_allah') === '1';
  const bersediaDihubungi = formData.get('bersedia_dihubungi') === '1';
  const pesan = formData.get('pesan') as string | null;
  const setujuTerms = formData.get('setuju_terms') === '1';

  if (!jenisInfaq || !jumlahInfaq || !nama) {
    throw new Error('Data tidak lengkap');
  }

  const buktiFile = formData.get('bukti_pembayaran') as File | null;
  let buktiPembayaran = null;

  if (buktiFile && buktiFile.size > 0) {
    const ext = buktiFile.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from('bukti_Pembayaran')
      .upload(fileName, buktiFile, { cacheControl: '3600', upsert: false });

    if (error) {
      throw new Error(`Gagal upload bukti pembayaran: ${error.message}`);
    }

    const { data } = supabase.storage.from('bukti_Pembayaran').getPublicUrl(fileName);
    buktiPembayaran = data.publicUrl;
  }

  const infaq = await prisma.infaq.create({
    data: {
      tipePembayar,
      jenisInfaq,
      kampanyeId: kampanyeId || null,
      jumlahInfaq,
      nama: isHambaAllah ? 'Hamba Allah' : nama,
      nip: nip || null,
      email: email || null,
      alamat: alamat || null,
      noHp: noHp || null,
      isHambaAllah,
      bersediaDihubungi,
      pesan: pesan || null,
      buktiPembayaran,
      setujuTerms,
      status: 'pending',
    },
  });

  redirect(`/infaq/sukses/${infaq.id}`);
}

export async function approveInfaq(id: string) {
  const infaq = await prisma.infaq.findUnique({
    where: { id },
  });

  if (!infaq) {
    throw new Error('Data infaq tidak ditemukan');
  }

  await prisma.infaq.update({
    where: { id },
    data: { status: 'lunas' },
  });

  if (infaq.status !== 'lunas' && infaq.kampanyeId) {
    await prisma.kampanye.update({
      where: { id: infaq.kampanyeId },
      data: {
        terkumpul: {
          increment: infaq.jumlahInfaq,
        },
      },
    });
  }

  revalidatePath('/admin/infaq');
  revalidatePath('/admin/kampanye');
}

export async function rejectInfaq(id: string) {
  const infaq = await prisma.infaq.findUnique({
    where: { id },
  });

  if (!infaq) {
    throw new Error('Data infaq tidak ditemukan');
  }

  if (infaq.status === 'lunas' && infaq.kampanyeId) {
    await prisma.kampanye.update({
      where: { id: infaq.kampanyeId },
      data: {
        terkumpul: {
          decrement: infaq.jumlahInfaq,
        },
      },
    });
  }

  await prisma.infaq.update({
    where: { id },
    data: { status: 'ditolak' },
  });

  revalidatePath('/admin/infaq');
  revalidatePath('/admin/kampanye');
}

export async function updateInfaqAdmin(id: string, data: {
  nama: string;
  nip?: string | null;
  tipePembayar?: string;
  jenisInfaq: string;
  kampanyeId?: string | null;
  jumlahInfaq: number;
  pesan?: string | null;
  status: string;
}) {
  const oldInfaq = await prisma.infaq.findUnique({ where: { id } });
  if (!oldInfaq) throw new Error('Data infaq tidak ditemukan');

  const newJumlah = Number(data.jumlahInfaq);
  const newKampanyeId = data.kampanyeId || null;
  const newStatus = data.status;

  if (oldInfaq.status === 'lunas' && oldInfaq.kampanyeId) {
    await prisma.kampanye.update({
      where: { id: oldInfaq.kampanyeId },
      data: { terkumpul: { decrement: oldInfaq.jumlahInfaq } },
    });
  }

  await prisma.infaq.update({
    where: { id },
    data: {
      nama: data.nama,
      nip: data.nip || null,
      ...(data.tipePembayar && { tipePembayar: data.tipePembayar }),
      jenisInfaq: data.jenisInfaq,
      kampanyeId: newKampanyeId,
      jumlahInfaq: newJumlah,
      pesan: data.pesan || null,
      status: newStatus,
    },
  });

  if (newStatus === 'lunas' && newKampanyeId) {
    await prisma.kampanye.update({
      where: { id: newKampanyeId },
      data: { terkumpul: { increment: newJumlah } },
    });
  }

  revalidatePath('/admin/infaq');
  revalidatePath('/admin/kampanye');
}
