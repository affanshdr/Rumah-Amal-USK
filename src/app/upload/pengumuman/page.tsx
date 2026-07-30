'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

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

export default function UploadPengumumanPage() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [contentHtml, setContentHtml] = useState('<p></p>');
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const storagePaths = useRef<string[]>([]);
  const savedSuccessfully = useRef(false);

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
    setCoverImageUrl('');
    setContentHtml('<p></p>');
    setResultMessage({ type: 'ok', text: '🗑️ Form dibatalkan. File yang diupload sudah dihapus.' });
    savedSuccessfully.current = false;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setResultMessage({ type: 'err', text: 'Judul pengumuman tidak boleh kosong.' });
      return;
    }

    setSaving(true);
    setResultMessage(null);

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category: 'Umum',
          publishedAt: new Date(date).toISOString(),
          coverImageUrl,
          content: contentHtml,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        savedSuccessfully.current = true;
        storagePaths.current = [];
        setResultMessage({ type: 'ok', text: `✅ Pengumuman berhasil disimpan!` });
      } else {
        setResultMessage({ type: 'err', text: `❌ Gagal menyimpan: ${data.error}` });
      }
    } catch (err) {
      setResultMessage({ type: 'err', text: `❌ Error: ${(err as Error).message}` });
    } finally {
      setSaving(false);
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
              Upload / Buat Pengumuman
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Upload gambar header, atur judul, tanggal, dan isi konten pengumuman.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="self-start sm:self-auto px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#0b6330] font-extrabold text-sm rounded-xl border border-emerald-200 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            👁️ Preview Pengumuman
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          {/* 1. Upload Cover Image */}
          <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200">
            <label className="block text-sm font-bold text-gray-800 mb-2">
              🖼️ Gambar Header / Cover Pengumuman
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

          {/* 2. Judul & 3. Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Judul Pengumuman <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Masukkan judul pengumuman…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0b6330] font-medium"
                required
              />
            </div>

            <div>
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

          {/* 4. Rich Text Editor */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Isi Pengumuman <span className="text-red-500">*</span>
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
                {saving ? '⏳ Menyimpan…' : '💾 Simpan Pengumuman'}
              </button>
            </div>
          </div>

        </form>
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
                  Preview Tampilan Publik Pengumuman
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
                  <span>PENGUMUMAN</span>
                  <span>•</span>
                  <span>{formatPreviewDate(date)}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                  {title || '(Belum Ada Judul Pengumuman)'}
                </h1>
              </div>

              {coverImageUrl && (
                <div className="mb-8 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex justify-center max-h-[400px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImageUrl}
                    alt="Cover Pengumuman"
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
                    __html: contentHtml || '<p class="text-gray-400 italic">(Belum ada konten pengumuman)</p>',
                  }}
                />
              </div>

              {/* Footer Meta Info: Views & Tags */}
              <div className="pt-6 border-t border-gray-200 mt-8">
                <div className="flex items-center gap-6 text-gray-600 text-sm font-semibold mb-4">
                  <div className="flex items-center gap-2" title="Jumlah Pembaca / Views">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span className="text-gray-800 font-extrabold text-base">87</span>
                  </div>

                  <div className="flex items-center gap-2" title="Tags">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">#Beasiswa</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Bagikan:</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-md border border-gray-200">📋 Salin Link</span>
                </div>
              </div>

              {/* Simulated Comment Section */}
              <div className="mt-10 pt-8 border-t border-gray-200">
                <h4 className="text-lg font-extrabold text-gray-900 mb-4">
                  Komentar (Simulasi Tampilan)
                </h4>

                <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
                  <input
                    disabled
                    type="text"
                    placeholder="Nama (optional)"
                    className="w-full sm:w-64 px-3 py-1.5 border border-gray-300 rounded-lg text-xs mb-3 bg-gray-50"
                  />
                  <textarea
                    disabled
                    rows={2}
                    placeholder="Tulis komentar Anda..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs mb-3 bg-gray-50 resize-none"
                  />
                  <button
                    disabled
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg opacity-80"
                  >
                    Kirim Komentar
                  </button>
                </div>

                {/* Sample Comment Item */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-extrabold text-gray-900 text-xs">Nurul izzati</span>
                    <span className="text-[11px] text-gray-400 font-medium">14 hari yang lalu</span>
                  </div>
                  <p className="text-xs text-gray-700 mb-2">
                    Terima kasih atas informasi pengumuman kelulusan beasiswa ini.
                  </p>
                  <span className="text-xs font-bold text-blue-600">Balas</span>
                </div>
              </div>

            </div>

            <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-t border-gray-200">
              <span className="text-xs font-medium text-gray-500 hidden sm:inline">
                💡 Ini adalah simulasi tampilan pengumuman bagi pengunjung website.
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
