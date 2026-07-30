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
    // cleanup best-effort, tidak perlu throw
  }
}

// ── Helper: gunakan sendBeacon untuk cleanup saat tab ditutup (fire-and-forget)
function beaconCleanup(paths: string[]): void {
  if (paths.length === 0 || typeof navigator === 'undefined') return;
  const payload = JSON.stringify({ paths });
  // sendBeacon hanya bisa POST, kita sudah handle POST di /api/upload/cleanup
  navigator.sendBeacon('/api/upload/cleanup', new Blob([payload], { type: 'application/json' }));
}

export default function NewAnnouncementPage() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [contentHtml, setContentHtml] = useState('<p></p>');
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);

  /**
   * storagePaths: semua path file yang sudah diupload selama session ini.
   * Menggunakan ref agar nilainya selalu terbaru di dalam event listener.
   * Format: "bucket/filename"
   */
  const storagePaths = useRef<string[]>([]);

  /** Apakah form sudah berhasil disimpan (jangan cleanup kalau sudah sukses) */
  const savedSuccessfully = useRef(false);

  // ── Track upload dari TipTapEditor (gambar & PDF dalam konten)
  const handleEditorUpload = useCallback((url: string, storagePath: string) => {
    storagePaths.current.push(storagePath);
  }, []);

  // ── Cleanup otomatis saat komponen di-unmount (navigasi tanpa klik Batal)
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

  // ── Upload Cover Image (gambar header)
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
      // Track path lama (jika ada) untuk dihapus karena diganti
      if (coverImageUrl) {
        // Kita tidak tahu path lama setelah navigasi, jadi hanya track yang baru
      }
      storagePaths.current.push(data.storagePath); // Track untuk cleanup
      setCoverImageUrl(data.url);
    } catch (err) {
      alert(`Kesalahan upload: ${(err as Error).message}`);
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  // ── Hapus cover (tanpa hapus dari storage — akan di-cleanup saat batal)
  const handleRemoveCover = () => setCoverImageUrl('');

  // ── Klik Batal: cleanup lalu beri tahu user
  const handleCancel = async () => {
    const pathsToClean = [...storagePaths.current];
    storagePaths.current = [];
    savedSuccessfully.current = true; // Tandai agar unmount tidak cleanup lagi
    await cleanupOrphanFiles(pathsToClean);
    // Reset form
    setTitle('');
    setDate(new Date().toISOString().slice(0, 10));
    setCoverImageUrl('');
    setContentHtml('<p></p>');
    setResultMessage({ type: 'ok', text: '🗑️ Form dibatalkan. File yang diupload sudah dihapus.' });
    savedSuccessfully.current = false; // Boleh tracking lagi jika user lanjut edit
  };

  // ── Simpan Pengumuman ke Database
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
        // ✅ Berhasil disimpan — hapus tracking (file sudah terhubung ke DB)
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

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10">

        {/* Header */}
        <div className="mb-8 border-b border-gray-100 pb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Buat / Edit Pengumuman
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload gambar header, atur judul, tanggal, dan isi konten pengumuman.
          </p>
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
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl border border-gray-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal & Hapus Upload
            </button>

            <button
              type="submit"
              disabled={saving}
              className="bg-[#0b6330] hover:bg-[#084823] text-white font-extrabold text-sm px-8 py-2.5 rounded-xl shadow-md transition-colors disabled:opacity-50 cursor-pointer tracking-wide"
            >
              {saving ? '⏳ Menyimpan…' : '💾 Simpan Pengumuman'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
