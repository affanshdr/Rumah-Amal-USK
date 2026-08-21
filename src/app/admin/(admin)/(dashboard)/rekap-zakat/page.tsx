'use client';

import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileText,
  faSearch,
  faExternalLinkAlt,
  faTrash,
  faFileArrowUp,
} from '@fortawesome/free-solid-svg-icons';
import CsvImportModal from '@/components/admin/CsvImportModal';
import AdminPagination from '@/components/admin/AdminPagination';
import ConfirmModal from '@/components/admin/ConfirmModal';
import AdminToast, { ToastState } from '@/components/admin/AdminToast';

type RekapItem = {
  id: string;
  dosenNIP: string;
  dosen: { nama: string; unitKerja: string | null } | null;
  tahunRekap: string;
  fileUrl: string;
  createdAt: string;
};

const ITEMS_PER_PAGE = 20;
const DEBOUNCE_MS = 400;

export default function AdminRekapZakatPage() {
  const [data, setData] = useState<RekapItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<RekapItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const latestReqRef = useRef(0);
  const searchRef = useRef(search);

  async function loadData(page = currentPage, searchVal = searchRef.current) {
    const reqId = ++latestReqRef.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
        search: searchVal,
      });
      const res = await fetch(`/api/admin/rekap-zakat?${params}`);
      if (res.ok) {
        const json = await res.json();
        if (reqId !== latestReqRef.current) return;
        setData(json.data || []);
        setTotalItems(json.total ?? 0);
        setTotalPages(json.totalPages ?? 1);
      }
    } catch (err) {
      console.error('Error loading rekap zakat:', err);
    } finally {
      if (reqId === latestReqRef.current) setLoading(false);
    }
  }

  useEffect(() => {
    loadData(1, '');
  }, []);

  function handleSearchChange(val: string) {
    setSearch(val);
    searchRef.current = val;
    setCurrentPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadData(1, val);
    }, DEBOUNCE_MS);
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
    loadData(page, searchRef.current);
  }

  async function handleConfirmDelete() {
    if (!deleteConfirmItem) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/rekap-zakat/${deleteConfirmItem.id}`, { method: 'DELETE' });
      if (res.ok) {
        setToast({ message: 'Data rekap zakat berhasil dihapus.', type: 'success' });
        loadData(currentPage, searchRef.current);
      } else {
        setToast({ message: 'Gagal menghapus data rekap zakat.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Terjadi kesalahan sistem.', type: 'error' });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmItem(null);
    }
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <FontAwesomeIcon icon={faFileText} className="text-[#063A1E] w-6 h-6" />
            Rekap Zakat
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Kelola rekap tahunan zakat dosen — link file PDF/Drive per NIP per tahun.
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

      {/* Search */}
      <div className="relative max-w-md">
        <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Cari NIP, nama dosen, atau tahun..."
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
                <th className="py-3.5 px-4">NIP</th>
                <th className="py-3.5 px-4">Nama Dosen</th>
                <th className="py-3.5 px-4">Unit Kerja</th>
                <th className="py-3.5 px-4">Tahun Rekap</th>
                <th className="py-3.5 px-4">File</th>
                <th className="py-3.5 px-4">Tanggal Input</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    <div className="w-5 h-5 border-2 border-[#063A1E] border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    Tidak ada data rekap zakat ditemukan.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-800">{item.dosenNIP}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      {item.dosen?.nama || <span className="text-gray-400 italic">—</span>}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 max-w-[150px] truncate">
                      {item.dosen?.unitKerja || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block bg-[#063A1E]/10 text-[#063A1E] font-bold px-2.5 py-1 rounded-lg text-[10px]">
                        {item.tahunRekap}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#063A1E] underline underline-offset-2 font-semibold hover:text-emerald-700 transition-colors"
                      >
                        Buka File <FontAwesomeIcon icon={faExternalLinkAlt} className="w-2.5 h-2.5" />
                      </a>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">{item.createdAt}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setDeleteConfirmItem(item)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Hapus Rekap Zakat"
                      >
                        <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                      </button>
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
          itemLabel="rekap zakat"
        />
      </div>

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onSuccess={() => loadData(1, searchRef.current)}
        title="Import Rekap Zakat"
        endpoint="/api/admin/import/rekap-zakat"
        requiredColumns={['nip', 'tahun_rekap', 'file_url']}
        optionalColumns={[]}
        templateRows={[
          ['198501012010121001', '2024', 'https://drive.google.com/file/d/example1'],
          ['197803152005011002', '2024', 'https://drive.google.com/file/d/example2'],
        ]}
      />
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmItem)}
        onClose={() => setDeleteConfirmItem(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Rekap Zakat?"
        message={`Apakah Anda yakin ingin menghapus data rekap zakat tahun ${deleteConfirmItem?.tahunRekap || ''} NIP ${deleteConfirmItem?.dosenNIP || ''}? Data yang dihapus tidak dapat dikembalikan.`}
        confirmText="Hapus Rekap"
        loading={isDeleting}
      />

      {/* Toast Notification */}
      <AdminToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
