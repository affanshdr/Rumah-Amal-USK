import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';

const BUCKET_COVER = 'dokumen-covers';
const BUCKET_PDF = 'dokumen-pdf';
const FALLBACK_BUCKET = 'Dokumen';
const SECONDARY_FALLBACK = 'Galeri';

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Konfigurasi Supabase tidak ditemukan.' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const formData = await req.formData();
    const coverFile = formData.get('image') as File | null;
    const pdfFile = formData.get('pdf') as File | null;
    const judul = (formData.get('judul') as string | null)?.trim();
    const customCreatedAt = formData.get('createdAt') as string | null;

    if (!judul) {
      return NextResponse.json({ error: 'Judul dokumen wajib diisi.' }, { status: 400 });
    }
    if (!pdfFile) {
      return NextResponse.json({ error: 'File PDF wajib diupload.' }, { status: 400 });
    }

    // Helper to upload file to storage
    const uploadToStorage = async (file: File, preferredBucket: string, prefix: string) => {
      const ext = file.name.split('.').pop() ?? (prefix === 'cover' ? 'webp' : 'pdf');
      const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      let targetBucket = preferredBucket;
      let { error: uploadError } = await supabase.storage
        .from(targetBucket)
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError && uploadError.message.toLowerCase().includes('not found')) {
        targetBucket = FALLBACK_BUCKET;
        const fallbackRes = await supabase.storage
          .from(targetBucket)
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: false,
          });
        uploadError = fallbackRes.error;
      }

      if (uploadError && uploadError.message.toLowerCase().includes('not found')) {
        targetBucket = SECONDARY_FALLBACK;
        const secondaryRes = await supabase.storage
          .from(targetBucket)
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: false,
          });
        uploadError = secondaryRes.error;
      }

      if (uploadError) {
        throw new Error(`Upload ${prefix} gagal (${targetBucket}): ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage.from(targetBucket).getPublicUrl(fileName);
      return urlData.publicUrl;
    };

    // Upload PDF
    const pdfUrl = await uploadToStorage(pdfFile, BUCKET_PDF, 'pdf');

    // Handle Cover Image:
    // If a new cover image is uploaded with this document, upload it and update all existing documents to use this new cover too!
    // Otherwise, check if any existing document has a cover URL, or fallback to default '/dokumen-cover.svg'.
    let imageUrl: string;

    if (coverFile && coverFile.size > 0) {
      imageUrl = await uploadToStorage(coverFile, BUCKET_COVER, 'cover');
      // Sync all existing documents to this new cover image so everything remains consistent!
      await prisma.document.updateMany({
        data: { imageUrl },
      });
    } else {
      // Find latest document cover URL if available
      const latestDoc = await prisma.document.findFirst({
        where: { imageUrl: { not: null } },
        orderBy: { createdAt: 'desc' },
      });
      imageUrl = latestDoc?.imageUrl || '/dokumen-cover.svg';
    }

    const createdAtDate = customCreatedAt ? new Date(customCreatedAt) : new Date();

    const document = await prisma.document.create({
      data: {
        judul,
        imageUrl,
        pdfUrl,
        createdAt: isNaN(createdAtDate.getTime()) ? new Date() : createdAtDate,
      },
    });

    return NextResponse.json({ success: true, document });
  } catch (err) {
    console.error('[POST /api/documents/upload]', err);
    return NextResponse.json(
      { error: `Internal server error: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
