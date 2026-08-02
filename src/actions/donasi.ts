'use server';

import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function submitDonasi(formData: FormData) {
  const tipePembayar = formData.get('tipe_pembayar') as string;
  const jenisDonasi = formData.get('jenis_donasi') as string;
  const kampanyeId = formData.get('kampanye_id') as string | null;
  const jumlahDonasi = Number(formData.get('jumlah_donasi'));
  const nama = formData.get('nama') as string;
  const nip = formData.get('nip') as string | null;
  const email = formData.get('email') as string | null;
  const alamat = formData.get('alamat') as string | null;
  const noHp = formData.get('no_hp') as string | null;
  const isHambaAllah = formData.get('is_hamba_allah') === '1';
  const bersediaDihubungi = formData.get('bersedia_dihubungi') === '1';
  const pesan = formData.get('pesan') as string | null;
  const setujuTerms = formData.get('setuju_terms') === '1';

  if (!jenisDonasi || !jumlahDonasi || !nama) {
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

  const donasi = await prisma.donasi.create({
    data: {
      tipePembayar,
      jenisDonasi,
      kampanyeId: kampanyeId || null,
      jumlahDonasi,
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

  redirect(`/donasi/sukses/${donasi.id}`);
}

export async function approveDonasi(id: string) {
  const donasi = await prisma.donasi.findUnique({
    where: { id },
  });

  if (!donasi) {
    throw new Error('Donasi tidak ditemukan');
  }

  await prisma.donasi.update({
    where: { id },
    data: { status: 'lunas' },
  });

  if (donasi.status !== 'lunas' && donasi.kampanyeId) {
    await prisma.kampanye.update({
      where: { id: donasi.kampanyeId },
      data: {
        terkumpul: {
          increment: donasi.jumlahDonasi,
        },
      },
    });
  }

  revalidatePath('/admin/donasi');
  revalidatePath('/admin/kampanye');
  revalidatePath('/donasi');
}

export async function rejectDonasi(id: string) {
  const donasi = await prisma.donasi.findUnique({
    where: { id },
  });

  if (!donasi) {
    throw new Error('Donasi tidak ditemukan');
  }

  if (donasi.status === 'lunas' && donasi.kampanyeId) {
    await prisma.kampanye.update({
      where: { id: donasi.kampanyeId },
      data: {
        terkumpul: {
          decrement: donasi.jumlahDonasi,
        },
      },
    });
  }

  await prisma.donasi.update({
    where: { id },
    data: { status: 'ditolak' },
  });

  revalidatePath('/admin/donasi');
  revalidatePath('/admin/kampanye');
  revalidatePath('/donasi');
}
