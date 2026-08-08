import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { autoTranslateAll } from '@/lib/translate';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    if (slug) {
      const newsItem = await prisma.news.findUnique({
        where: { slug },
        include: {
          tags: true,
          comments: {
            where: { isApproved: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      if (!newsItem) {
        return NextResponse.json({ error: 'Berita tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ news: newsItem });
    }

    if (id) {
      const newsItem = await prisma.news.findUnique({
        where: { id },
        include: {
          tags: true,
          comments: {
            where: { isApproved: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      if (!newsItem) {
        return NextResponse.json({ error: 'Berita tidak ditemukan' }, { status: 404 });
      }
      return NextResponse.json({ news: newsItem });
    }

    const newsList = await prisma.news.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      include: { tags: true },
    });

    return NextResponse.json({ news: newsList });
  } catch (error) {
    console.error('[GET /api/news]', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { title, titleAr, titleEn, slug, excerpt, category, coverImageUrl, content, contentAr, contentEn, tags } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Judul dan Konten berita wajib diisi.' },
        { status: 400 }
      );
    }

    if (!titleEn || !titleAr || !contentEn || !contentAr) {
      try {
        const translated = await autoTranslateAll({
          title,
          excerpt: excerpt || '',
          content,
        });
        if (!titleEn) titleEn = translated.titleEn || null;
        if (!titleAr) titleAr = translated.titleAr || null;
        if (!contentEn) contentEn = translated.contentEn || null;
        if (!contentAr) contentAr = translated.contentAr || null;
      } catch (err) {
        console.error('Auto translate API news error:', err);
      }
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

    const newsItem = await prisma.news.create({
      data: {
        title: title.trim(),
        titleAr: titleAr || null,
        titleEn: titleEn || null,
        slug: generatedSlug,
        excerpt: excerpt || null,
        category: category || 'Berita',
        coverImageUrl: coverImageUrl || null,
        content,
        contentAr: contentAr || null,
        contentEn: contentEn || null,
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

    return NextResponse.json({ success: true, news: newsItem });
  } catch (error) {
    console.error('[POST /api/news]', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
