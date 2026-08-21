'use client';

import { useEffect, useState, useRef } from 'react';
import { updateZakatAdmin } from '@/actions/zakat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCoins,
  faSearch,
  faCheckCircle,
  faTimesCircle,
  faExternalLinkAlt,
  faEdit,
  faFileArrowUp,
  faCommentDots,
  faTableList,
} from '@fortawesome/free-solid-svg-icons';
import CsvImportModal from '@/components/admin/CsvImportModal';
import AdminPagination from '@/components/admin/AdminPagination';
import PesanNoteModal from '@/components/admin/PesanNoteModal';
import DataZakatModal from '@/components/admin/DataZakatModal';
import { formatThousand, parseRawNumber } from '@/lib/formatNumber';
import AdminToast, { ToastState } from '@/components/admin/AdminToast';

type DosenInfo = {
  nip: string;
  nama: string;
  npwp: string | null;
  alamat: string | null;
  unitKerja: string | null;
  noHp: string | null;
};

type ZakatItem = {
  id: string;
  nama: string;
  nip: string | null;
  noHp: string | null;
  dosen: DosenInfo | null;
  tipePembayar: string;
  jenisZakat: string;
  sumberDana: string | null;
  jenisPerusahaan: string | null;
  jumlahZakat: number;
  buktiPembayaran: string | null;
  tanggal: string;
  pesan: string;
  status: string;
};

type Counts = { all: number; pending: number; lunas: number; ditolak: number };

