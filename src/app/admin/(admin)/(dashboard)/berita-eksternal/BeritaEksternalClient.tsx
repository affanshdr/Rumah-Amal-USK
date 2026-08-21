'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import ConfirmModal from '@/components/admin/ConfirmModal';

interface NewsLinkItem {
  id: string;
  url: string;
  title: string;
  image: string | null;
  description: string | null;
  source: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PreviewData {
  url: string;
  title: string;
  image: string | null;
  description: string | null;
  source: string | null;
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold transition-all animate-in slide-in-from-top-2 duration-300 ${
        toast.type === 'success'
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}
    >
      <span>
        {toast.type === 'success' ? '✓' : '✕'}
      </span>
      <span>{toast.message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 cursor-pointer text-lg leading-none">
        ×
      </button>
    </div>
  );
}

function ImagePlaceholder() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 gap-2">
      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-xs text-gray-400 font-medium">Tidak ada gambar</span>
    </div>
  );
}

export default function BeritaEksternalClient({
  initialData,
}: {
  initialData: NewsLinkItem[];
}) {
  const [items, setItems] = useState<NewsLinkItem[]>(initialData);
  const [urlInput, setUrlInput] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [previewError, setPreviewError] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [savingNew, setSavingNew] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<NewsLinkItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  async function handleFetchPreview() {
    if (!urlInput.trim()) return;
    setLoadingPreview(true);
    setPreview(null);
    setPreviewError('');

    try {
      const res = await fetch('/api/admin/news-link/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPreviewError(data.error || 'Gagal mengambil preview.');
      } else {
        setPreview(data.preview);
        setEditTitle(data.preview.title || '');
        setEditDesc(data.preview.description || '');
      }
    } catch {
      setPreviewError('Terjadi kesalahan jaringan. Coba lagi.');
    } finally {
      setLoadingPreview(false);
    }
  }

  function handleReset() {
    setUrlInput('');
    setPreview(null);
    setPreviewError('');
    setEditTitle('');
    setEditDesc('');
  }

  async function handleSave() {
    if (!preview || !editTitle.trim()) return;
    setSavingNew(true);
    try {
      const res = await fetch('/api/admin/news-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: preview.url,
          title: editTitle.trim(),
          image: preview.image,
          description: editDesc.trim() || null,
          source: preview.source,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Gagal menyimpan.', 'error');
      } else {
        setItems((prev) => [data.newsLink, ...prev]);
        showToast('Berita berhasil ditambahkan!', 'success');
        handleReset();
      }
    } catch {
      showToast('Terjadi kesalahan. Coba lagi.', 'error');
    } finally {
      setSavingNew(false);
    }
  }

  async function handleToggleActive(item: NewsLinkItem) {
    setTogglingId(item.id);
    try {
      const res = await fetch(`/api/admin/news-link/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isActive: !item.isActive } : i))
        );
        showToast(
          !item.isActive ? 'Berita diaktifkan.' : 'Berita dinonaktifkan.',
          'success'
        );
      } else {
        showToast(data.error || 'Gagal mengubah status.', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan.', 'error');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteConfirmItem) return;
    const id = deleteConfirmItem.id;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/news-link/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        showToast('Berita berhasil dihapus.', 'success');
      } else {
        const data = await res.json();
        showToast(data.error || 'Gagal menghapus.', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan.', 'error');
    } finally {
      setDeletingId(null);
      setDeleteConfirmItem(null);
    }
  }

  return (
    <>
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* ===== Form Tambah Berita ===== */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
        <h2 className="text-base font-black text-gray-800">Tambah Berita Eksternal</h2>

        {/* URL Input */}
        <div className="flex gap-3">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFetchPreview()}
            placeholder="Paste URL berita di sini..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#063A1E]/20 focus:border-[#063A1E] transition-all"
            disabled={loadingPreview}
          />
          <button
            onClick={handleFetchPreview}
            disabled={loadingPreview || !urlInput.trim()}
            className="px-5 py-2.5 bg-[#063A1E] hover:bg-[#0b5c30] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            {loadingPreview ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Mengambil...
              </>
            ) : (
              'Ambil Preview'
            )}
          </button>
        </div>

        {/* Error state */}
        {previewError && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-700">{previewError}</p>
              <p className="text-xs text-red-500 mt-0.5">Kamu tetap bisa mengisi judul secara manual dan menyimpan tanpa gambar.</p>
              <button
                onClick={() => {
                  setPreviewError('');
                  setPreview({ url: urlInput.trim(), title: '', image: null, description: null, source: null });
                  setEditTitle('');
                  setEditDesc('');
                }}
                className="mt-2 text-xs font-bold text-red-600 underline cursor-pointer"
              >
                Isi manual →
              </button>
            </div>
          </div>
        )}

        {/* Preview Card */}
        {preview && (
          <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-[280px_1fr] gap-0">
              {/* Gambar */}
              <div className="relative aspect-video sm:aspect-auto sm:h-full min-h-[160px] bg-gray-100 border-b sm:border-b-0 sm:border-r border-gray-200 overflow-hidden">
                {preview.image ? (
                  <img
                    src={preview.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImagePlaceholder />
                )}
              </div>

              {/* Form Edit */}
              <div className="p-5 flex flex-col gap-4">
                {preview.source && (
                  <span className="self-start px-2.5 py-1 bg-[#063A1E]/10 text-[#063A1E] text-xs font-bold rounded-lg">
                    {preview.source}
                  </span>
                )}

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Judul <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#063A1E]/20 focus:border-[#063A1E] transition-all"
                    placeholder="Judul berita..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Deskripsi
                  </label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#063A1E]/20 focus:border-[#063A1E] transition-all"
                    placeholder="Deskripsi singkat..."
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={savingNew || !editTitle.trim()}
                    className="flex-1 py-2.5 bg-[#063A1E] hover:bg-[#0b5c30] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {savingNew ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Berita'
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-100 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== Daftar Berita Tersimpan ===== */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-black text-gray-800">
            Daftar Berita ({items.length})
          </h2>
          <span className="text-xs text-gray-400 font-medium">
            {items.filter((i) => i.isActive).length} aktif · {items.filter((i) => !i.isActive).length} nonaktif
          </span>
        </div>

        {items.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-sm font-semibold">Belum ada berita ditambahkan</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-4 p-5 hover:bg-gray-50/60 transition-colors">
                {/* Thumbnail */}
                <div className="relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImagePlaceholder />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {item.source && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-md uppercase tracking-wide flex-shrink-0">
                        {item.source}
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md flex-shrink-0 ${
                        item.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}
                    >
                      {item.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>
                  )}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-500 hover:underline mt-0.5 block truncate"
                  >
                    {item.url}
                  </a>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Toggle aktif/nonaktif */}
                  <button
                    onClick={() => handleToggleActive(item)}
                    disabled={togglingId === item.id}
                    title={item.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all cursor-pointer disabled:opacity-50 ${
                      item.isActive
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                        : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {togglingId === item.id ? (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.isActive ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} />
                      </svg>
                    )}
                  </button>

                  {/* Hapus */}
                  <button
                    onClick={() => setDeleteConfirmItem(item)}
                    disabled={deletingId === item.id}
                    title="Hapus"
                    className="w-8 h-8 rounded-xl flex items-center justify-center border border-red-100 bg-red-50 text-red-400 hover:bg-red-100 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === item.id ? (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmItem)}
        onClose={() => setDeleteConfirmItem(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Berita Eksternal?"
        message={`Apakah Anda yakin ingin menghapus "${deleteConfirmItem?.title || 'berita ini'}"? Data yang dihapus tidak dapat dikembalikan.`}
        confirmText="Hapus Berita"
        loading={Boolean(deletingId)}
      />
    </>
  );
}
