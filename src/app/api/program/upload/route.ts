import { NextRequest, NextResponse } from 'next/server';
import { addProgram } from '@/actions/program';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { title, category, coverImageUrl, content, publishedAt, published } = body;

      if (!title || !content) {
        return NextResponse.json(
          { error: 'Judul dan konten program wajib diisi.' },
          { status: 400 }
        );
      }

      let slug = generateSlug(title);
      const existing = await prisma.program.findUnique({ where: { slug } });
      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }

      const program = await prisma.program.create({
        data: {
          title,
          slug,
          category: category || 'PENDIDIKAN',
          coverImageUrl: coverImageUrl || null,
          content,
          published: published ?? true,
          publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        },
      });

      revalidatePath('/program');
      revalidatePath('/upload/program');

      return NextResponse.json({ success: true, program });
    }

    // Default FormData handler
    const formData = await request.formData();
    const program = await addProgram(formData);
    return NextResponse.json({ success: true, program });
  } catch (error) {
    console.error('Error uploading program:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Gagal membuat program' },
      { status: 500 }
    );
  }
}
