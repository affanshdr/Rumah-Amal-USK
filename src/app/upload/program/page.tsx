'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Import dynamic TipTap Editor tanpa SSR
const TipTapEditor = dynamic(() => import('@/components/TipTapEditor'), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl animate-pulse border border-gray-200 font-semibold">
      Memuat Editor…
    </div>
  ),
});

const CATEGORIES = [
  'PENDIDIKAN',
  'PEMBERDAYAAN',
  'SOSIAL & KEMANUSIAAN',
  'SYIAR & QURBAN',
  'KEMITRAAN',
  'FASILITATOR & RELAWAN',
];

interface ProgramItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  coverImageUrl: string | null;
  content: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
}

// Helper: API cleanup untuk hapus file orphan dari Supabase Storage
async function cleanupOrphanFiles(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  try {
    await fetch('/api/upload/cleanup', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths }),
    });
  } catch {
    // cleanup best-effort
  }
}

// Helper: sendBeacon untuk cleanup saat tab ditutup
function beaconCleanup(paths: string[]): void {
  if (paths.length === 0 || typeof navigator === 'undefined') return;
  const payload = JSON.stringify({ paths });
  navigator.sendBeacon('/api/upload/cleanup', new Blob([payload], { type: 'application/json' }));
}

export default function UploadProgramPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('PENDIDIKAN');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [contentHtml, setContentHtml] = useState('<p></p>');
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // List existing programs
  const [programsList, setProgramsList] = useState<ProgramItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const storagePaths = useRef<string[]>([]);
  const savedSuccessfully = useRef(false);

  const fetchExistingPrograms = useCallback(async () => {
    try {
      const res = await fetch('/api/program');
      if (res.ok) {
        const data = await res.json();
        setProgramsList(data.programs || []);
      }
    } catch (err) {
      console.error('Error loading programs:', err);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchExistingPrograms();
  }, [fetchExistingPrograms]);

  // Track upload dari TipTapEditor
  const handleEditorUpload = useCallback((url: string, storagePath: string) => {
    storagePaths.current.push(storagePath);
  }, []);

  // Cleanup otomatis saat unmount
  useEffect(() => {
    return () => {
      if (!savedSuccessfully.current) {
        cleanupOrphanFiles(storagePaths.current);
      }
    };
  }, []);

  // Cleanup saat user tutup tab
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!savedSuccessfully.current) {
        beaconCleanup(storagePaths.current);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Upload Cover Image
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json();
        alert(`Upload gambar gagal: ${err.error}`);
        return;
      }

      const data = await res.json();
      storagePaths.current.push(data.storagePath);
      setCoverImageUrl(data.url);
    } catch (err) {
      alert(`Kesalahan upload: ${(err as Error).message}`);
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleRemoveCover = () => setCoverImageUrl('');

  const handleCancel = async () => {
    const pathsToClean = [...storagePaths.current];
    storagePaths.current = [];
    savedSuccessfully.current = true;
    await cleanupOrphanFiles(pathsToClean);
    setTitle('');
    setCategory('PENDIDIKAN');
    setDate(new Date().toISOString().slice(0, 10));
    setCoverImageUrl('');
    setContentHtml('<p></p>');
    setResultMessage({ type: 'ok', text: '🗑️ Form dibatalkan. File yang diupload sudah dihapus.' });
    savedSuccessfully.current = false;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setResultMessage({ type: 'err', text: 'Judul program tidak boleh kosong.' });
      return;
    }
    if (!contentHtml || contentHtml === '<p></p>') {
      setResultMessage({ type: 'err', text: 'Isi konten program tidak boleh kosong.' });
      return;
    }

    setSaving(true);
    setResultMessage(null);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('content', contentHtml);
      formData.append('published', '1');
      if (coverImageUrl) {
        formData.append('coverImageUrl', coverImageUrl);
      }

      const res = await fetch('/api/program/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          publishedAt: new Date(date).toISOString(),
          coverImageUrl,
          content: contentHtml,
          published: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        savedSuccessfully.current = true;
        storagePaths.current = [];
        setResultMessage({ type: 'ok', text: `✅ Program "${title.trim()}" berhasil disimpan!` });

        // Reset Form
        setTitle('');
        setCategory('PENDIDIKAN');
        setDate(new Date().toISOString().slice(0, 10));
        setCoverImageUrl('');
        setContentHtml('<p></p>');

        fetchExistingPrograms();
      } else {
        setResultMessage({ type: 'err', text: `❌ Gagal menyimpan: ${data.error || 'Server error'}` });
      }
    } catch (err) {
      setResultMessage({ type: 'err', text: `❌ Error: ${(err as Error).message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus program ini?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/program/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProgramsList((prev) => prev.filter((item) => item.id !== id));
        setResultMessage({ type: 'ok', text: 'Program berhasil dihapus.' });
      } else {
        alert('Gagal menghapus program.');
      }
    } catch (err) {
      alert(`Terjadi kesalahan: ${(err as Error).message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublished = async (item: ProgramItem) => {
    setTogglingId(item.id);
    try {
      const res = await fetch(`/api/program/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !item.published }),
      });
      if (res.ok) {
        setProgramsList((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, published: !p.published } : p))
        );
      } else {
        alert('Gagal memperbarui status publikasi.');
      }
    } catch (err) {
      alert(`Terjadi kesalahan: ${(err as Error).message}`);
    } finally {
      setTogglingId(null);
    }
  };

  const formatPreviewDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10">

        {/* Top Nav Back */}
        <div className="mb-4">
          <Link
            href="/upload"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-gray-500 hover:text-[#0b6330] transition-colors"
          >
            ← Kembali ke Tools Upload
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 border-b border-gray-100 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Upload / Buat Program
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Upload gambar header, atur kategori, judul, tanggal, dan tulis isi konten program dengan TipTap Editor.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="self-start sm:self-auto px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#0b6330] font-extrabold text-sm rounded-xl border border-emerald-200 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            👁️ Preview Program
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          {/* 1. Upload Cover Image */}
          <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200">
            <label className="block text-sm font-bold text-gray-800 mb-2">
              🖼️ Gambar Header / Cover Program
            </label>

            {coverImageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 mb-3 bg-white max-h-[260px] flex justify-center items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImageUrl}
                  alt="Cover Preview"
                  className="max-h-[240px] w-auto object-contain rounded-lg p-2"
                />
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
              />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="px-5 py-2.5 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl text-xs font-extrabold text-gray-800 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {uploadingCover
                  ? '⏳ Mengupload…'
                  : coverImageUrl
                  ? '🔄 Ganti Gambar'
                  : '📤 Upload Gambar'}
              </button>

              {coverImageUrl && (
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
                >
                  Hapus Gambar
                </button>
              )}
            </div>
          </div>

          {/* 2. Kategori, Judul, Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
            <div className="sm:col-span-4">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Kategori Program <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0b6330] bg-white font-bold"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-5">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Judul Program <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Masukkan judul program…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0b6330] font-medium"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0b6330] bg-white font-medium"
                required
              />
            </div>
          </div>

          {/* 3. Rich Text TipTap Editor */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Isi Konten Program <span className="text-red-500">*</span>
            </label>
            <TipTapEditor
              content={contentHtml}
              onChange={(html) => setContentHtml(html)}
              onUpload={handleEditorUpload}
            />
          </div>

          {/* Alert Result */}
          {resultMessage && (
            <div
              className={`p-4 rounded-xl text-sm font-bold border ${
                resultMessage.type === 'ok'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {resultMessage.text}
            </div>
          )}

          {/* Tombol Aksi */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl border border-gray-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal & Hapus Upload
            </button>

            <div className="w-full sm:w-auto flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-sm rounded-xl border border-gray-300 transition-colors cursor-pointer flex items-center gap-2"
              >
                👁️ Preview
              </button>

              <button
                type="submit"
                disabled={saving}
                className="bg-[#0b6330] hover:bg-[#084823] text-white font-extrabold text-sm px-8 py-2.5 rounded-xl shadow-md transition-colors disabled:opacity-50 cursor-pointer tracking-wide"
              >
                {saving ? '⏳ Menyimpan…' : '💾 Simpan Program'}
              </button>
            </div>
          </div>

        </form>

        {/* ── DAFTAR PROGRAM TERDAFTAR ───────────────────────────── */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-extrabold text-gray-900 mb-6">
            📋 Daftar Program Terdaftar ({programsList.length})
          </h2>

          {loadingList ? (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-2xl animate-pulse font-medium">
              Memuat daftar program...
            </div>
          ) : programsList.length === 0 ? (
            <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              Belum ada program yang diupload.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {programsList.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-[#ffc800] text-[#111827] text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase">
                        {item.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.published ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.published ? 'Publik' : 'Draft'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-gray-900 text-sm leading-snug line-clamp-2 uppercase mb-2">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
                    <button
                      type="button"
                      onClick={() => handleTogglePublished(item)}
                      disabled={togglingId === item.id}
                      className="text-xs text-[#0b6330] font-bold hover:underline cursor-pointer"
                    >
                      {togglingId === item.id ? '...' : item.published ? 'Sembunyikan' : 'Publikasikan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
                    >
                      {deletingId === item.id ? '...' : 'Hapus'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── MODAL PREVIEW ────────────────────────────────────────── */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 my-8 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Modal Header */}
            <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500 w-2.5 h-2.5 rounded-full animate-pulse" />
                <h3 className="font-extrabold text-sm tracking-wide uppercase text-gray-200">
                  Preview Tampilan Publik Program
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-10 overflow-y-auto bg-white flex-1 font-sans text-gray-800">
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#0b6330] mb-2 uppercase tracking-wider">
                  <span className="bg-[#ffc800] text-[#111827] px-2.5 py-0.5 rounded font-extrabold">
                    {category}
                  </span>
                  <span>•</span>
                  <span>{formatPreviewDate(date)}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight uppercase">
                  {title || '(Belum Ada Judul Program)'}
                </h1>
              </div>

              {coverImageUrl && (
                <div className="mb-8 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex justify-center max-h-[400px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImageUrl}
                    alt="Cover Program"
                    className="w-full object-contain max-h-[400px]"
                  />
                </div>
              )}

              <div className="prose max-w-none text-gray-800">
                <style>{`
                  .preview-content p { margin-bottom: 1rem; line-height: 1.75; }
                  .preview-content h1 { font-size: 1.75rem; font-weight: 800; margin-top: 1.5rem; margin-bottom: 0.75rem; }
                  .preview-content h2 { font-size: 1.4rem; font-weight: 700; margin-top: 1.25rem; margin-bottom: 0.5rem; }
                  .preview-content h3 { font-size: 1.15rem; font-weight: 700; margin-top: 1rem; margin-bottom: 0.5rem; }
                  .preview-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
                  .preview-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
                  .preview-content li { margin-bottom: 0.25rem; }
                  .preview-content blockquote { border-left: 4px solid #d1d5db; padding-left: 1rem; color: #6b7280; font-style: italic; margin: 1rem 0; }
                  .preview-content a { color: #2563eb; text-decoration: underline; }
                  .preview-content img { max-width: 100%; height: auto; border-radius: 0.75rem; margin: 1rem 0; }
                `}</style>
                <div
                  className="preview-content text-base sm:text-lg leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: contentHtml || '<p class="text-gray-400 italic">(Belum ada konten program)</p>',
                  }}
                />
              </div>

            </div>

            <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-t border-gray-200">
              <span className="text-xs font-medium text-gray-500 hidden sm:inline">
                💡 Ini adalah simulasi tampilan program bagi pengunjung website.
              </span>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer ml-auto"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
