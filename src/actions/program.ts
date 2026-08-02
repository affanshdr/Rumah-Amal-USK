'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function addProgram(formData: FormData) {
  const title = formData.get('title') as string;
  const category = (formData.get('category') as string) || 'PENDIDIKAN';
  const excerpt = formData.get('excerpt') as string | null;
  const content = formData.get('content') as string;
  const published = formData.get('published') === '1';

  const file = formData.get('image') as File | null;

  if (!title || !content) {
    throw new Error('Judul dan konten program wajib diisi');
  }

  let slug = generateSlug(title);
  // Ensure unique slug
  const existing = await prisma.program.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  let coverImageUrl = null;

  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop();
    const fileName = `program-${Date.now()}.${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from('Galeri')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('Galeri')
        .getPublicUrl(fileName);
      coverImageUrl = publicUrlData.publicUrl;
    }
  }

  const program = await prisma.program.create({
    data: {
      title,
      slug,
      category,
      excerpt,
      content,
      coverImageUrl,
      published,
    },
  });

  revalidatePath('/program');
  revalidatePath('/upload/program');
  return program;
}

export async function updateProgram(formData: FormData) {
  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const category = formData.get('category') as string;
  const excerpt = formData.get('excerpt') as string | null;
  const content = formData.get('content') as string;
  const published = formData.get('published') === '1';

  const file = formData.get('image') as File | null;

  if (!id || !title || !content) {
    throw new Error('Data tidak lengkap');
  }

  let coverImageUrl = undefined;

  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop();
    const fileName = `program-${Date.now()}.${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from('Galeri')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage
        .from('Galeri')
        .getPublicUrl(fileName);
      coverImageUrl = publicUrlData.publicUrl;
    }
  }

  const program = await prisma.program.update({
    where: { id },
    data: {
      title,
      category,
      excerpt,
      content,
      ...(coverImageUrl && { coverImageUrl }),
      published,
    },
  });

  revalidatePath('/program');
  revalidatePath(`/program/${program.slug}`);
  revalidatePath('/upload/program');
  return program;
}

export async function deleteProgram(id: string) {
  await prisma.program.delete({
    where: { id },
  });
  revalidatePath('/program');
  revalidatePath('/upload/program');
}

export async function toggleProgramStatus(id: string, currentStatus: boolean) {
  await prisma.program.update({
    where: { id },
    data: { published: !currentStatus },
  });
  revalidatePath('/program');
  revalidatePath('/upload/program');
}
