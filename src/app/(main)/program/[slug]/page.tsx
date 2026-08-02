'use client';

import { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';

interface ProgramDetail {
  id: string;
  title: string;
  slug: string;
  category: string;
  coverImageUrl: string | null;
  content: string;
  viewsCount: number;
  publishedAt: string | null;
  createdAt: string;
}

export default function PublicProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProgramDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/program');
      if (res.ok) {
        const data = await res.json();
        const list: ProgramDetail[] = data.programs || [];
        const found = list.find((p) => p.slug === slug);
        if (found) {
          setProgram(found);
        }
      }
    } catch (err) {
      console.error('Error fetching program detail:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProgramDetail();
  }, [fetchProgramDetail]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-gray-200 w-3/4 mx-auto rounded mb-6" />
          <div className="h-4 bg-gray-200 w-1/3 mb-8" />
          <div className="h-80 bg-gray-100 rounded-3xl max-w-[420px] mx-auto mb-8" />
          <div className="bg-white rounded-3xl p-8 border border-gray-100 space-y-3">
            <div className="h-4 bg-gray-200 w-full rounded" />
            <div className="h-4 bg-gray-200 w-5/6 rounded" />
            <div className="h-4 bg-gray-200 w-4/6 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-white py-16 px-4 text-center font-sans">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Program Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-6">Program yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Link href="/program" className="px-5 py-2.5 bg-[#0b6330] text-white font-bold rounded-xl text-sm">
          Kembali ke Daftar Program
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]/40 py-8 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto">

        {/* 1. Main Title (Centered, Bold Uppercase) */}
        <div className="text-center my-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#333333] tracking-tight uppercase max-w-4xl mx-auto leading-tight mb-4">
            {program.title}
          </h1>

          {/* 2. Breadcrumb (Left-aligned under Title) */}
          <nav className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-8 max-w-4xl mx-auto">
            <Link href="/" className="hover:text-[#0b6330] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/program" className="hover:text-[#0b6330] transition-colors">
              Program
            </Link>
            <span>/</span>
            <span className="text-[#0b6330] font-bold uppercase truncate max-w-xs sm:max-w-md">
              {program.title}
            </span>
          </nav>
        </div>

        {/* 3. Centered Poster Image Card */}
        {program.coverImageUrl ? (
          <div className="max-w-[420px] mx-auto rounded-[28px] overflow-hidden shadow-lg mb-10 border border-gray-100 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={program.coverImageUrl}
              alt={program.title}
              className="w-full h-auto object-cover rounded-[28px]"
            />
          </div>
        ) : null}

        {/* 4. Rounded White Container for Content (Exact Match to Web Original) */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm border border-gray-100/90 mb-12">
          <div className="prose max-w-none text-gray-800">
            <style>{`
              .program-detail-content p { margin-bottom: 1.25rem; line-height: 1.8; font-size: 1rem; color: #374151; }
              .program-detail-content h1 { font-size: 1.6rem; font-weight: 800; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #111827; }
              .program-detail-content h2 { font-size: 1.3rem; font-weight: 800; margin-top: 1.5rem; margin-bottom: 0.65rem; color: #111827; }
              .program-detail-content h3 { font-size: 1.1rem; font-weight: 800; margin-top: 1.25rem; margin-bottom: 0.5rem; color: #111827; }
              .program-detail-content ul { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.25rem; }
              .program-detail-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.25rem; }
              .program-detail-content li { margin-bottom: 0.35rem; line-height: 1.7; color: #374151; font-size: 0.95rem; }
              .program-detail-content blockquote { border-left: 4px solid #d1d5db; padding-left: 1rem; color: #6b7280; font-style: italic; margin: 1.25rem 0; }
              .program-detail-content a { color: #0b6330; text-decoration: underline; font-weight: 600; }
              .program-detail-content img { max-width: 100%; height: auto; border-radius: 1rem; margin: 1.25rem 0; }
              .program-detail-content strong { font-weight: 800; color: #111827; }
            `}</style>
            <div
              className="program-detail-content"
              dangerouslySetInnerHTML={{ __html: program.content }}
            />
          </div>

          {/* Bottom Back Button */}
          <div className="pt-8 border-t border-gray-100 mt-8 flex justify-between items-center">
            <Link
              href="/program"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0b6330] hover:underline"
            >
              ← Kembali ke Daftar Program
            </Link>

            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link program berhasil disalin!');
                }
              }}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-3.5 py-1.5 rounded-lg border border-gray-200 transition-colors cursor-pointer"
            >
              📋 Salin Link
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
