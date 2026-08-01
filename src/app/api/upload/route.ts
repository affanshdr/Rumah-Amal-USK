import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Sesuaikan nama bucket ini dengan bucket Supabase Storage Anda
const BUCKET_NAME = 'announcements';

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Gunakan Service Role Key untuk bypass RLS, fallback ke Anon Key
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Konfigurasi Supabase belum diset di .env (NEXT_PUBLIC_SUPABASE_URL / KEY)' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang diupload.' }, { status: 400 });
    }

    // Validasi ukuran file (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Ukuran file terlalu besar (maks. 10MB).' }, { status: 400 });
    }

    // Validasi tipe file
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipe file tidak didukung: ${file.type}. Hanya gambar yang diizinkan.` },
        { status: 400 }
      );
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(uniqueName, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      console.error('[Upload Error]', uploadError);
      return NextResponse.json(
        { error: `Gagal upload ke bucket "${BUCKET_NAME}": ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(uniqueName);

    return NextResponse.json({
      url: urlData.publicUrl,
      storagePath: `${BUCKET_NAME}/${uniqueName}`,
      originalName: file.name,
      fileType: file.type,
      size: file.size,
    });
  } catch (err) {
    console.error('[Upload API Error]', err);
    return NextResponse.json(
      { error: `Server error: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
