'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { cariRiwayat } from '@/actions/riwayat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faUserCheck,
  faCoins,
  faHandHoldingHeart,
  faFileInvoice,
  faCalendarAlt,
  faDownload,
  faChevronDown,
  faChevronUp,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';

type RiwayatZakatItem = {
  id: string;
  jenis_zakat: string;
  jumlah_zakat: number;
  sumber_dana?: string | null;
  status: 'pending' | 'lunas' | 'ditolak';
  created_at: Date;
};

type RekapZakatItem = {
  id: string;
  tahunRekap: string;
  fileUrl: string;
  createdAt: Date;
};

type RiwayatInfaqItem = {
  id: string;
  jenis_infaq: string;
  kampanye_judul?: string | null;
  jumlah_infaq: number;
  status: 'pending' | 'lunas' | 'ditolak';
  created_at: Date;
};

export default function RiwayatPage() {
  const [nip, setNip] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    nip: string;
    nama: string | null;
    unitKerja: string | null;
    totalZakatLunas: number;
    totalInfaqLunas: number;
    riwayatZakat: RiwayatZakatItem[];
    rekapZakat: RekapZakatItem[];
    riwayatInfaq: RiwayatInfaqItem[];
  } | null>(null);

  // Rekap Zakat section state
  const [showRekapSection, setShowRekapSection] = useState(false);
  const [selectedTahun, setSelectedTahun] = useState<string>('all');

  async function handleCari(e: React.FormEvent) {
    e.preventDefault();

    if (!nip.trim()) {
      setError('Masukkan NIP / NIDN Anda terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await cariRiwayat(nip);
      if (
        !result.nama &&
        result.riwayatZakat.length === 0 &&
        result.riwayatInfaq.length === 0 &&
        result.rekapZakat.length === 0
      ) {
        setError('Data riwayat pembayaran tidak ditemukan untuk NIP tersebut.');
      } else {
        setData(result);
        setShowRekapSection(false);
        setSelectedTahun('all');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data riwayat.');
    } finally {
      setLoading(false);
    }
  }

  function formatRupiah(angka: number) {
    return 'Rp ' + Number(angka || 0).toLocaleString('id-ID');
  }

  function formatTanggal(date: Date) {
    try {
      return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return String(date);
    }
  }

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      lunas: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      ditolak: 'bg-red-100 text-red-700 border-red-200',
    };
    const labelMap: Record<string, string> = {
      lunas: 'Lunas',
      pending: 'Pending',
      ditolak: 'Ditolak',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${map[status] || 'bg-gray-100 text-gray-500'}`}>
        {labelMap[status] || status}
      </span>
    );
  }

  // List unique years from rekapZakat for filter
  const availableYears = Array.from(
    new Set(data?.rekapZakat.map((item) => item.tahunRekap) || [])
  ).sort((a, b) => b.localeCompare(a));

  const filteredRekapZakat = data?.rekapZakat.filter((item) => {
    if (selectedTahun === 'all') return true;
    return item.tahunRekap === selectedTahun;
  });

  return (
    <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <Sidebar />

        <div className="lg:col-span-9 space-y-6">
          {/* Card Pencarian NIP */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-extrabold text-gray-900 mb-1 flex items-center gap-2">
              <FontAwesomeIcon icon={faSearch} className="text-[#0b6330] w-5 h-5" />
              Cek Riwayat Zakat & Infaq
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Masukkan NIP / NIDN Anda untuk melihat seluruh histori pembayaran zakat, rekap tahunan, serta infaq.
            </p>

            <form onSubmit={handleCari} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="Masukkan NIP / NIDN Anda (Contoh: 1985...)"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0b6330] bg-gray-50/50 focus:bg-white transition-all font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#0b6330] hover:bg-[#074722] text-white font-extrabold px-7 py-3 rounded-xl text-sm shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    Mencari…
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSearch} />
                    Cari Riwayat
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
                ⚠️ {error}
              </div>
            )}
          </div>

          {data && (
            <>
              {/* Header Info Pembayar & Total Nominal (Lunas) */}
              <div className="bg-gradient-to-br from-[#0b6330] to-[#043318] text-white p-6 sm:p-8 rounded-2xl shadow-md space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800/80 pb-5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl shrink-0 border border-white/10">
                      <FontAwesomeIcon icon={faUserCheck} className="text-[#ffc800]" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                        {data.nama || 'Donatur USK'}
                      </h2>
                      <p className="text-xs text-emerald-200 font-mono mt-0.5">
                        NIP: <span className="font-bold text-white">{data.nip}</span>
                        {data.unitKerja && <span className="ml-2 opacity-80">• {data.unitKerja}</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#ffc800]/20 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faCoins} className="text-[#ffc800] w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
                        Total Zakat Lunas
                      </p>
                      <p className="text-xl sm:text-2xl font-black text-white">
                        {formatRupiah(data.totalZakatLunas)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-400/20 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faHandHoldingHeart} className="text-emerald-300 w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
                        Total Infaq Lunas
                      </p>
                      <p className="text-xl sm:text-2xl font-black text-white">
                        {formatRupiah(data.totalInfaqLunas)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* BAGIAN 1: RIWAYAT ZAKAT */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h4 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCoins} className="text-[#0b6330]" />
                    Riwayat Pembayaran Zakat
                  </h4>
                  <span className="text-xs text-gray-400 font-bold">
                    {data.riwayatZakat.length} Transaksi
                  </span>
                </div>

                {data.riwayatZakat.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-700">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold">
                          <th className="py-3 px-4">Tanggal</th>
                          <th className="py-3 px-4">Jenis Zakat</th>
                          <th className="py-3 px-4">Sumber Dana</th>
                          <th className="py-3 px-4">Jumlah</th>
                          <th className="py-3 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {data.riwayatZakat.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="py-3 px-4 whitespace-nowrap text-gray-600 font-medium">
                              {formatTanggal(item.created_at)}
                            </td>
                            <td className="py-3 px-4 font-bold capitalize text-gray-900">
                              {item.jenis_zakat}
                            </td>
                            <td className="py-3 px-4 text-gray-500">
                              {item.sumber_dana || '—'}
                            </td>
                            <td className="py-3 px-4 font-bold text-[#0b6330]">
                              {formatRupiah(item.jumlah_zakat)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {statusBadge(item.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic py-4 text-center">
                    Belum ada riwayat pembayaran zakat.
                  </p>
                )}
              </div>

              {/* BAGIAN 2: REKAP ZAKAT (DI BAWAH RIWAYAT ZAKAT) */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header dengan Tombol / Link "Lihat Rekap Zakat" */}
                <div className="p-6 sm:p-8 bg-gradient-to-r from-emerald-50 via-white to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
                  <div>
                    <h4 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                      <FontAwesomeIcon icon={faFileInvoice} className="text-[#0b6330]" />
                      Rekap Zakat Tahunan
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Unduh dan tinjau berkas bukti rekapitulasi zakat resmi dari Rumah Amal USK.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowRekapSection((prev) => !prev)}
                    className="inline-flex items-center justify-center gap-2 bg-[#0b6330] hover:bg-[#074722] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    <span>{showRekapSection ? 'Sembunyikan Rekap' : 'Lihat Rekap Zakat'}</span>
                    <FontAwesomeIcon icon={showRekapSection ? faChevronUp : faChevronDown} className="w-3 h-3" />
                  </button>
                </div>

                {/* Konten Rekap Zakat dengan Filter Berdasarkan Tahun Rekap */}
                {showRekapSection && (
                  <div className="p-6 sm:p-8 bg-gray-50/50 space-y-5 animate-fadeIn">
                    {/* Filter Tahun Rekap */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-[#0b6330]" />
                        <span>Filter Tahun Rekap Zakat:</span>
                      </div>

                      <select
                        value={selectedTahun}
                        onChange={(e) => setSelectedTahun(e.target.value)}
                        className="px-3.5 py-2 border border-gray-300 rounded-xl text-xs font-bold bg-white text-gray-800 focus:outline-none focus:border-[#0b6330] cursor-pointer"
                      >
                        <option value="all">Semua Tahun</option>
                        {availableYears.map((yr) => (
                          <option key={yr} value={yr}>
                            Tahun {yr}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Daftar File Rekap Zakat */}
                    {filteredRekapZakat && filteredRekapZakat.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredRekapZakat.map((rekap) => (
                          <div
                            key={rekap.id}
                            className="bg-white p-4 rounded-xl border border-gray-200 hover:border-[#0b6330] transition-colors shadow-2xs flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#0b6330] flex items-center justify-center shrink-0">
                                <FontAwesomeIcon icon={faFileInvoice} className="w-5 h-5" />
                              </div>
                              <div>
                                <h5 className="font-extrabold text-sm text-gray-900">
                                  Rekap Zakat Tahun {rekap.tahunRekap}
                                </h5>
                                <p className="text-[11px] text-gray-400 font-medium">
                                  Diupload: {formatTanggal(rekap.createdAt)}
                                </p>
                              </div>
                            </div>

                            <a
                              href={rekap.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-2 bg-[#0b6330] hover:bg-[#074722] text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0 shadow-2xs"
                            >
                              <FontAwesomeIcon icon={faDownload} className="w-3 h-3" />
                              Buka PDF
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-white rounded-xl border border-gray-200 text-gray-400">
                        <p className="text-xs font-semibold">
                          Belum ada data berkas rekap zakat untuk tahun yang dipilih ({selectedTahun === 'all' ? 'Semua Tahun' : selectedTahun}).
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* BAGIAN 3: RIWAYAT INFAQ (DI BAWAH REKAP ZAKAT) */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h4 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                    <FontAwesomeIcon icon={faHandHoldingHeart} className="text-[#0b6330]" />
                    Riwayat Pembayaran Infaq
                  </h4>
                  <span className="text-xs text-gray-400 font-bold">
                    {data.riwayatInfaq.length} Transaksi
                  </span>
                </div>

                {data.riwayatInfaq.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-gray-700">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-bold">
                          <th className="py-3 px-4">Tanggal</th>
                          <th className="py-3 px-4">Jenis Infaq / Kampanye</th>
                          <th className="py-3 px-4">Jumlah</th>
                          <th className="py-3 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {data.riwayatInfaq.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="py-3 px-4 whitespace-nowrap text-gray-600 font-medium">
                              {formatTanggal(item.created_at)}
                            </td>
                            <td className="py-3 px-4 text-gray-900">
                              <p className="font-bold capitalize">{item.jenis_infaq}</p>
                              {item.kampanye_judul && (
                                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                                  Program: {item.kampanye_judul}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4 font-bold text-[#0b6330]">
                              {formatRupiah(item.jumlah_infaq)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {statusBadge(item.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic py-4 text-center">
                    Belum ada riwayat pembayaran infaq.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}