'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function submitInfaq(formData: FormData) {
  const tipePembayar = formData.get('tipe_pembayar') as string;
  const jenisInfaq = formData.get('jenis_infaq') as string;
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

  const infaq = await prisma.infaq.create({
    data: {
      tipePembayar,
      jenisInfaq,
      jumlahInfaq,
      nama: isHambaAllah ? 'Hamba Allah' : nama,
      nip: nip || null,
      email: email || null,
      alamat: alamat || null,
      noHp: noHp || null,
      isHambaAllah,
      bersediaDihubungi,
      pesan: pesan || null,
      setujuTerms,
      status: 'pending',
    },
  });

  redirect(`/infaq/sukses/${infaq.id}`);
}

export async function approveInfaq(id: string) {
  await prisma.infaq.update({
    where: { id },
    data: { status: 'lunas' },
  });
  revalidatePath('/admin/infaq');
}

export async function rejectInfaq(id: string) {
  await prisma.infaq.update({
    where: { id },
    data: { status: 'ditolak' },
  });
  revalidatePath('/admin/infaq');
}
