'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NewsletterItem {
  id: string;
  judul: string;
  imageUrl: string;
  tanggal: string;
  createdAt: string;
}

export default function NewsletterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [newsletter, setNewsletter] = useState<NewsletterItem | null>(null);
  const [recentList, setRecentList] = useState<NewsletterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        const res = await fetch(`/api/newsletter/${id}`);
        if (res.ok) {
          const data = await res.json();
          setNewsletter(data.newsletter);
          setRecentList(data.recent || []);
        } else {
          setNewsletter(null);
        }
      } catch (err) {
        console.error('Error loading newsletter detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const handleSidebarSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/newsletter?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1340px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 h-[600px]"></div>
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl p-6 h-40"></div>
            <div className="bg-white rounded-2xl p-6 h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!newsletter) {
    return (
      <div className="min-h-screen bg-white py-16 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Newsletter Tidak Ditemukan</h1>
        <p className="text-gray-500 mb-6">Halaman newsletter yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Link
          href="/newsletter"
          className="inline-block bg-[#0b6330] text-white font-bold px-6 py-2.5 rounded-lg hover:bg-[#084823] transition-colors"
        >
          ← Kembali ke Newsletter
        </Link>
      </div>
    );
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `NEWSLETTER: ${newsletter.judul}`;

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1340px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Kolom Kiri: Detail Newsletter Utama */}
          <main className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-2xs p-6 sm:p-8">
            {/* Judul Utama */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight mb-6 uppercase leading-tight">
              NEWSLETTER: {newsletter.judul}
            </h1>

            {/* Gambar Cover Utama */}
            <div className="w-full bg-gray-50 rounded-xl overflow-hidden mb-6 border border-gray-100 shadow-2xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={newsletter.imageUrl}
                alt={`Newsletter ${newsletter.judul}`}
                className="w-full h-auto object-contain max-h-[1100px]"
              />
            </div>

            {/* Tanggal Terbit */}
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-6">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
              </svg>
              <span>{formatDate(newsletter.tanggal)}</span>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Tombol Bagikan Social Share */}
            <div>
              <p className="font-bold text-gray-900 text-sm mb-3">Bagikan:</p>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-2xs hover:opacity-90 transition-opacity"
                  title="Bagikan ke Instagram"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} - ${currentUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xs hover:opacity-90 transition-opacity"
                  title="Bagikan ke WhatsApp"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-2xs hover:opacity-90 transition-opacity"
                  title="Bagikan ke Facebook"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center shadow-2xs transition-colors relative"
                  title="Salin Link"
                >
                  <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {copied && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[11px] font-semibold px-2 py-1 rounded shadow-xs whitespace-nowrap">
                      Tersalin!
                    </span>
                  )}
                </button>
              </div>
            </div>
          </main>

          {/* Kolom Kanan: Sidebar (Pencarian & Newsletter Terkini) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Box Pencarian */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-6">
              <h2 className="font-extrabold text-gray-900 text-lg mb-4">Pencarian</h2>
              <form onSubmit={handleSidebarSearch} className="flex">
                <input
                  type="text"
                  placeholder="Cari newsletter berdasarkan judul..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 border border-r-0 border-gray-300 rounded-l-xl text-sm focus:outline-none focus:border-[#0b6330]"
                />
                <button
                  type="submit"
                  className="bg-[#ffc800] hover:bg-[#e8b500] text-gray-900 px-4 rounded-r-xl font-bold flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Cari"
                >
                  <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" strokeWidth={2.5} />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth={2.5} />
                  </svg>
                </button>
              </form>
            </div>

            {/* Box Newsletter Terkini */}
            {recentList.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-6">
                <h2 className="font-extrabold text-gray-900 text-lg mb-5">Newsletter Terkini</h2>
                <div className="flex flex-col gap-4">
                  {recentList.map((item) => (
                    <Link
                      key={item.id}
                      href={`/newsletter/${item.id}`}
                      className="group flex gap-3.5 items-center p-1 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      {/* Thumbnail Cover */}
                      <div className="w-16 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.judul}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>

                      {/* Info Text */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-sm text-gray-900 group-hover:text-[#0b6330] transition-colors leading-snug line-clamp-2 mb-1">
                          Newsletter: {item.judul}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                            <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                            <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                            <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                          </svg>
                          <span>{formatDate(item.tanggal)}</span>
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>

        </div>
      </div>
    </div>
  );
}
