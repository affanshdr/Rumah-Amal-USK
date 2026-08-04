import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    if (slug) {
      const announcement = await prisma.announcement.findUnique({
        where: { slug },
        include: { tags: true },
      });
      if (!announcement) {
        return NextResponse.json({ error: 'Pengumuman tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ announcement });
    }

    if (id) {
      const announcement = await prisma.announcement.findUnique({
        where: { id },
        include: { tags: true },
      });
      if (!announcement) {
        return NextResponse.json({ error: 'Pengumuman tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ announcement });
    }

    const announcements = await prisma.announcement.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      include: { tags: true },
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('[GET /api/announcements]', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, slug, excerpt, category, coverImageUrl, content, tags } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Judul dan Konten pengumuman wajib diisi.' },
        { status: 400 }
      );
    }

    const generatedSlug =
      slug?.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

    // Format tags jika dikirim sebagai array string
    const tagConnect = Array.isArray(tags)
      ? tags.map((t: string) => ({
          where: { name: t.trim() },
          create: { name: t.trim() },
        }))
      : [];

    const announcement = await prisma.announcement.create({
      data: {
        title,
        slug: generatedSlug,
        excerpt: excerpt || null,
        category: category || 'Umum',
        coverImageUrl: coverImageUrl || null,
        content,
        published: true,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
        tags: {
          connectOrCreate: tagConnect,
        },
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    console.error('[POST /api/announcements]', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