function formatRupiah(angka: number) {
  return 'Rp ' + angka.toLocaleString('id-ID');
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    lunas: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    ditolak: 'bg-red-100 text-red-700 border-red-200',
  };
  const label: Record<string, string> = { lunas: 'Lunas', pending: 'Pending', ditolak: 'Ditolak' };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${map[status] || 'bg-gray-100 text-gray-500'}`}>
      {label[status] || status}
    </span>
  );
}

const ITEMS_PER_PAGE = 10;
const DEBOUNCE_MS = 400;

export default function AdminZakatPage() {
  const [data, setData] = useState<ZakatItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState<Counts>({ all: 0, pending: 0, lunas: 0, ditolak: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'lunas' | 'ditolak'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<ZakatItem | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editNip, setEditNip] = useState('');
  const [editJenis, setEditJenis] = useState('');
  const [editJumlah, setEditJumlah] = useState<number>(0);
  const [editStatus, setEditStatus] = useState('pending');
  const [editPesan, setEditPesan] = useState('');
  const [saving, setSaving] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [selectedPesan, setSelectedPesan] = useState<{
    nama: string;
    kategori: string;
    tanggal: string;
    pesan: string;
  } | null>(null);
  const [selectedZakatItem, setSelectedZakatItem] = useState<ZakatItem | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const latestReqRef = useRef(0);
  // Keep latest values in refs to avoid stale closures in async functions
  const searchRef = useRef(search);
  const filterStatusRef = useRef(filterStatus);
  const currentPageRef = useRef(currentPage);

  async function fetchData(page: number, searchVal: string, statusVal: string) {
    const reqId = ++latestReqRef.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
        search: searchVal,
        status: statusVal,
      });
      const res = await fetch(`/api/admin/zakat?${params}`);
      const json = await res.json();
      if (reqId !== latestReqRef.current) return; // discard stale response
      setData(json.data || []);
      setTotalItems(json.total ?? 0);
      setTotalPages(json.totalPages ?? 1);
      setCounts(json.counts || { all: 0, pending: 0, lunas: 0, ditolak: 0 });
    } finally {
      if (reqId === latestReqRef.current) setLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    fetchData(1, '', 'all');
  }, []);

  function handleSearchChange(val: string) {
    setSearch(val);
    searchRef.current = val;
    setCurrentPage(1);
    currentPageRef.current = 1;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchData(1, val, filterStatusRef.current);
    }, DEBOUNCE_MS);
  }

  function handleStatusChange(status: 'all' | 'pending' | 'lunas' | 'ditolak') {
    setFilterStatus(status);
    filterStatusRef.current = status;
    setCurrentPage(1);
    currentPageRef.current = 1;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    fetchData(1, searchRef.current, status);
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
    currentPageRef.current = page;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    fetchData(page, searchRef.current, filterStatusRef.current);
  }

  async function handleAction(id: string, action: 'approve' | 'reject') {
    await fetch(`/api/admin/zakat/${id}/${action}`, { method: 'PATCH' });
    fetchData(currentPageRef.current, searchRef.current, filterStatusRef.current);
  }

  function openEditModal(item: ZakatItem) {
    setEditingItem(item);
    setEditNama(item.nama);
    setEditNip(item.nip || '');
    setEditJenis(item.jenisZakat);
    setEditJumlah(item.jumlahZakat);
    setEditStatus(item.status);
    setEditPesan(item.pesan === '-' ? '' : item.pesan);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    try {
      await updateZakatAdmin(editingItem.id, {
        nama: editNama,
        nip: editNip,
        jenisZakat: editJenis,
        jumlahZakat: editJumlah,
        status: editStatus,
        pesan: editPesan,
      });
      setEditingItem(null);
      setToast({ message: 'Perubahan data zakat berhasil disimpan.', type: 'success' });
      fetchData(currentPageRef.current, searchRef.current, filterStatusRef.current);
    } catch (err: any) {
      setToast({ message: err.message || 'Gagal menyimpan perubahan', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <FontAwesomeIcon icon={faCoins} className="text-[#063A1E] w-6 h-6" />
            Data Zakat
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Kelola &amp; verifikasi data pembayaran zakat dari Dosen/Pegawai maupun Masyarakat USK.
          </p>
        </div>
        <button
          onClick={() => setIsCsvModalOpen(true)}
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#063A1E] border border-[#063A1E]/30 hover:border-[#063A1E] px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
        >
          <FontAwesomeIcon icon={faFileArrowUp} className="w-3.5 h-3.5" />
          Import CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(
          [
            { key: 'all', label: 'Semua', color: 'bg-gray-100 text-gray-700' },
            { key: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-700' },
            { key: 'lunas', label: 'Lunas', color: 'bg-emerald-100 text-emerald-700' },
            { key: 'ditolak', label: 'Ditolak', color: 'bg-red-100 text-red-700' },
          ] as const
        ).map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => handleStatusChange(key)}
            className={`rounded-xl p-3 text-left transition-all border cursor-pointer ${filterStatus === key
              ? 'border-[#063A1E] shadow-sm ring-1 ring-[#063A1E]/20'
              : 'border-gray-100 hover:border-gray-200'
              } bg-white`}
          >
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</p>
            <p className={`text-xl font-black mt-0.5 px-2 py-0.5 rounded-lg inline-block ${color}`}>
              {counts[key]}
            </p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Cari nama, NIP, atau nama dosen..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:border-[#063A1E] shadow-2xs transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4">Muzakki</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Data Zakat</th>
                <th className="py-3.5 px-4">Bukti</th>
                <th className="py-3.5 px-4">Pesan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    <div className="w-5 h-5 border-2 border-[#063A1E] border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Muzakki — Nama + Tipe + NIP */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900 text-xs">{item.nama}</p>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded capitalize mt-1 inline-block">
                        {item.tipePembayar}
                      </span>
                      {item.nip && (
                        <span className="text-[10px] text-gray-500 font-mono">NIP: {item.nip}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">{item.tanggal}</td>

                    {/* Data Zakat — Tombol Lihat */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => setSelectedZakatItem(item)}
                        className="inline-flex items-center gap-1 text-[#063A1E] underline underline-offset-2 font-semibold hover:text-[#042814] cursor-pointer"
                      >
                        Lihat <FontAwesomeIcon icon={faTableList} className="w-2.5 h-2.5" />
                      </button>
                    </td>

                    {/* Bukti */}
                    <td className="py-3.5 px-4">
                      {item.buktiPembayaran ? (
                        <a
                          href={item.buktiPembayaran}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#063A1E] underline underline-offset-2 font-semibold"
                        >
                          Lihat <FontAwesomeIcon icon={faExternalLinkAlt} className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Pesan */}
                    <td className="py-3.5 px-4">
                      {item.pesan && item.pesan.trim() !== '' && item.pesan.trim() !== '-' ? (
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedPesan({
                              nama: item.nama,
                              kategori: `Zakat ${item.jenisZakat}`,
                              tanggal: item.tanggal,
                              pesan: item.pesan,
                            })
                          }
                          className="inline-flex items-center gap-1 text-[#063A1E] underline underline-offset-2 font-semibold hover:text-[#042814] cursor-pointer"
                        >
                          Lihat <FontAwesomeIcon icon={faCommentDots} className="w-2.5 h-2.5" />
                        </button>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} />
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Data Zakat"
                        >
                          <FontAwesomeIcon icon={faEdit} className="w-3.5 h-3.5" />
                        </button>
                        {item.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAction(item.id, 'approve')}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Approve (Lunas)"
                            >
                              <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction(item.id, 'reject')}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Tolak"
                            >
                              <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
          itemLabel="zakat"
        />
      </div>


      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-sm text-gray-900">Edit Data Pembayaran Zakat</h3>
              <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Pembayar</label>
                <input
                  type="text"
                  required
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#063A1E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">NIP (Dosen / Pegawai)</label>
                <input
                  type="text"
                  value={editNip}
                  onChange={(e) => setEditNip(e.target.value)}
                  placeholder="Kosongkan jika masyarakat umum"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#063A1E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Jenis Zakat</label>
                <input
                  type="text"
                  required
                  value={editJenis}
                  onChange={(e) => setEditJenis(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#063A1E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Jumlah Zakat (Rp)</label>
                <input
                  type="text"
                  required
                  value={formatThousand(editJumlah)}
                  onChange={(e) => setEditJumlah(Number(parseRawNumber(e.target.value)))}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#063A1E] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Status Verifikasi</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#063A1E] bg-white font-semibold"
                >
                  <option value="pending">Pending</option>
                  <option value="lunas">Lunas</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Pesan / Catatan</label>
                <textarea
                  rows={2}
                  value={editPesan}
                  onChange={(e) => setEditPesan(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#063A1E]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#063A1E] hover:bg-[#042814] text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
                >
                  {saving ? 'Simpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onSuccess={() => fetchData(1, searchRef.current, filterStatusRef.current)}
        title="Import Zakat Dosen"
        endpoint="/api/admin/import/zakat"
        requiredColumns={['nip', 'jumlah_zakat', 'jenis_zakat']}
        optionalColumns={['no_hp', 'sumber_dana', 'pesan', 'tanggal']}
        templateRows={[
          ['198501012010121001', '500000', 'profesi', '081200010001', 'gaji', '', '01/15/2025'],
          ['197803152005011002', '250000', 'maal', '081300020002', '', 'Zakat bulan Januari', '01/15/2025'],
        ]}
      />

      {/* Pesan Note Modal */}
      <PesanNoteModal
        isOpen={!!selectedPesan}
        onClose={() => setSelectedPesan(null)}
        nama={selectedPesan?.nama || ''}
        kategori={selectedPesan?.kategori || ''}
        tanggal={selectedPesan?.tanggal}
        pesan={selectedPesan?.pesan || ''}
      />

      {/* Data Zakat Modal */}
      <DataZakatModal
        isOpen={!!selectedZakatItem}
        onClose={() => setSelectedZakatItem(null)}
        item={selectedZakatItem}
      />

      {/* Toast Notification */}
      <AdminToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}