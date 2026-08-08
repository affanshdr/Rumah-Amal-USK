'use client';

import { useEffect, useState } from 'react';
import { updateInfaqAdmin } from '@/actions/infaq';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHandHoldingHeart,
  faSearch,
  faCheckCircle,
  faTimesCircle,
  faExternalLinkAlt,
  faLink,
  faUnlink,
  faEdit,
  faFileArrowUp,
} from '@fortawesome/free-solid-svg-icons';
import CsvImportModal from '@/components/admin/CsvImportModal';
import AdminPagination from '@/components/admin/AdminPagination';

type DosenInfo = {
  nip: string;
  nama: string;
  npwp: string | null;
  alamat: string | null;
  unitKerja: string | null;
};

type KampanyeOption = {
  id: string;
  judul: string;
};

type InfaqItem = {
  id: string;
  nama: string;
  nip: string | null;
  dosen: DosenInfo | null;
  tipePembayar: string;
  jenisInfaq: string;
  kampanyeId: string | null;
  kampanyeJudul: string | null;
  jumlahInfaq: number;
  buktiPembayaran: string | null;
  tanggal: string;
  pesan: string;
  status: string;
};

function isInfaqBebas(item: InfaqItem): boolean {
  return !item.kampanyeId;
}

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

export default function AdminInfaqPage() {
  const [data, setData] = useState<InfaqItem[]>([]);
  const [kampanyes, setKampanyes] = useState<KampanyeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bebas' | 'terikat'>('bebas');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'lunas' | 'ditolak'>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<InfaqItem | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editNip, setEditNip] = useState('');
  const [editJenis, setEditJenis] = useState('');
  const [editKampanyeId, setEditKampanyeId] = useState<string>('');
  const [editJumlah, setEditJumlah] = useState<number>(0);
  const [editStatus, setEditStatus] = useState('pending');
  const [editPesan, setEditPesan] = useState('');
  const [saving, setSaving] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [resInfaq, resKampanye] = await Promise.all([
        fetch('/api/admin/infaq'),
        fetch('/api/kampanye'),
      ]);
      const jsonInfaq = await resInfaq.json();
      const jsonKampanye = await resKampanye.json();
      setData(jsonInfaq);
      setKampanyes(jsonKampanye.kampanyes || []);
    } catch (err) {
      console.error('Error loading admin infaq:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filterStatus, search]);

  async function handleAction(id: string, action: 'approve' | 'reject') {
    await fetch(`/api/admin/infaq/${id}/${action}`, { method: 'PATCH' });
    loadData();
  }

  function openEditModal(item: InfaqItem) {
    setEditingItem(item);
    setEditNama(item.nama);
    setEditNip(item.nip || '');
    setEditJenis(item.jenisInfaq);
    setEditKampanyeId(item.kampanyeId || '');
    setEditJumlah(item.jumlahInfaq);
    setEditStatus(item.status);
    setEditPesan(item.pesan === '-' ? '' : item.pesan);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    try {
      await updateInfaqAdmin(editingItem.id, {
        nama: editNama,
        nip: editNip,
        jenisInfaq: editJenis,
        kampanyeId: editKampanyeId || null,
        jumlahInfaq: editJumlah,
        status: editStatus,
        pesan: editPesan,
      });
      setEditingItem(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  }

  const tabData = data.filter((item) =>
    activeTab === 'bebas' ? isInfaqBebas(item) : !isInfaqBebas(item)
  );

  const filtered = tabData.filter((item) => {
    const matchSearch =
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      (item.nip && item.nip.includes(search)) ||
      (item.kampanyeJudul && item.kampanyeJudul.toLowerCase().includes(search.toLowerCase())) ||
      (item.dosen?.nama && item.dosen.nama.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === 'all' ? true : item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const bebasCount = data.filter(isInfaqBebas).length;
  const terikatCount = data.filter((i) => !isInfaqBebas(i)).length;

  const counts = {
    all: tabData.length,
    pending: tabData.filter((d) => d.status === 'pending').length,
    lunas: tabData.filter((d) => d.status === 'lunas').length,
    ditolak: tabData.filter((d) => d.status === 'ditolak').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <FontAwesomeIcon icon={faHandHoldingHeart} className="text-[#063A1E] w-6 h-6" />
            Data Infaq
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Kelola data pembayaran infaq. Infaq Bebas tidak terikat kampanye; Infaq Terikat terhubung ke Kampanye tertentu.
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

      {/* Tab Bebas / Terikat */}
      <div className="inline-flex rounded-xl p-1 bg-gray-100/80 shadow-inner gap-1">
        <button
          onClick={() => { setActiveTab('bebas'); setFilterStatus('all'); setSearch(''); }}
          className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'bebas'
            ? 'bg-white text-[#063A1E] shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <FontAwesomeIcon icon={faUnlink} className="w-3 h-3" />
          Infaq Bebas
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 text-[10px]">
            {bebasCount}
          </span>
        </button>
        <button
          onClick={() => { setActiveTab('terikat'); setFilterStatus('all'); setSearch(''); }}
          className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'terikat'
            ? 'bg-white text-[#063A1E] shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <FontAwesomeIcon icon={faLink} className="w-3 h-3" />
          Infaq Terikat
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 text-[10px]">
            {terikatCount}
          </span>
        </button>
      </div>

      {/* Description block */}
      <div className={`text-xs px-4 py-2.5 rounded-xl font-medium border ${activeTab === 'bebas'
        ? 'bg-blue-50 border-blue-100 text-blue-700'
        : 'bg-amber-50 border-amber-100 text-amber-700'
        }`}>
        {activeTab === 'bebas'
          ? '🔓 Infaq Bebas — Pembayar memilih Infaq Rutin / Umum tanpa terikat pada kampanye khusus.'
          : '🔗 Infaq Terikat — Pembayar memilih salah satu Kampanye. Dana dikreditkan ke total terkumpul Kampanye saat diapprove.'}
      </div>

      {/* Status Filter Cards */}
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
            onClick={() => setFilterStatus(key)}
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
          placeholder={activeTab === 'bebas' ? 'Cari nama, NIP, atau jenis infaq...' : 'Cari nama, NIP, atau kampanye...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:border-[#063A1E] shadow-2xs transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4">Nama Pembayar</th>
                {activeTab === 'terikat' && <th className="py-3.5 px-4">Kampanye</th>}
                <th className="py-3.5 px-4">Dosen / Unit</th>
                <th className="py-3.5 px-4">Jenis Infaq</th>
                <th className="py-3.5 px-4">Jumlah</th>
                <th className="py-3.5 px-4">Bukti</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={activeTab === 'terikat' ? 9 : 8} className="text-center py-10 text-gray-400">
                    <div className="w-5 h-5 border-2 border-[#063A1E] border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'terikat' ? 9 : 8} className="text-center py-10 text-gray-400">
                    Tidak ada data infaq {activeTab === 'bebas' ? 'bebas' : 'terikat'} ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Nama Pembayar */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-900">{item.nama}</p>
                      {item.nip && (
                        <span className="inline-block mt-0.5 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                          NIP: {item.nip}
                        </span>
                      )}
                      <span className="block text-[10px] text-gray-400 capitalize mt-0.5">{item.tipePembayar}</span>
                    </td>

                    {/* Kampanye (Terikat) */}
                    {activeTab === 'terikat' && (
                      <td className="py-3.5 px-4">
                        {item.kampanyeJudul ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                            <FontAwesomeIcon icon={faLink} className="w-2.5 h-2.5 text-emerald-600" />
                            {item.kampanyeJudul}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 text-[11px]">
                            <FontAwesomeIcon icon={faUnlink} className="w-2.5 h-2.5 text-gray-300" />
                            Bebas
                          </span>
                        )}
                      </td>
                    )}

                    {/* Dosen Info */}
                    <td className="py-3.5 px-4">
                      {item.dosen ? (
                        <div>
                          <p className="font-semibold text-gray-800">{item.dosen.nama}</p>
                          {item.dosen.unitKerja && (
                            <p className="text-[10px] text-[#063A1E] mt-0.5">{item.dosen.unitKerja}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 capitalize text-gray-700">{item.jenisInfaq}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{formatRupiah(item.jumlahInfaq)}</td>

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

                    <td className="py-3.5 px-4 text-gray-600">{item.tanggal}</td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} />
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Data Infaq"
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
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
          itemLabel="infaq"
        />
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-sm text-gray-900">Edit Data Pembayaran Infaq</h3>
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
                <label className="block text-xs font-bold text-gray-700 mb-1">Relasi Kampanye (Kosong = Infaq Bebas)</label>
                <select
                  value={editKampanyeId}
                  onChange={(e) => setEditKampanyeId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#063A1E] bg-white font-medium"
                >
                  <option value="">-- Tanpa Kampanye (Infaq Bebas) --</option>
                  {kampanyes.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.judul}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Kategori / Jenis Infaq</label>
                <input
                  type="text"
                  required
                  value={editJenis}
                  onChange={(e) => setEditJenis(e.target.value)}
                  placeholder="Contoh: Infak Umum / Sedekah"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#063A1E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Jumlah Infaq (Rp)</label>
                <input
                  type="number"
                  required
                  value={editJumlah}
                  onChange={(e) => setEditJumlah(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#063A1E]"
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
                <label className="block text-xs font-bold text-gray-700 mb-1">Doa / Pesan</label>
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
        onSuccess={() => loadData()}
        title="Import Infaq Dosen"
        endpoint="/api/admin/import/infaq"
        requiredColumns={['nip', 'jumlah_infaq', 'jenis_infaq']}
        optionalColumns={['nama_kampanye', 'no_hp', 'pesan', 'tanggal']}
        templateRows={[
          ['198501012010121001', '150000', 'Infak Umum', '', '0812-0001-0001', 'Infaq rutin', '2025-01-15'],
          ['197803152005011002', '100000', 'Bantuan Bencana USK', 'Bantuan Bencana USK', '', '', '2025-01-20'],
        ]}
      />
    </div>
  );
}