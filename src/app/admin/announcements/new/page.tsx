'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// Import dynamic TipTap Editor tanpa SSR
const TipTapEditor = dynamic(() => import('@/components/TipTapEditor'), {
  ssr: false,
  loading: () => <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl animate-pulse">Memuat TipTap Editor...</div>,
});

export default function NewAnnouncementTestPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Beasiswa');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState('Beasiswa, USK');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [contentHtml, setContentHtml] = useState('<p>Tulis isi pengumuman di sini...</p>');
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);

  // Upload Cover Image
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Upload cover gagal: ${err.error}`);
        return;
      }

      const data = await res.json();
      setCoverImageUrl(data.url);
    } catch (err) {
      alert(`Kesalahan upload: ${(err as Error).message}`);
    } finally {
      setUploadingCover(false);
    }
  };

  // Simpan Pengumuman ke Database
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contentHtml.trim()) {
      alert('Judul dan Konten pengumuman tidak boleh kosong.');
      return;
    }

    setSaving(true);
    setResultMessage(null);

    const tagArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          excerpt: excerpt.trim(),
          coverImageUrl,
          content: contentHtml,
          tags: tagArray,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResultMessage(`✅ Pengumuman berhasil disimpan ke DB! ID: ${data.announcement.id}`);
      } else {
        setResultMessage(`❌ Gagal menyimpan: ${data.error}`);
      }
    } catch (err) {
      setResultMessage(`❌ Error: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10">

        {/* Header */}
        <div className="mb-8 border-b border-gray-100 pb-5">
          <span className="bg-emerald-100 text-[#0b6330] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Test Page Feature
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
            Buat Pengumuman Baru (TipTap Editor)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Halaman uji coba Rich Text Editor dengan fitur Upload Gambar &amp; Tombol Hijau Download PDF Custom.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          {/* Judul & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Judul Pengumuman <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Pengumuman Hasil Seleksi Beasiswa Palestine 2025"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0b6330]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0b6330] bg-white"
              >
                <option value="Beasiswa">Beasiswa</option>
                <option value="Bantuan">Bantuan Solidaritas</option>
                <option value="Program">Program Kerja</option>
                <option value="Umum">Umum</option>
              </select>
            </div>
          </div>

          {/* Ringkasan (Excerpt) & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Ringkasan Singkat (Excerpt)
              </label>
              <input
                type="text"
                placeholder="Ringkasan 1-2 kalimat untuk preview card..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0b6330]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Tags (Pisahkan koma)
              </label>
              <input
                type="text"
                placeholder="Beasiswa, Palestine, USK"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0b6330]"
              />
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Cover Header Image
            </label>
            <div className="flex items-center gap-4">
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
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 transition-colors"
              >
                {uploadingCover ? '⏳ Mengupload Cover...' : '🖼️ Pilih Cover Image'}
              </button>

              {coverImageUrl && (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <span>✅ Cover terpasang</span>
                  <a href={coverImageUrl} target="_blank" rel="noreferrer" className="underline">
                    Lihat
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Rich Text Editor TipTap */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Konten Pengumuman (Rich Text Editor) <span className="text-red-500">*</span>
            </label>
            <TipTapEditor
              content={contentHtml}
              onChange={(html) => setContentHtml(html)}
            />
          </div>

          {/* Alert Result */}
          {resultMessage && (
            <div
              className={`p-4 rounded-xl text-sm font-semibold border ${
                resultMessage.startsWith('✅')
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {resultMessage}
            </div>
          )}

          {/* Tombol Simpan */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#0b6330] hover:bg-[#084823] text-white font-extrabold text-sm px-8 py-3 rounded-xl shadow-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? '⏳ Menyimpan ke DB...' : '💾 Simpan Pengumuman'}
            </button>
          </div>

        </form>

        {/* Live Preview Raw HTML */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="font-bold text-gray-800 text-sm mb-3">Live HTML Preview (Render Output):</h3>
          <div
            className="p-6 bg-white border border-gray-200 rounded-xl prose max-w-none shadow-2xs"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>

      </div>
    </div>
  );
}
