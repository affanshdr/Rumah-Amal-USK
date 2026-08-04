'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getPaginatedDocuments(page: number = 1, limit: number = 5) {
  const skip = (page - 1) * limit;

  const [items, totalCount] = await Promise.all([
    prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.document.count(),
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

export async function deleteDocumentAction(id: string) {
  await prisma.document.delete({ where: { id } });
  revalidatePath('/admin/dokumen');
  revalidatePath('/dokumen');
  revalidatePath('/');
}
