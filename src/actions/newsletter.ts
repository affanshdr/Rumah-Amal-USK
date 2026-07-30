'use server';

import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

type UploadResult = {
    success: boolean;
    error?: string;
};

export async function uploadNewsletter(formData: FormData): Promise<UploadResult> {
    const judul = formData.get('judul') as string;
    const tanggalStr = formData.get('tanggal') as string;
    const file = formData.get('file') as File;

    if (!judul || !tanggalStr || !file || file.size === 0) {
        return { success: false, error: 'Data tidak lengkap.' };
    }

    try {
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `newsletter-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from('Newsletter')
            .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
            return { success: false, error: uploadError.message };
        }

        const { data } = supabase.storage.from('Newsletter').getPublicUrl(fileName);
        await prisma.newsletter.create({
            data: {
                judul,
                tanggal: new Date(tanggalStr),
                imageUrl: data.publicUrl
            },
        });

        revalidatePath('/admin/newsletter');
        return { success: true };
    } catch (e) {
        return { success: false, error: `Gagal menyimpan: ${(e as Error).message}` };
    }
}

export async function deleteNewsletter(id: string, imageUrl: string) {
    try {
        const url = new URL(imageUrl);
        const rawPath = url.pathname;
        const splitKey = rawPath.includes('/Newsletter/') ? '/Newsletter/' : '/newsletter/';
        const path = rawPath.split(splitKey)[1];

        if (path) {
            await supabase.storage.from('Newsletter').remove([path]);
        }
    } catch {
    }

    await prisma.newsletter.delete({ where: { id } });
    revalidatePath('/admin/newsletter');
}
