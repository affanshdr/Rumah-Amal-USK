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
                .from('Gallery')
                .upload(fileName, file, { cacheControl: '3600', upsert: false });

            if (error) {
                errors.push(`${file.name}: ${error.message}`);
                continue;
            }

            const { data } = supabase.storage.from('Gallery').getPublicUrl(fileName);

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
    try {
        const url = new URL(imageUrl);
        const rawPath = url.pathname;
        const splitKey = rawPath.includes('/Gallery/') ? '/Gallery/' : '/gallery/';
        const path = rawPath.split(splitKey)[1];

        if (path) {
            await supabase.storage.from('Gallery').remove([path]);
        }
    } catch {
    }

    await prisma.gallery.delete({ where: { id } });
    revalidatePath('/admin/galeri');
}