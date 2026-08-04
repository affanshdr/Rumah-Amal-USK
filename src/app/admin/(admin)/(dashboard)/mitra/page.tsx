'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface MitraResult {
  id: string;
  nama: string;
  imageUrl: string;
  createdAt: string;
}

const MAX_WIDTH = 1200;
const QUALITY = 0.95;
const RESIZE_THRESHOLD = 1_000_000;

function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas tidak didukung')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => { if (blob) resolve(blob); else reject(new Error('Gagal konversi ke WebP')); },
        'image/webp', QUALITY
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Gagal memuat: ${file.name}`)); };
    img.src = url;
  });
}

export default function AdminMitraPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [nama, setNama] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [uploaded, setUploaded] = useState<MitraResult[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  const fetchMitras = useCallback(async () => {
    try {
      const res = await fetch('/api/mitra?limit=50');
      if (res.ok) {
        const data = await res.json();
        setUploaded(data.items || []);
      }
    } catch (err) { console.error('Error fetching mitras:', err); }
    finally { setLoadingList(false); }
  }, []);

  useEffect(() => { fetchMitras(); }, [fetchMitras]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) { setError('File harus berupa gambar (JPG, PNG, WEBP, SVG).'); return; }
    if (preview) URL.revokeObjectURL(preview);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = async () => {
    if (!nama.trim()) { setError('Nama mitra wajib diisi.'); return; }
    if (!imageFile) { setError('Logo / Gambar mitra wajib diupload.'); return; }
    setUploading(true); setError(''); setSuccessMsg('');
    try {
      let finalFile: File;
      if (imageFile.size > RESIZE_THRESHOLD && !imageFile.type.includes('svg')) {
        const resized = await resizeImage(imageFile);
        finalFile = new File([resized], imageFile.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
      } else { finalFile = imageFile; }

      const formData = new FormData();
      formData.append('image', finalFile);
      formData.append('nama', nama.trim());

      const res = await fetch('/api/mitra/upload', { method: 'POST', body: formData });
      const resText = await res.text();
      let data: { success?: boolean; mitra?: MitraResult; error?: string };
      try { data = JSON.parse(resText); } catch { setError(`Server Error (${res.status})`); setUploading(false); return; }

      if (!res.ok || !data.success) { setError(data.error ?? `Server error: ${res.status}`); setUploading(false); return; }

      if (data.mitra) setUploaded((prev) => [data.mitra!, ...prev]);
      setSuccessMsg(`✅ Mitra "${nama.trim()}" berhasil ditambahkan!`);
      setNama(''); setImageFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
    } catch (err) { setError(`Koneksi gagal: ${(err as Error).message}`); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus mitra ini?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/mitra/${id}`, { method: 'DELETE' });
      if (res.ok) { setUploaded((prev) => prev.filter((m) => m.id !== id)); }
      else { alert('Gagal menghapus mitra.'); }
    } catch (err) { alert(`Terjadi kesalahan: ${(err as Error).message}`); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Kelola Mitra</h1>
        <p className="text-sm text-gray-500 mt-1">Tambah logo/gambar & nama mitra resmi Rumah Amal</p>
      </div>

      {/* Messages */}
      {error && <div className="p-3 rounded-xl text-sm font-semibold bg-red-50 text-red-700 border border-red-200">⚠ {error}</div>}
      {successMsg && <div className="p-3 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">{successMsg}</div>}

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-800">➕ Tambah Mitra Baru</h2>

        {/* Nama */}
        <div>
          <label htmlFor="nama-mitra" className="block text-sm font-semibold text-gray-700 mb-1">Nama Mitra <span className="text-red-500">*</span></label>
          <input
            id="nama-mitra"
            type="text"
            placeholder="Contoh: Bank Syariah Indonesia (BSI)"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0b6330] font-medium"
          />
          <p className="text-xs text-gray-400 mt-1">Masukkan nama lengkap lembaga / mitra kerjasama</p>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Logo / Gambar Mitra <span className="text-red-500">*</span></label>
          <div
            className={`border-2 border-dashed rounded-xl transition-all cursor-pointer ${
              isDragging ? 'border-[#0b6330] bg-emerald-50' : preview ? 'border-emerald-300 bg-emerald-50 p-4' : 'border-gray-300 bg-gray-50 hover:border-[#0b6330] p-7'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            {preview ? (
              <div className="flex flex-col items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview" className="max-h-[160px] max-w-full object-contain rounded-lg bg-white p-2 border border-gray-200" />
                <p className="text-xs text-gray-500">{imageFile?.name}</p>
                <p className="text-xs text-gray-400">Klik untuk mengganti logo</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-3xl mb-2">🏢</div>
                <p className="font-semibold text-gray-700 text-sm">Klik atau seret logo mitra ke sini</p>
                <p className="text-xs text-gray-400">PNG, JPG, WEBP, SVG</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={uploading || !nama.trim() || !imageFile}
          className="w-full bg-[#063A1E] hover:bg-[#0b522c] text-white font-bold text-sm py-3 rounded-xl shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
        >
          {uploading ? '⏳ Mengupload...' : '⬆ Upload Mitra'}
        </button>
      </div>

      {/* Mitra List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">📋 Daftar Mitra Terdaftar ({uploaded.length})</h2>
        {loadingList ? (
          <p className="text-sm text-gray-400 animate-pulse">Memuat data mitra...</p>
        ) : uploaded.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-400">Belum ada mitra yang diupload.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploaded.map((u) => (
              <div key={u.id} className="rounded-xl overflow-hidden border border-gray-200 bg-white flex flex-col shadow-sm">
                <div className="h-24 w-full bg-gray-50 flex items-center justify-center p-3 border-b border-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u.imageUrl} alt={u.nama} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <p className="text-xs font-bold text-gray-900 mb-0.5 line-clamp-2">{u.nama}</p>
                  <p className="text-[10px] text-gray-400 mb-2">
                    {new Date(u.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <div className="flex items-center justify-between mt-auto border-t border-gray-100 pt-2">
                    <a href={u.imageUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#0b6330] font-bold hover:underline">
                      Lihat ↗
                    </a>
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={deletingId === u.id}
                      className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {deletingId === u.id ? '...' : 'Hapus'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
