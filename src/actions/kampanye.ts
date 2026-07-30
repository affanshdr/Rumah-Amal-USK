'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function getKampanye() {
  return await prisma.kampanye.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getActiveKampanye() {
  return await prisma.kampanye.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function addKampanye(formData: FormData) {
  const judul = formData.get('judul') as string;
  const deskripsi = formData.get('deskripsi') as string | null;
  const targetDanaStr = formData.get('targetDana') as string;
  const targetDana = targetDanaStr ? Number(targetDanaStr) : null;
  const tanggalSelesaiStr = formData.get('tanggalSelesai') as string;
  const tanggalSelesai = tanggalSelesaiStr ? new Date(tanggalSelesaiStr) : null;
  const isActive = formData.get('isActive') === '1';
  
  const file = formData.get('image') as File;

  if (!judul || !file || file.size === 0) {
    throw new Error('Judul dan Gambar wajib diisi');
  }

  // 1. Upload ke Supabase Storage (Bucket: Galeri)
  const fileExt = file.name.split('.').pop();
  const fileName = `kampanye-${Date.now()}.${fileExt}`;
  
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from('Galeri')
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false
    });

  if (uploadError) {
    console.error("Supabase Upload Error:", uploadError);
    throw new Error('Gagal mengupload gambar');
  }

  // 2. Dapatkan Public URL
  const { data: publicUrlData } = supabase.storage
    .from('Galeri')
    .getPublicUrl(fileName);

  await prisma.kampanye.create({
    data: {
      judul,
      deskripsi,
      imageUrl: publicUrlData.publicUrl,
      targetDana,
      tanggalSelesai,
      isActive,
    },
  });

  revalidatePath('/admin/kampanye');
  revalidatePath('/donasi');
}

export async function updateKampanye(formData: FormData) {
  const id = formData.get('id') as string;
  const judul = formData.get('judul') as string;
  const deskripsi = formData.get('deskripsi') as string | null;
  const targetDanaStr = formData.get('targetDana') as string;
  const targetDana = targetDanaStr ? Number(targetDanaStr) : null;
  const tanggalSelesaiStr = formData.get('tanggalSelesai') as string;
  const tanggalSelesai = tanggalSelesaiStr ? new Date(tanggalSelesaiStr) : null;
  const isActive = formData.get('isActive') === '1';
  
  const file = formData.get('image') as File | null;

  if (!id || !judul) {
    throw new Error('Data tidak lengkap');
  }

  let imageUrl = undefined;

  // Jika ada file gambar baru yang diunggah
  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop();
    const fileName = `kampanye-${Date.now()}.${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from('Galeri')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      throw new Error('Gagal mengupload gambar baru');
    }

    const { data: publicUrlData } = supabase.storage
      .from('Galeri')
      .getPublicUrl(fileName);
      
    imageUrl = publicUrlData.publicUrl;
  }

  await prisma.kampanye.update({
    where: { id },
    data: {
      judul,
      deskripsi,
      ...(imageUrl && { imageUrl }),
      targetDana,
      tanggalSelesai,
      isActive,
    },
  });

  revalidatePath('/admin/kampanye');
  revalidatePath('/donasi');
}

export async function deleteKampanye(id: string) {
  // Option: We could delete the image from Supabase here too
  await prisma.kampanye.delete({
    where: { id },
  });
  revalidatePath('/admin/kampanye');
  revalidatePath('/donasi');
}

export async function toggleKampanyeStatus(id: string, currentStatus: boolean) {
  await prisma.kampanye.update({
    where: { id },
    data: { isActive: !currentStatus },
  });
  revalidatePath('/admin/kampanye');
  revalidatePath('/donasi');
}
