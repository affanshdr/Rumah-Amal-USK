'use server';

import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// submitDonasi sekarang menyimpan ke tabel Infaq (model Donasi telah dihapus)
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

  // Simpan ke tabel Infaq dengan jenisInfaq = jenisDonasi (migrasi dari model Donasi)
  const infaq = await prisma.infaq.create({
    data: {
      tipePembayar: tipePembayar || 'masyarakat',
      jenisInfaq: jenisDonasi,
      kampanyeId: kampanyeId || null,
      jumlahInfaq: jumlahDonasi,
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

  redirect(`/donasi/sukses/${infaq.id}`);
}

export async function approveDonasi(id: string) {
  await prisma.infaq.update({
    where: { id },
    data: { status: 'lunas' },
  });
  revalidatePath('/admin/infaq');
}

export async function rejectDonasi(id: string) {
  await prisma.infaq.update({
    where: { id },
    data: { status: 'ditolak' },
  });
  revalidatePath('/admin/infaq');
}
