'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Import dynamic TipTap Editor tanpa SSR
const TipTapEditor = dynamic(() => import('@/components/TipTapEditor'), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl animate-pulse border border-gray-200">
      Memuat Editor…
    </div>
  ),
});

// ── Helper: panggil API cleanup untuk hapus file orphan dari Supabase Storage
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

// ── Helper: gunakan sendBeacon untuk cleanup saat tab ditutup
function beaconCleanup(paths: string[]): void {
  if (paths.length === 0 || typeof navigator === 'undefined') return;
  const payload = JSON.stringify({ paths });
  navigator.sendBeacon('/api/upload/cleanup', new Blob([payload], { type: 'application/json' }));
}

interface NewsItem {
  id: string;
  title: string;
  publishedAt: string;
  coverImageUrl: string | null;
  tags: string[];
}

export default function AdminBeritaPage() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [tagsInput, setTagsInput] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [contentHtml, setContentHtml] = useState('<p></p>');
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const storagePaths = useRef<string[]>([]);
  const savedSuccessfully = useRef(false);

  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch('/api/news?limit=20');
      if (res.ok) {
        const data = await res.json();
        setNewsList(data.news || data.items || []);
      }
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // ── Track upload dari TipTapEditor
  const handleEditorUpload = useCallback((url: string, storagePath: string) => {
    storagePaths.current.push(storagePath);
  }, []);

  // ── Cleanup otomatis saat komponen di-unmount
  useEffect(() => {
    return () => {
      if (!savedSuccessfully.current) {
        cleanupOrphanFiles(storagePaths.current);
      }
    };
  }, []);

  // ── Cleanup saat user tutup tab / close browser
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!savedSuccessfully.current) {
        beaconCleanup(storagePaths.current);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // ── Upload Cover Image
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'Berita');

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
    setDate(new Date().toISOString().slice(0, 10));
    setTagsInput('');
    setCoverImageUrl('');
    setContentHtml('<p></p>');
    setResultMessage({ type: 'ok', text: '🗑️ Form dibatalkan. File yang diupload sudah dihapus.' });
    savedSuccessfully.current = false;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setResultMessage({ type: 'err', text: 'Judul berita tidak boleh kosong.' });
      return;
    }

    setSaving(true);
    setResultMessage(null);

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category: parsedTags[0] || 'Berita',
          publishedAt: new Date(date).toISOString(),
          coverImageUrl,
          content: contentHtml,
          tags: parsedTags,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        savedSuccessfully.current = true;
        storagePaths.current = [];
        setResultMessage({ type: 'ok', text: `✅ Berita berhasil disimpan!` });
        setTitle('');
        setDate(new Date().toISOString().slice(0, 10));
        setTagsInput('');
        setCoverImageUrl('');
        setContentHtml('<p></p>');
        fetchNews();
      } else {
        setResultMessage({ type: 'err', text: `❌ Gagal menyimpan: ${data.error}` });
      }
    } catch (err) {
      setResultMessage({ type: 'err', text: `❌ Error: ${(err as Error).message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus berita ini?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/news/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNewsList((prev) => prev.filter((n) => n.id !== id));
        setResultMessage({ type: 'ok', text: 'Berita berhasil dihapus.' });
      } else {
        alert('Gagal menghapus berita.');
      }
    } catch (err) {
      alert(`Terjadi kesalahan: ${(err as Error).message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      });
    } catch { return dateStr; }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Buat Berita</h1>
          <p className="text-sm text-gray-500 mt-1">Tulis & publish berita baru untuk website</p>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#0b6330] font-bold text-sm rounded-xl border border-emerald-200 transition-all cursor-pointer"
        >
          👁️ Preview
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">

        {/* Cover Image */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <label className="block text-sm font-bold text-gray-800 mb-2">🖼️ Gambar Cover Berita</label>
          {coverImageUrl && (
            <div className="rounded-xl overflow-hidden border border-gray-200 mb-3 bg-white max-h-[220px] flex justify-center items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImageUrl} alt="Cover Preview" className="max-h-[200px] w-auto object-contain rounded-lg p-2" />
            </div>
          )}
          <div className="flex items-center gap-3">
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              {uploadingCover ? '⏳ Mengupload…' : coverImageUrl ? '🔄 Ganti Gambar' : '📤 Upload Gambar'}
            </button>
            {coverImageUrl && (
              <button type="button" onClick={handleRemoveCover} className="text-xs text-red-600 font-bold hover:underline cursor-pointer">
                Hapus
              </button>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-6">
            <label className="block text-sm font-bold text-gray-800 mb-1">Judul Berita <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Masukkan judul berita…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0b6330] font-medium"
              required
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-sm font-bold text-gray-800 mb-1">Tanggal <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0b6330] bg-white font-medium"
              required
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Tag <span className="text-[11px] font-normal text-gray-400">(pisah koma)</span>
            </label>
            <input
              type="text"
              placeholder="misal: Kegiatan, 2026"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0b6330] font-medium"
            />
          </div>
        </div>

        {/* Editor */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">Isi Berita <span className="text-red-500">*</span></label>
          <TipTapEditor content={contentHtml} onChange={(html) => setContentHtml(html)} onUpload={handleEditorUpload} />
        </div>

        {/* Messages */}
        {resultMessage && (
          <div className={`p-4 rounded-xl text-sm font-bold border ${
            resultMessage.type === 'ok' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            {resultMessage.text}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl border border-gray-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal &amp; Hapus Upload
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto bg-[#063A1E] hover:bg-[#0b522c] text-white font-bold text-sm px-8 py-2.5 rounded-xl shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? '⏳ Menyimpan…' : '💾 Simpan Berita'}
          </button>
        </div>
      </div>

      {/* News List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">📋 Berita Tersimpan</h2>
        {loadingList ? (
          <p className="text-sm text-gray-400 animate-pulse">Memuat daftar berita...</p>
        ) : newsList.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada berita yang dipublikasikan.</p>
        ) : (
          <div className="space-y-2">
            {newsList.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3 min-w-0">
                  {item.coverImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.coverImageUrl} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400">{formatDate(item.publishedAt)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="text-xs text-red-500 font-bold hover:underline cursor-pointer ml-4 flex-shrink-0 disabled:opacity-50"
                >
                  {deletingId === item.id ? '...' : 'Hapus'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Preview */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 my-8 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500 w-2.5 h-2.5 rounded-full animate-pulse" />
                <h3 className="font-bold text-sm tracking-wide uppercase text-gray-200">Preview Berita</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 sm:p-10 overflow-y-auto bg-white flex-1">
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-xs font-bold text-[#0b6330] uppercase mb-2">BERITA</p>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{title || '(Belum Ada Judul)'}</h1>
              </div>
              {coverImageUrl && (
                <div className="mb-8 rounded-2xl overflow-hidden border border-gray-200 max-h-[400px] flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverImageUrl} alt="" className="w-full object-contain max-h-[400px]" />
                </div>
              )}
              <div
                className="prose max-w-none text-gray-800 text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: contentHtml || '<p class="text-gray-400 italic">(Belum ada konten)</p>' }}
              />
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
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
