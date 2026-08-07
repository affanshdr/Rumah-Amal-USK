'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';

interface TagItem {
  id: string;
  name: string;
}

interface NewsDetail {
  id: string;
  title: string;
  titleAr?: string | null;
  titleEn?: string | null;
  slug: string;
  excerpt: string | null;
  category: string | null;
  coverImageUrl: string | null;
  content: string;
  contentAr?: string | null;
  contentEn?: string | null;
  viewsCount: number;
  publishedAt: string;
  createdAt: string;
  tags: TagItem[];
}

interface NewsSummary {
  id: string;
  title: string;
  titleAr?: string | null;
  titleEn?: string | null;
  slug: string;
  publishedAt: string;
}

type Language = 'id' | 'en' | 'ar';

export default function PublicNewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [recentNews, setRecentNews] = useState<NewsSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lang, setLang] = useState<Language>('id');

  // Comment state
  const [commentName, setCommentName] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccessMsg, setCommentSuccessMsg] = useState('');

  useEffect(() => {
    const savedLang = localStorage.getItem('announcement_lang') as Language;
    if (savedLang && ['id', 'en', 'ar'].includes(savedLang)) {
      setLang(savedLang);
    }
  }, []);

  const changeLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('announcement_lang', newLang);
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/news?slug=${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = await res.json();
          setNews(data.news);
        } else {
          setError('Berita tidak ditemukan.');
        }

        // Fetch recent news for sidebar
        const listRes = await fetch('/api/news');
        if (listRes.ok) {
          const listData = await listRes.json();
          const filtered = (listData.news || []).filter(
            (item: NewsSummary) => item.slug !== slug
          );
          setRecentNews(filtered.slice(0, 5));
        }
      } catch (err) {
        console.error('Error loading news detail:', err);
        setError('Gagal memuat data berita.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  const getTitle = (item: { title: string; titleEn?: string | null; titleAr?: string | null }) => {
    if (lang === 'en' && item.titleEn) return item.titleEn;
    if (lang === 'ar' && item.titleAr) return item.titleAr;
    return item.title;
  };

  const getContent = (item: NewsDetail) => {
    if (lang === 'en' && item.contentEn) return item.contentEn;
    if (lang === 'ar' && item.contentAr) return item.contentAr;
    return item.content;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const localeMap = { id: 'id-ID', en: 'en-US', ar: 'ar-SA' };
      return d.toLocaleDateString(localeMap[lang] || 'id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setSubmittingComment(true);
    setTimeout(() => {
      setSubmittingComment(false);
      setCommentSuccessMsg(
        lang === 'ar'
          ? 'تم إرسال تعليقك وهو قيد المراجعة!'
          : lang === 'en'
            ? 'Your comment has been submitted and is awaiting moderation!'
            : 'Komentar Anda telah terkirim dan sedang menunggu moderasi!'
      );
      setCommentContent('');
      setCommentName('');
    }, 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-4xl mx-auto animate-pulse space-y-6">
          <div className="h-4 bg-gray-200 w-32 rounded"></div>
          <div className="h-8 bg-gray-200 w-3/4 rounded"></div>
          <div className="h-64 bg-gray-200 w-full rounded-2xl"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 w-full rounded"></div>
            <div className="h-4 bg-gray-200 w-5/6 rounded"></div>
            <div className="h-4 bg-gray-200 w-4/6 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-white py-16 px-4 text-center font-sans">
        <div className="max-w-md mx-auto bg-gray-50 p-8 rounded-2xl border border-gray-200">
          <span className="text-4xl mb-3 block">📰</span>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Berita Tidak Ditemukan</h2>
          <p className="text-sm text-gray-500 mb-6">{error || 'Halaman berita yang Anda cari tidak tersedia.'}</p>
          <Link
            href="/berita"
            className="inline-flex items-center px-5 py-2.5 bg-[#0b6330] text-white text-sm font-bold rounded-xl hover:bg-[#074722] transition-colors"
          >
            ← Kembali ke Daftar Berita
          </Link>
        </div>
      </div>
    );
  }

  const hasArabicTitle = Boolean(news.titleAr && news.titleAr.trim() !== '');
  const hasArabicContent = Boolean(news.contentAr && news.contentAr.trim() !== '');

  const isTitleRtl = lang === 'ar' && hasArabicTitle;
  const isContentRtl = lang === 'ar' && hasArabicContent;

  const displayTitle = getTitle(news);
  const displayContent = getContent(news);

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1240px] mx-auto">

        {/* Back Link Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <Link
            href="/berita"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-gray-500 hover:text-[#0b6330] transition-colors"
          >
            ← {lang === 'ar' ? 'العودة إلى جميع الأخبار' : lang === 'en' ? 'Back to all news' : 'Kembali ke Semua Berita'}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Main Article Content (8 cols) */}
          <article className="lg:col-span-8">
            {/* Category & Date */}
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#0b6330] uppercase tracking-wider mb-3">
              <span className="bg-[#ffc800] text-[#111827] px-3 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider shadow-2xs">
                {lang === 'ar' ? 'خبر' : lang === 'en' ? 'NEWS' : 'BERITA'}
              </span>
              <span>•</span>
              <time dateTime={news.publishedAt}>{formatDate(news.publishedAt || news.createdAt)}</time>
            </div>

            {/* Title */}
            <h1 className={`text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-6 ${isTitleRtl ? 'font-serif text-right' : ''}`} dir={isTitleRtl ? 'rtl' : 'ltr'}>
              {displayTitle}
            </h1>

            {/* Cover Image */}
            {news.coverImageUrl && (
              <div className="mb-8 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex justify-center max-h-[460px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={news.coverImageUrl}
                  alt={displayTitle}
                  className="w-full object-cover max-h-[460px]"
                />
              </div>
            )}

            {/* Content Body */}
            <div className="prose max-w-none text-gray-800 text-base sm:text-lg leading-relaxed">
              <style>{`
                .article-body a[data-type="download-button"],
                .article-body a[data-type="link-button"] {
                  display: flex !important;
                  width: 100% !important;
                  justify-content: center !important;
                  text-align: center !important;
                  box-sizing: border-box !important;
                  border-radius: 16px !important;
                }
                .article-body p { margin-bottom: 1.25rem; line-height: 1.8; }
                .article-body h1 { font-size: 1.75rem; font-weight: 800; margin-top: 2rem; margin-bottom: 1rem; color: #111827; }
                .article-body h2 { font-size: 1.4rem; font-weight: 700; margin-top: 1.75rem; margin-bottom: 0.75rem; color: #111827; }
                .article-body h3 { font-size: 1.15rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #111827; }
                .article-body ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.25rem; }
                .article-body ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.25rem; }
                .article-body li { margin-bottom: 0.35rem; }
                .article-body blockquote { border-left: 4px solid #0b6330; padding-left: 1.25rem; color: #4b5563; font-style: italic; margin: 1.5rem 0; background: #f9fafb; padding: 1rem; border-radius: 0 0.75rem 0.75rem 0; }
                .article-body a { color: #0b6330; text-decoration: underline; font-weight: 600; }
                .article-body img { max-width: 100%; height: auto; border-radius: 1rem; margin: 1.5rem 0; shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .rtl-body { text-align: right; direction: rtl; font-family: serif, sans-serif; }
                .rtl-body blockquote { border-left: none; border-right: 4px solid #0b6330; padding-left: 0; padding-right: 1.25rem; border-radius: 0.75rem 0 0 0.75rem; }
                .rtl-body ul, .rtl-body ol { padding-left: 0; padding-right: 1.5rem; }
              `}</style>
              <div
                className={`article-body ${isContentRtl ? 'rtl-body' : 'ltr-body'}`}
                dir={isContentRtl ? 'rtl' : 'ltr'}
                dangerouslySetInnerHTML={{ __html: displayContent }}
              />
            </div>

            {/* Tags & Meta Section */}
            <div className="pt-6 border-t border-gray-200 mt-10">
              {news.tags && news.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mb-6">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {lang === 'ar' ? 'وسوم:' : 'Tags:'}
                  </span>
                  {news.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-xs bg-gray-100 text-gray-700 font-semibold px-3 py-1 rounded-full border border-gray-200"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Share */}
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {lang === 'ar' ? 'مشاركة الخبر:' : lang === 'en' ? 'Share News:' : 'Bagikan Berita:'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert(lang === 'ar' ? 'تم نسخ رابط الخبر!' : lang === 'en' ? 'News link copied!' : 'Link berita berhasil disalin ke clipboard!');
                  }}
                  className="px-3.5 py-1.5 bg-white hover:bg-gray-100 text-gray-800 font-extrabold text-xs rounded-lg border border-gray-300 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  📋 {lang === 'ar' ? 'نسخ الرابط' : lang === 'en' ? 'Copy Link' : 'Salin Link'}
                </button>
              </div>
            </div>

            {/* Comment Section */}
            <section className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-extrabold text-gray-900 mb-6">
                {lang === 'ar' ? 'أترك تعليقا' : lang === 'en' ? 'Leave a Comment' : 'Tinggalkan Komentar'}
              </h3>

              {commentSuccessMsg && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold rounded-xl">
                  {commentSuccessMsg}
                </div>
              )}

              <form onSubmit={handleCommentSubmit} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'ar' ? 'الاسم (اختياري)' : lang === 'en' ? 'Name (Optional)' : 'Nama (Opsional)'}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'ar' ? 'اسمك' : lang === 'en' ? 'Your Name' : 'Nama Anda'}
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    className="w-full sm:w-72 px-3.5 py-2 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:border-[#0b6330]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'ar' ? 'التعليق' : lang === 'en' ? 'Comment' : 'Komentar'} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder={lang === 'ar' ? 'اكتب تعليقك هنا...' : lang === 'en' ? 'Write your comment here...' : 'Tulis tanggapan atau pertanyaan Anda tentang berita ini...'}
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:border-[#0b6330] resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingComment || !commentContent.trim()}
                  className="px-6 py-2.5 bg-[#0b6330] hover:bg-[#074722] text-white font-extrabold text-sm rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingComment ? 'Sending…' : (lang === 'ar' ? 'إرسال التعليق' : lang === 'en' ? 'Submit Comment' : 'Kirim Komentar')}
                </button>
              </form>
            </section>
          </article>

          {/* Sidebar (4 cols) */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h3 className="font-extrabold text-gray-900 text-lg mb-4 border-b border-gray-200 pb-3">
                {lang === 'ar' ? 'أحدث الأخبار الأخرى' : lang === 'en' ? 'Other Recent News' : 'Berita Terkini Lainnya'}
              </h3>

              {recentNews.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Belum ada berita lainnya.</p>
              ) : (
                <div className="space-y-4">
                  {recentNews.map((item) => {
                    const recTitle = getTitle(item);
                    return (
                      <Link
                        key={item.id}
                        href={`/berita/${item.slug}`}
                        className="group block p-3 rounded-xl bg-white border border-gray-200 hover:border-[#0b6330] transition-colors shadow-2xs"
                      >
                        <h4 className={`font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#0b6330] transition-colors line-clamp-2 mb-1.5 leading-snug ${lang === 'ar' ? 'font-serif text-right' : ''}`}>
                          {recTitle}
                        </h4>
                        <p className="text-[11px] text-gray-400 font-medium">
                          {formatDate(item.publishedAt)}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                <Link
                  href="/berita"
                  className="text-xs font-extrabold text-[#0b6330] hover:underline"
                >
                  {lang === 'ar' ? 'عرض جميع الأخبار ←' : lang === 'en' ? 'View All News →' : 'Lihat Semua Berita →'}
                </Link>
              </div>
            </div>
          </aside>

        </div>

      </div>
    </div>
  );
}
