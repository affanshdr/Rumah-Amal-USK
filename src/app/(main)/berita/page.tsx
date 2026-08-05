'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  coverImageUrl: string | null;
  publishedAt: string;
  createdAt: string;
}

export default function PublicNewsListPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news');
      if (res.ok) {
        const data = await res.json();
        setItems(data.news || []);
      }
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveQuery(searchQuery);
  };

  const filteredItems = items.filter((item) => {
    if (!activeQuery.trim()) return true;
    return item.title.toLowerCase().includes(activeQuery.trim().toLowerCase());
  });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = filteredItems.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1340px] mx-auto">

        {/* Big Page Title & Breadcrumb */}
        <div className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#374151] tracking-tight uppercase mb-6">
            BERITA
          </h1>

          {/* Breadcrumb */}
          <div className="flex items-center justify-start max-w-5xl mx-auto gap-2 text-sm font-extrabold mb-8 text-[#374151]">
            <Link href="/" className="hover:text-[#0b6330] transition-colors">
              Beranda
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-[#0b6330]">Berita</span>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto mb-14 flex gap-2.5">
          <input
            type="text"
            placeholder="Cari berita berdasarkan judul..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md text-sm text-gray-700 font-medium focus:outline-none focus:border-[#0b6330] focus:ring-1 focus:ring-[#0b6330] transition-colors shadow-2xs"
          />
          <button
            type="submit"
            className="bg-[#0b6330] hover:bg-[#074722] text-white font-bold text-sm px-6 py-2.5 rounded-md transition-colors shadow-2xs cursor-pointer shrink-0"
          >
            Cari
          </button>
        </form>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 animate-pulse mb-12">
            {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden flex flex-col">
                <div className="bg-gray-200 aspect-[16/10] w-full"></div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="bg-gray-200 h-5 w-24 rounded-md mb-3"></div>
                  <div className="bg-gray-200 h-5 w-3/4 rounded-sm mb-3"></div>
                  <div className="bg-gray-200 h-4 w-1/2 rounded-sm mt-auto"></div>
                </div>
              </div>
            ))}
          </div>
        ) : paginatedItems.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mb-12">
            <p className="text-lg font-semibold mb-2">Berita tidak ditemukan</p>
            <p className="text-sm text-gray-400">
              {activeQuery ? `Tidak ada hasil untuk "${activeQuery}"` : 'Belum ada berita yang dipublikasikan.'}
            </p>
          </div>
        ) : (
          /* News Grid (3 Kolom persis seperti website asli) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {paginatedItems.map((item) => (
              <Link
                key={item.id}
                href={`/berita/${item.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
              >
                {/* Cover Image 100% Full Width di Bagian Atas Card */}
                <div className="relative aspect-[16/10] w-full bg-gray-50 overflow-hidden">
                  {item.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.coverImageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full relative bg-gradient-to-br from-[#064e26] via-[#0b6330] to-[#043319] overflow-hidden flex items-center justify-center p-6">
                      <div className="absolute -right-8 -top-8 w-36 h-36 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />
                      <div className="absolute -left-8 -bottom-8 w-36 h-36 bg-[#ffc800]/15 rounded-full blur-xl pointer-events-none" />

                      <div className="relative z-10 flex flex-col items-center justify-center text-center group-hover:scale-105 transition-transform duration-300">
                        <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-md border border-white/40 flex items-center justify-center mb-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/logo/rumah-amal.png"
                            alt="Rumah Amal USK"
                            className="h-7 sm:h-8 w-auto object-contain"
                          />
                        </div>
                        <span className="text-[10px] font-extrabold text-[#ffc800] tracking-widest uppercase mt-0.5 drop-shadow-2xs">
                          BERITA RESMI
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Body Content Card */}
                <div className="p-5 flex flex-col flex-1">
                  {/* Badge Kategori Kuning (Khas Berita Website Asli) */}
                  <div className="mb-3">
                    <span className="inline-block bg-[#ffc800] text-[#111827] text-[11px] font-extrabold px-3 py-1 rounded-md uppercase tracking-wider shadow-2xs">
                      BERITA
                    </span>
                  </div>

                  {/* Title & Date */}
                  <div className="flex flex-col justify-between flex-1">
                    <h3 className="font-bold text-[#112b27] text-sm sm:text-base leading-tight mb-3 line-clamp-4 group-hover:text-[#0b6330] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-auto">
                      {formatDate(item.publishedAt || item.createdAt)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-8 text-sm font-bold flex-wrap">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 text-[#0b6330] hover:text-[#084823] disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              &lt; Previous
            </button>

            {(() => {
              const pages: (number | string)[] = [];
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                if (page > 3) pages.push('...1');
                const start = Math.max(2, page - 1);
                const end = Math.min(totalPages - 1, page + 1);
                for (let i = start; i <= end; i++) pages.push(i);
                if (page < totalPages - 2) pages.push('...2');
                pages.push(totalPages);
              }

              return pages.map((p, idx) => {
                if (typeof p === 'string') {
                  return (
                    <span key={`dots-${idx}`} className="w-8 h-9 flex items-center justify-center text-gray-400 font-semibold select-none">
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      p === page
                        ? 'bg-[#ffc800] text-[#1a1a1a] font-extrabold shadow-2xs'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-[#0b6330]'
                    }`}
                  >
                    {p}
                  </button>
                );
              });
            })()}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-[#0b6330] hover:text-[#084823] disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Next &gt;
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
