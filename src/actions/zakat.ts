'use server';

import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function submitZakat(formData: FormData) {
  const tipePembayar = formData.get('tipe_pembayar') as string;
  const jenisZakat = formData.get('jenis_zakat') as string;
  const jumlahZakat = Number(formData.get('jumlah_zakat'));
  const nama = formData.get('nama') as string;
  const nip = formData.get('nip') as string | null;
  const email = formData.get('email') as string | null;
  const alamat = formData.get('alamat') as string | null;
  const noHp = formData.get('no_hp') as string | null;
  const isHambaAllah = formData.get('is_hamba_allah') === '1';
  const bersediaDihubungi = formData.get('bersedia_dihubungi') === '1';
  const pesan = formData.get('pesan') as string | null;
  const setujuTerms = formData.get('setuju_terms') === '1';
  const sumberDana = formData.get('sumber_dana') as string | null;
  const jenisPerusahaan = formData.get('jenis_perusahaan') as string | null;

  if (!jenisZakat || !jumlahZakat || !nama) {
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

  const zakat = await prisma.zakat.create({
    data: {
      tipePembayar,
      jenisZakat,
      sumberDana,
      jenisPerusahaan,
      jumlahZakat,
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

  redirect(`/zakat/sukses/${zakat.id}`);
}

export async function approveZakat(id: string) {
  await prisma.zakat.update({
    where: { id },
    data: { status: 'lunas' },
  });
  revalidatePath('/admin/zakat');
}

export async function rejectZakat(id: string) {
  await prisma.zakat.update({
    where: { id },
    data: { status: 'ditolak' },
  });
  revalidatePath('/admin/zakat');
}
