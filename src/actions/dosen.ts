'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getDosens() {
  try {
    return await prisma.dosen.findMany({
      orderBy: { nama: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching dosens:', error);
    return [];
  }
}

export async function getDosenByNip(nip: string) {
  try {
    return await prisma.dosen.findUnique({
      where: { nip },
    });
  } catch (error) {
    console.error('Error fetching dosen by NIP:', error);
    return null;
  }
}

export async function createDosen(formData: FormData) {
  const nip = (formData.get('nip') as string)?.trim();
  const nama = (formData.get('nama') as string)?.trim();
  const npwp = (formData.get('npwp') as string)?.trim() || null;
  const alamat = (formData.get('alamat') as string)?.trim() || null;
  const unitKerja = (formData.get('unit_kerja') as string)?.trim() || (formData.get('unitKerja') as string)?.trim() || null;
  const noHp = (formData.get('no_hp') as string)?.trim() || (formData.get('noHp') as string)?.trim() || null;

  if (!nip || !nama) {
    throw new Error('NIP dan Nama Dosen wajib diisi');
  }

  const existing = await prisma.dosen.findUnique({ where: { nip } });
  if (existing) {
    throw new Error(`Dosen dengan NIP ${nip} sudah ada`);
  }

  await prisma.dosen.create({
    data: {
      nip,
      nama,
      npwp,
      alamat,
      unitKerja,
      noHp,
    },
  });

  revalidatePath('/admin/dosen');
  return { success: true };
}

export async function updateDosen(oldNip: string, formData: FormData) {
  const nip = (formData.get('nip') as string)?.trim();
  const nama = (formData.get('nama') as string)?.trim();
  const npwp = (formData.get('npwp') as string)?.trim() || null;
  const alamat = (formData.get('alamat') as string)?.trim() || null;
  const unitKerja = (formData.get('unit_kerja') as string)?.trim() || (formData.get('unitKerja') as string)?.trim() || null;
  const noHp = (formData.get('no_hp') as string)?.trim() || (formData.get('noHp') as string)?.trim() || null;

  if (!nip || !nama) {
    throw new Error('NIP dan Nama Dosen wajib diisi');
  }

  await prisma.dosen.update({
    where: { nip: oldNip },
    data: {
      nip,
      nama,
      npwp,
      alamat,
      unitKerja,
      noHp,
    },
  });

  revalidatePath('/admin/dosen');
  return { success: true };
}

export async function deleteDosen(nip: string) {
  if (!nip) {
    throw new Error('NIP dosen wajib diisi');
  }

  await prisma.dosen.delete({
    where: { nip },
  });

  revalidatePath('/admin/dosen');
  return { success: true };
}

