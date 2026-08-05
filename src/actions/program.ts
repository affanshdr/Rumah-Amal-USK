'use server';

import prisma from '@/lib/prisma';
import { deleteStorageFileByUrl } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await prisma.program.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    });
    if (!existing) break;
    slug = `${base}-${counter++}`;
  }
  return slug;
}

export async function getPrograms(category?: string) {
  const whereCondition: { category?: string } = {};
  if (category && category.toUpperCase() !== 'SEMUA') {
    whereCondition.category = category;
  }

  return await prisma.program.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getActivePrograms(category?: string) {
  const whereCondition: { published: boolean; category?: string } = { published: true };
  if (category && category.toUpperCase() !== 'SEMUA') {
    whereCondition.category = category;
  }

  return await prisma.program.findMany({
    where: whereCondition,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProgramBySlug(slug: string) {
  return await prisma.program.findUnique({
    where: { slug },
  });
}

export async function getPaginatedPrograms(page: number = 1, limit: number = 5) {
  const skip = (page - 1) * limit;

  const [items, totalCount, publishedCount, draftCount] = await Promise.all([
    prisma.program.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        category: true,
        coverImageUrl: true,
        published: true,
        publishedAt: true,
        content: true,
        createdAt: true,
      },
    }),
    prisma.program.count(),
    prisma.program.count({ where: { published: true } }),
    prisma.program.count({ where: { published: false } }),
  ]);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return {
    items,
    totalCount,
    totalPages,
    publishedCount,
    draftCount,
    page,
    limit,
  };
}

export async function addProgram(formData: FormData) {
  const title = (formData.get('title') as string).trim();
  const category = (formData.get('category') as string | null)?.trim() || 'PENDIDIKAN';
  const excerpt = (formData.get('excerpt') as string | null)?.trim() || null;
  const coverImageUrl = (formData.get('coverImageUrl') as string | null)?.trim() || null;
  const content = (formData.get('content') as string | null)?.trim() || '';
  const publishedAtRaw = formData.get('publishedAt') as string | null;
  const published = formData.get('published') === '1';

  if (!title) throw new Error('Judul program tidak boleh kosong.');

  const baseSlug = generateSlug(title);
  const slug = await uniqueSlug(baseSlug);

  const program = await prisma.program.create({
    data: {
      title,
      slug,
      category,
      excerpt,
      coverImageUrl,
      content,
      published,
      publishedAt: publishedAtRaw ? new Date(publishedAtRaw) : new Date(),
    },
  });

  revalidatePath('/admin/program');
  revalidatePath('/program');
  revalidatePath('/');
  return program;
}

export async function updateProgram(formData: FormData) {
  const id = formData.get('id') as string;
  const title = (formData.get('title') as string).trim();
  const category = (formData.get('category') as string | null)?.trim() || 'PENDIDIKAN';
  const excerpt = (formData.get('excerpt') as string | null)?.trim() || null;
  const coverImageUrl = (formData.get('coverImageUrl') as string | null)?.trim() || null;
  const content = (formData.get('content') as string | null)?.trim() || '';
  const publishedAtRaw = formData.get('publishedAt') as string | null;
  const published = formData.get('published') === '1';

  if (!id || !title) throw new Error('ID dan judul program tidak boleh kosong.');

  const existingProgram = await prisma.program.findUnique({
    where: { id },
    select: { coverImageUrl: true },
  });

  if (
    existingProgram?.coverImageUrl &&
    existingProgram.coverImageUrl !== coverImageUrl
  ) {
    await deleteStorageFileByUrl(existingProgram.coverImageUrl);
  }

  const baseSlug = generateSlug(title);
  const slug = await uniqueSlug(baseSlug, id);

  const program = await prisma.program.update({
    where: { id },
    data: {
      title,
      slug,
      category,
      excerpt,
      coverImageUrl,
      content,
      published,
      publishedAt: publishedAtRaw ? new Date(publishedAtRaw) : undefined,
    },
  });

  revalidatePath('/admin/program');
  revalidatePath('/program');
  revalidatePath('/');
  return program;
}

export async function deleteProgram(id: string) {
  const existing = await prisma.program.findUnique({
    where: { id },
    select: { coverImageUrl: true },
  });

  if (existing?.coverImageUrl) {
    await deleteStorageFileByUrl(existing.coverImageUrl);
  }

  await prisma.program.delete({ where: { id } });
  revalidatePath('/admin/program');
  revalidatePath('/program');
  revalidatePath('/');
}

export async function toggleProgramPublished(id: string, currentPublished: boolean) {
  await prisma.program.update({
    where: { id },
    data: { published: !currentPublished },
  });
  revalidatePath('/admin/program');
  revalidatePath('/program');
  revalidatePath('/');
}
