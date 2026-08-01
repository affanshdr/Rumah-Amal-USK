import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument } from 'pdf-lib';
import prisma from '@/lib/prisma';

// Naikkan timeout untuk upload file besar (maks. 300 detik di Vercel Pro, 60 detik di Hobby)
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const BUCKET_COVER = 'dokumen-covers';
const BUCKET_PDF = 'dokumen-pdf';
const FALLBACK_BUCKET = 'Dokumen';
const SECONDARY_FALLBACK = 'Galeri';

/**
 * Optimasi metadata PDF menggunakan pdf-lib (lossless).
 * Tidak mengubah konten, teks, atau gambar sama sekali.
 * Hanya mengaktifkan object streams (cross-reference streams)
 * yang dapat mengurangi ukuran file 5–20% tergantung struktur PDF.
 *
 * @param buffer - Raw PDF buffer dari file upload
 * @returns Buffer PDF yang sudah dioptimasi
 */
async function optimizePdf(buffer: Buffer): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(buffer, {
    // Izinkan PDF yang mungkin punya minor issues tetap diload
    ignoreEncryption: false,
    updateMetadata: false,
  });

  // Hapus metadata yang tidak perlu (author, creator tool, dll.)
  // tapi jaga title jika ada — bisa dikosongkan semuanya untuk mengurangi size
  pdfDoc.setCreator('');
  pdfDoc.setProducer('');

  const optimizedBytes = await pdfDoc.save({
    // useObjectStreams: true = aktifkan cross-reference object streams
    // Ini adalah optimasi lossless utama yang mengompresi referensi internal PDF
    useObjectStreams: true,

    // addDefaultPage: false = jangan tambah halaman kosong
    addDefaultPage: false,
  });

  return Buffer.from(optimizedBytes);
}

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
    const contentType = req.headers.get('content-type') ?? '';

    // ── Mode Drive: body JSON dengan pdfUrl langsung ─────────────────────────
    if (contentType.includes('application/json')) {
      const body = await req.json() as { judul?: string; pdfUrl?: string; createdAt?: string };
      const judul = body.judul?.trim();
      const pdfUrl = body.pdfUrl?.trim();
      const customCreatedAt = body.createdAt;

      if (!judul) {
        return NextResponse.json({ error: 'Judul dokumen wajib diisi.' }, { status: 400 });
      }
      if (!pdfUrl) {
        return NextResponse.json({ error: 'Link PDF wajib diisi.' }, { status: 400 });
      }

      // Ambil cover dari dokumen terbaru yang ada
      const latestDoc = await prisma.document.findFirst({
        where: { imageUrl: { not: null } },
        orderBy: { createdAt: 'desc' },
      });
      const imageUrl = latestDoc?.imageUrl || '/dokumen-cover.svg';

      const createdAtDate = customCreatedAt ? new Date(customCreatedAt) : new Date();

      const document = await prisma.document.create({
        data: {
          judul,
          imageUrl,
          pdfUrl,
          fileSize: null, // Link Drive tidak diketahui ukurannya
          createdAt: isNaN(createdAtDate.getTime()) ? new Date() : createdAtDate,
        },
      });

      console.log(`[Drive Link] Dokumen "${judul}" disimpan dengan link Drive.`);

      return NextResponse.json({ success: true, document });
    }

    // ── Mode File: multipart form-data dengan file PDF ────────────────────────
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
    const uploadToStorage = async (
      buffer: Buffer,
      contentType: string,
      originalName: string,
      preferredBucket: string,
      prefix: string
    ) => {
      const ext = originalName.split('.').pop() ?? (prefix === 'cover' ? 'webp' : 'pdf');
      const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      let targetBucket = preferredBucket;
      let { error: uploadError } = await supabase.storage
        .from(targetBucket)
        .upload(fileName, buffer, {
          contentType,
          upsert: false,
        });

      if (uploadError && uploadError.message.toLowerCase().includes('not found')) {
        targetBucket = FALLBACK_BUCKET;
        const fallbackRes = await supabase.storage
          .from(targetBucket)
          .upload(fileName, buffer, {
            contentType,
            upsert: false,
          });
        uploadError = fallbackRes.error;
      }

      if (uploadError && uploadError.message.toLowerCase().includes('not found')) {
        targetBucket = SECONDARY_FALLBACK;
        const secondaryRes = await supabase.storage
          .from(targetBucket)
          .upload(fileName, buffer, {
            contentType,
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

    // --- Process PDF ---
    const pdfArrayBuffer = await pdfFile.arrayBuffer();
    const originalPdfBuffer = Buffer.from(pdfArrayBuffer);
    const originalSizeBytes = originalPdfBuffer.byteLength;

    let finalPdfBuffer: Buffer;
    let optimizationError: string | null = null;

    try {
      finalPdfBuffer = await optimizePdf(originalPdfBuffer);
      const savedBytes = originalSizeBytes - finalPdfBuffer.byteLength;
      console.log(
        `[PDF Optimize] "${judul}" | Original: ${(originalSizeBytes / 1024 / 1024).toFixed(2)} MB` +
        ` → Optimized: ${(finalPdfBuffer.byteLength / 1024 / 1024).toFixed(2)} MB` +
        ` | Saved: ${(savedBytes / 1024 / 1024).toFixed(2)} MB (${((savedBytes / originalSizeBytes) * 100).toFixed(1)}%)`
      );
    } catch (err) {
      // Jika optimasi gagal (PDF terenkripsi/rusak), upload original tanpa kompresi
      console.warn(`[PDF Optimize] Gagal optimasi "${judul}", upload original:`, (err as Error).message);
      finalPdfBuffer = originalPdfBuffer;
      optimizationError = (err as Error).message;
    }

    const compressedSizeBytes = finalPdfBuffer.byteLength;
    // Hitung ukuran dalam MB untuk disimpan ke DB (2 desimal)
    const fileSizeMB = parseFloat((compressedSizeBytes / 1024 / 1024).toFixed(2));

    // Upload PDF ke storage
    const pdfUrl = await uploadToStorage(
      finalPdfBuffer,
      'application/pdf',
      pdfFile.name,
      BUCKET_PDF,
      'pdf'
    );

    // Handle Cover Image
    let imageUrl: string;

    if (coverFile && coverFile.size > 0) {
      const coverArrayBuffer = await coverFile.arrayBuffer();
      const coverBuffer = Buffer.from(coverArrayBuffer);
      imageUrl = await uploadToStorage(
        coverBuffer,
        coverFile.type,
        coverFile.name,
        BUCKET_COVER,
        'cover'
      );
      // Sync semua dokumen ke cover baru agar konsisten
      await prisma.document.updateMany({
        data: { imageUrl },
      });
    } else {
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
        fileSize: fileSizeMB,
        createdAt: isNaN(createdAtDate.getTime()) ? new Date() : createdAtDate,
      },
    });

    return NextResponse.json({
      success: true,
      document,
      // Info ukuran untuk ditampilkan ke user
      sizeInfo: {
        originalSizeMB: parseFloat((originalSizeBytes / 1024 / 1024).toFixed(2)),
        compressedSizeMB: parseFloat((compressedSizeBytes / 1024 / 1024).toFixed(2)),
        savedPercent: parseFloat(
          (((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100).toFixed(1)
        ),
        wasOptimized: !optimizationError && compressedSizeBytes < originalSizeBytes,
        optimizationError: optimizationError ?? undefined,
      },
    });
  } catch (err) {
    console.error('[POST /api/documents/upload]', err);
    return NextResponse.json(
      { error: `Internal server error: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
