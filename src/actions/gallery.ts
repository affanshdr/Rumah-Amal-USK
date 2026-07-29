'use server';

import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

type UploadResult = {
    uploaded: { imageUrl: string }[];
    errors: string[];
};

export async function uploadGalleryImages(formData: FormData): Promise<UploadResult> {
    const files = formData.getAll('files') as File[];
    const uploaded: { imageUrl: string }[] = [];
    const errors: string[] = [];

    for (const file of files) {
        if (!file || file.size === 0) continue;

        try {
            const ext = file.name.split('.').pop() || 'jpg';
            const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

            const { error } = await supabase.storage
                .from('gallery')
                .upload(fileName, file, { cacheControl: '3600', upsert: false });

            if (error) {
                errors.push(`${file.name}: ${error.message}`);
                continue;
            }

            const { data } = supabase.storage.from('gallery').getPublicUrl(fileName);

            const created = await prisma.gallery.create({
                data: { imageUrl: data.publicUrl },
            });

            uploaded.push({ imageUrl: created.imageUrl });
        } catch (e) {
            errors.push(`${file.name}: ${(e as Error).message}`);
        }
    }

    revalidatePath('/admin/galeri');
    return { uploaded, errors };
}

export async function deleteGalleryImage(id: string, imageUrl: string) {
    // Coba hapus file fisik dari Supabase Storage juga (bukan cuma record DB)
    try {
        const url = new URL(imageUrl);
        const path = url.pathname.split('/gallery/')[1];
        if (path) {
            await supabase.storage.from('gallery').remove([path]);
        }
    } catch {
        // Kalau gagal hapus file fisik, tetap lanjut hapus record DB
        // supaya tidak ada data "nyangkut" di database
    }

    await prisma.gallery.delete({ where: { id } });
    revalidatePath('/admin/galeri');
}