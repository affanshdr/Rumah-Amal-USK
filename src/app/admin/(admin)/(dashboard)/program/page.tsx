'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

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

async function cleanupOrphanFiles(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  try {
    await fetch('/api/upload/cleanup', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths }),
    });
  } catch { /* cleanup best-effort */ }
}

function beaconCleanup(paths: string[]): void {
  if (paths.length === 0 || typeof navigator === 'undefined') return;
  const payload = JSON.stringify({ paths });
  navigator.sendBeacon('/api/upload/cleanup', new Blob([payload], { type: 'application/json' }));
}

export default function AdminProgramPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('PENDIDIKAN');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [contentHtml, setContentHtml] = useState('<p></p>');
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
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

  useEffect(() => { fetchExistingPrograms(); }, [fetchExistingPrograms]);

  const handleEditorUpload = useCallback((url: string, storagePath: string) => {
    storagePaths.current.push(storagePath);
  }, []);

  useEffect(() => {
    return () => {
      if (!savedSuccessfully.current) cleanupOrphanFiles(storagePaths.current);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!savedSuccessfully.current) beaconCleanup(storagePaths.current);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) { const err = await res.json(); alert(`Upload gagal: ${err.error}`); return; }
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

  const handleCancel = async () => {
    const pathsToClean = [...storagePaths.current];
    storagePaths.current = [];
    savedSuccessfully.current = true;
    await cleanupOrphanFiles(pathsToClean);
    setTitle(''); setCategory('PENDIDIKAN'); setDate(new Date().toISOString().slice(0, 10));
    setCoverImageUrl(''); setContentHtml('<p></p>');
    setResultMessage({ type: 'ok', text: '🗑️ Form dibatalkan.' });
    savedSuccessfully.current = false;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setResultMessage({ type: 'err', text: 'Judul program tidak boleh kosong.' }); return; }
    if (!contentHtml || contentHtml === '<p></p>') { setResultMessage({ type: 'err', text: 'Isi konten tidak boleh kosong.' }); return; }
    setSaving(true); setResultMessage(null);
    try {
      const res = await fetch('/api/program/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), category, publishedAt: new Date(date).toISOString(), coverImageUrl, content: contentHtml, published: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        savedSuccessfully.current = true;
        storagePaths.current = [];
        setResultMessage({ type: 'ok', text: `✅ Program "${title.trim()}" berhasil disimpan!` });
        setTitle(''); setCategory('PENDIDIKAN'); setDate(new Date().toISOString().slice(0, 10));
        setCoverImageUrl(''); setContentHtml('<p></p>');
        fetchExistingPrograms();
      } else {
        setResultMessage({ type: 'err', text: `❌ Gagal: ${data.error || 'Server error'}` });
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
      if (res.ok) { setProgramsList((prev) => prev.filter((item) => item.id !== id)); }
      else { alert('Gagal menghapus program.'); }
    } catch (err) { alert(`Kesalahan: ${(err as Error).message}`); }
    finally { setDeletingId(null); }
  };

  const handleTogglePublished = async (item: ProgramItem) => {
    setTogglingId(item.id);
    try {
      const res = await fetch(`/api/program/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !item.published }),
      });
      if (res.ok) { setProgramsList((prev) => prev.map((p) => (p.id === item.id ? { ...p, published: !p.published } : p))); }
      else { alert('Gagal memperbarui status.'); }
    } catch (err) { alert(`Kesalahan: ${(err as Error).message}`); }
    finally { setTogglingId(null); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Kelola Program</h1>
          <p className="text-sm text-gray-500 mt-1">Tambah & kelola program kerja berdasarkan kategori</p>
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

        {/* Cover */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <label className="block text-sm font-bold text-gray-800 mb-2">🖼️ Gambar Header / Cover Program</label>
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
              <button type="button" onClick={() => setCoverImageUrl('')} className="text-xs text-red-600 font-bold hover:underline cursor-pointer">Hapus</button>
            )}
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-4">
            <label className="block text-sm font-bold text-gray-800 mb-1">Kategori <span className="text-red-500">*</span></label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0b6330] bg-white font-bold"
            >
              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="sm:col-span-5">
            <label className="block text-sm font-bold text-gray-800 mb-1">Judul Program <span className="text-red-500">*</span></label>
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
            <label className="block text-sm font-bold text-gray-800 mb-1">Tanggal <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0b6330] bg-white font-medium"
              required
            />
          </div>
        </div>

        {/* Editor */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-2">Isi Konten Program <span className="text-red-500">*</span></label>
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
            {saving ? '⏳ Menyimpan…' : '💾 Simpan Program'}
          </button>
        </div>
      </div>

      {/* Programs List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">📋 Daftar Program ({programsList.length})</h2>
        {loadingList ? (
          <p className="text-sm text-gray-400 animate-pulse">Memuat daftar program...</p>
        ) : programsList.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada program yang diupload.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {programsList.map((item) => (
              <div key={item.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-[#F5B016] text-[#063A1E] text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase">{item.category}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.published ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {item.published ? 'Publik' : 'Draft'}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 uppercase">{item.title}</h3>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-3">
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

      {/* Modal Preview */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 my-8 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between border-b border-gray-800">
              <h3 className="font-bold text-sm uppercase text-gray-200">Preview Program</h3>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-white bg-gray-800 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer">✕</button>
            </div>
            <div className="p-6 sm:p-10 overflow-y-auto flex-1">
              <div className="mb-4 flex items-center gap-2">
                <span className="bg-[#F5B016] text-[#063A1E] text-xs font-extrabold px-2.5 py-0.5 rounded uppercase">{category}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 uppercase mb-6">{title || '(Belum Ada Judul)'}</h1>
              {coverImageUrl && (
                <div className="mb-6 rounded-2xl overflow-hidden max-h-[300px] flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverImageUrl} alt="" className="w-full object-contain max-h-[300px]" />
                </div>
              )}
              <div
                className="prose max-w-none text-gray-800 text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: contentHtml || '<p class="text-gray-400 italic">(Belum ada konten)</p>' }}
              />
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
              <button onClick={() => setShowPreview(false)} className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white font-bold text-sm rounded-xl cursor-pointer">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
