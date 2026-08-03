import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument } from 'pdf-lib';

const PRIMARY_BUCKET = 'Berita';
const FALLBACK_BUCKETS = ['announcements', 'Dokumen', 'Galeri'];

/**
 * Optimasi metadata & stream PDF menggunakan pdf-lib (lossless).
 */
async function optimizePdf(buffer: Buffer): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(buffer, {
    ignoreEncryption: false,
    updateMetadata: false,
  });

  pdfDoc.setCreator('');
  pdfDoc.setProducer('');

  const optimizedBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  return Buffer.from(optimizedBytes);
}

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Konfigurasi Supabase URL / Key belum diset di .env' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const reqBucket = (formData.get('bucket') as string | null)?.trim();

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang diupload.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const originalArrayBuffer = await file.arrayBuffer();
    const originalBuffer = Buffer.from(originalArrayBuffer);
    const originalSizeBytes = originalBuffer.byteLength;

    let finalBuffer: Buffer = originalBuffer;
    let sizeInfo: Record<string, unknown> | null = null;

    // ── Kompresi / Optimasi PDF jika file berformat PDF ─────────────────────
    const isPdf = file.type === 'application/pdf' || ext.toLowerCase() === 'pdf';
    if (isPdf) {
      try {
        const optimizedBuffer = await optimizePdf(originalBuffer);
        const savedBytes = originalSizeBytes - optimizedBuffer.byteLength;
        finalBuffer = optimizedBuffer;
        console.log(
          `[PDF Compress / Upload] "${file.name}" | Original: ${(originalSizeBytes / 1024 / 1024).toFixed(2)} MB` +
          ` → Optimized: ${(finalBuffer.byteLength / 1024 / 1024).toFixed(2)} MB` +
          ` | Saved: ${(savedBytes / 1024 / 1024).toFixed(2)} MB (${((savedBytes / originalSizeBytes) * 100).toFixed(1)}%)`
        );
        sizeInfo = {
          originalSizeMB: parseFloat((originalSizeBytes / 1024 / 1024).toFixed(2)),
          compressedSizeMB: parseFloat((finalBuffer.byteLength / 1024 / 1024).toFixed(2)),
          savedPercent: parseFloat((((originalSizeBytes - finalBuffer.byteLength) / originalSizeBytes) * 100).toFixed(1)),
          wasOptimized: finalBuffer.byteLength < originalSizeBytes,
        };
      } catch (pdfErr) {
        console.warn(`[PDF Compress Warning] Gagal mengompresi PDF "${file.name}", menggunakan buffer asli:`, (pdfErr as Error).message);
        finalBuffer = originalBuffer;
      }
    }

    // ── Strategi Upload Bucket dengan Fallback ──────────────────────────────
    const bucketList = reqBucket
      ? [reqBucket, PRIMARY_BUCKET, ...FALLBACK_BUCKETS]
      : [PRIMARY_BUCKET, ...FALLBACK_BUCKETS];
    const uniqueBuckets = Array.from(new Set(bucketList));

    let uploadedBucket = '';
    let uploadErrorMsg = '';

    for (const b of uniqueBuckets) {
      const { error: err } = await supabase.storage
        .from(b)
        .upload(fileName, finalBuffer, {
          contentType: file.type || (isPdf ? 'application/pdf' : 'application/octet-stream'),
          upsert: false,
        });

      if (!err) {
        uploadedBucket = b;
        break;
      }

      uploadErrorMsg = err.message;
      if (!err.message.toLowerCase().includes('not found')) {
        break;
      }
    }

    if (!uploadedBucket) {
      return NextResponse.json(
        { error: `Gagal upload file ke Supabase Storage: ${uploadErrorMsg}` },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from(uploadedBucket)
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: urlData.publicUrl,
      storagePath: `${uploadedBucket}/${fileName}`,
      originalName: file.name,
      fileType: file.type || (isPdf ? 'application/pdf' : 'application/octet-stream'),
      size: finalBuffer.byteLength,
      sizeInfo,
    });
  } catch (err) {
    console.error('[Upload API Error]', err);
    return NextResponse.json(
      { error: `Server error: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
