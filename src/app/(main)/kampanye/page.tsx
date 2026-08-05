'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface KampanyeItem {
  id: string;
  judul: string;
  deskripsi: string | null;
  imageUrl: string;
  targetDana: number | null;
  terkumpul: number;
  tanggalSelesai: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function PublicKampanyePage() {
  const [items, setItems] = useState<KampanyeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');

  const fetchKampanye = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/kampanye');
      if (res.ok) {
        const data = await res.json();
        setItems(data.kampanyes || []);
      }
    } catch (err) {
      console.error('Error fetching kampanye:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKampanye();
  }, [fetchKampanye]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchQuery);
  };

  const filteredItems = items.filter((item) => {
    if (!activeQuery.trim()) return true;
    return item.judul.toLowerCase().includes(activeQuery.trim().toLowerCase());
  });

  const formatRupiah = (val: number | null) => {
    if (val === null || val === undefined) return '0,00';
    return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  };

  const getDurasiText = (tanggalSelesaiStr: string | null) => {
    if (!tanggalSelesaiStr) return '-';
    try {
      const targetDate = new Date(tanggalSelesaiStr);
      const now = new Date();
      const diffTime = targetDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return 'Selesai';
      return `${diffDays} hari`;
    } catch {
      return '-';
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1340px] mx-auto">

        {/* Page Title & Breadcrumb */}
        <div className="text-center my-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#333333] tracking-tight uppercase mb-4">
            KAMPANYE
          </h1>
          <nav className="flex justify-center items-center gap-2 text-sm text-gray-500 font-medium">
            <Link href="/" className="hover:text-[#0b6330] transition-colors">
              Beranda
            </Link>
            <span>/</span>
            <span className="text-[#0b6330] font-bold">Kampanye</span>
          </nav>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto mb-12 mt-8 flex gap-2.5">
          <input
            type="text"
            placeholder="Cari kampanye berdasarkan judul..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 font-medium focus:outline-none focus:border-[#0b6330] focus:ring-1 focus:ring-[#0b6330] bg-white transition-colors shadow-2xs"
          />
          <button
            type="submit"
            className="bg-[#0b6330] hover:bg-[#074722] text-white font-extrabold text-sm px-6 py-2.5 rounded-lg transition-colors shadow-2xs cursor-pointer shrink-0"
          >
            Cari
          </button>
        </form>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 animate-pulse mb-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden flex flex-col">
                <div className="bg-gray-200 aspect-[16/10] w-full"></div>
                <div className="p-6 flex flex-col flex-1 space-y-4">
                  <div className="bg-gray-200 h-6 w-3/4 rounded-md"></div>
                  <div className="bg-gray-200 h-4 w-1/3 ml-auto rounded-md"></div>
                  <div className="bg-gray-200 h-3 w-full rounded-full"></div>
                  <div className="flex justify-between">
                    <div className="bg-gray-200 h-4 w-24 rounded-md"></div>
                    <div className="bg-gray-200 h-4 w-24 rounded-md"></div>
                  </div>
                  <div className="bg-gray-200 h-11 w-full rounded-xl mt-auto"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200 mb-12 shadow-xs">
            <p className="text-lg font-semibold mb-2">Kampanye tidak ditemukan</p>
            <p className="text-sm text-gray-400">
              {activeQuery ? `Tidak ada hasil untuk "${activeQuery}"` : 'Belum ada kampanye aktif saat ini.'}
            </p>
          </div>
        ) : (
          /* Kampanye Grid (3 Columns) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
            {filteredItems.map((item) => {
              const target = item.targetDana || 0;
              const current = item.terkumpul || 0;
              const rawPct = target > 0 ? (current / target) * 100 : 0;
              const barWidth = rawPct > 0 ? Math.max(1.5, Math.min(100, rawPct)) : 0;
              const durasiText = getDurasiText(item.tanggalSelesai);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Top Cover Image */}
                  <div className="relative aspect-[16/10] w-full bg-gray-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.judul}
                      className="w-full h-full object-cover hover:scale-103 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col flex-1">
                    {/* Title */}
                    <h3 className="font-bold text-[#112b27] text-lg sm:text-[19px] leading-tight mb-5 line-clamp-2 min-h-[48px]">
                      {item.judul}
                    </h3>

                    {/* Durasi */}
                    <div className="flex justify-end items-center mb-3">
                      <div className="text-right">
                        <span className="block text-xs font-semibold text-gray-500">Durasi</span>
                        <span className="block text-xs sm:text-sm font-semibold text-gray-600">{durasiText}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-4">
                      <div
                        className="bg-[#FFBB0C] h-full rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>

                    {/* Terkumpul vs Dana Dibutuhkan */}
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <span className="block text-xs font-semibold text-gray-700">Terkumpul</span>
                        <span className="text-sm font-extrabold text-[#0b6330]">
                          Rp. {formatRupiah(current)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs font-semibold text-gray-700">Dana dibutuhkan</span>
                        <span className="text-sm font-extrabold text-[#0b6330]">
                          Rp. {formatRupiah(target)}
                        </span>
                      </div>
                    </div>

                    {/* Action INFAQ Button */}
                    <Link
                      href={`/infaq?kampanyeId=${item.id}`}
                      className="w-full bg-[#0b6330] hover:bg-[#074722] text-white font-extrabold py-3.5 rounded-xl text-sm transition-all duration-200 text-center tracking-wider uppercase block shadow-sm hover:shadow-md mt-auto"
                    >
                      INFAQ SEKARANG
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
