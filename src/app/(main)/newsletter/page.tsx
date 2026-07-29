'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface NewsletterItem {
  id: string;
  judul: string;
  imageUrl: string;
  tanggal: string;
  createdAt: string;
}

export default function NewsletterPage() {
  const [items, setItems] = useState<NewsletterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 6;

  const fetchNewsletters = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const cleanQ = q.trim().toLowerCase() === 'newsletter' ? '' : q.trim();
      const res = await fetch(`/api/newsletter?page=${p}&limit=${ITEMS_PER_PAGE}&q=${encodeURIComponent(cleanQ)}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching newsletter:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNewsletters(page, activeQuery);
  }, [page, activeQuery, fetchNewsletters]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveQuery(searchQuery);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1340px] mx-auto">

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-[#2d3238] tracking-tight mb-8">
          NEWSLETTER
        </h1>

        {/* Breadcrumb */}
        <nav className="text-[13.5px] font-semibold mb-8 flex items-center gap-1.5">
          <Link href="/" className="text-gray-700 hover:text-[#0b6330] transition-colors">
            Beranda
          </Link>
          <span className="text-[#0b6330] font-bold">/</span>
          <span className="text-[#0b6330] font-bold">Newsletter</span>
        </nav>

        {/* Form Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-12 flex gap-3">
          <input
            type="text"
            placeholder="Cari news letter berdasarkan judul..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0b6330] transition-colors shadow-2xs"
          />
          <button
            type="submit"
            className="bg-[#0b6330] hover:bg-[#084823] text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            Cari
          </button>
        </form>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse mb-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl p-4 border border-gray-100">
                <div className="bg-gray-200 rounded-xl aspect-[3/4] w-full mb-4"></div>
                <div className="bg-gray-200 h-5 w-3/4 rounded-sm mb-3"></div>
                <div className="bg-gray-200 h-4 w-1/2 rounded-sm"></div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mb-12">
            <p className="text-lg font-semibold mb-2">Newsletter tidak ditemukan</p>
            <p className="text-sm text-gray-400">
              {activeQuery ? `Tidak ada hasil untuk "${activeQuery}"` : 'Belum ada newsletter yang diupload.'}
            </p>
          </div>
        ) : (
          /* Newsletter Grid (3 Kolom sesuai website asli) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/newsletter/${item.id}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-2xs hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer flex flex-col p-4 block"
              >
                {/* Cover Image Container */}
                <div className="relative aspect-[3/4] w-full bg-gray-50 rounded-xl overflow-hidden mb-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={`Newsletter ${item.judul}`}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-xs transition-opacity duration-300">
                      📖 Baca Newsletter
                    </span>
                  </div>
                </div>

                {/* Info Text */}
                <div className="mt-auto px-1">
                  <h3 className="font-extrabold text-[#111827] text-base tracking-tight mb-2 uppercase leading-snug">
                    NEWSLETTER: {item.judul}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {formatDate(item.tanggal)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 text-sm font-bold">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 text-[#0b6330] hover:text-[#084823] disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              &lt; Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  pageNum === page
                    ? 'bg-[#ffc800] text-[#1a1a1a] font-extrabold shadow-2xs'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-[#0b6330]'
                }`}
              >
                {pageNum}
              </button>
            ))}

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

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl p-3 sm:p-4 max-w-3xl max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-3 -right-3 bg-white text-gray-700 hover:text-black w-8 h-8 rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-sm font-bold transition-all hover:scale-110 z-20"
              aria-label="Tutup Modal"
            >
              ✕
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt="Newsletter Fullsize"
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
