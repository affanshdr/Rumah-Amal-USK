'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getPaginatedMitra(page: number = 1, limit: number = 5) {
  const skip = (page - 1) * limit;

  const [items, totalCount] = await Promise.all([
    prisma.mitra.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.mitra.count(),
  ]);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return {
    items,
    totalCount,
    totalPages,
    page,
    limit,
  };
}

export async function addMitra(formData: FormData) {
  const nama = (formData.get('nama') as string).trim();
  const imageUrl = (formData.get('logoUrl') as string | null)?.trim() || (formData.get('imageUrl') as string | null)?.trim() || null;

  if (!nama || !imageUrl) {
    throw new Error('Nama mitra dan Logo wajib diisi');
  }

  const item = await prisma.mitra.create({
    data: {
      nama,
      imageUrl,
    },
  });

  revalidatePath('/admin/mitra');
  revalidatePath('/upload/mitra');
  revalidatePath('/');
  return item;
}

export async function updateMitra(formData: FormData) {
  const id = formData.get('id') as string;
  const nama = (formData.get('nama') as string).trim();
  const imageUrl = (formData.get('logoUrl') as string | null)?.trim() || (formData.get('imageUrl') as string | null)?.trim() || null;

  if (!id || !nama || !imageUrl) {
    throw new Error('Data mitra tidak lengkap');
  }

  const item = await prisma.mitra.update({
    where: { id },
    data: {
      nama,
      imageUrl,
    },
  });

  revalidatePath('/admin/mitra');
  revalidatePath('/upload/mitra');
  revalidatePath('/');
  return item;
}

export async function deleteMitra(id: string) {
  await prisma.mitra.delete({ where: { id } });
  revalidatePath('/admin/mitra');
  revalidatePath('/upload/mitra');
  revalidatePath('/');
}
