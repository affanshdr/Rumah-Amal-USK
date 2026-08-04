'use client';

import { useRef, useState, useEffect } from 'react';

interface DocumentResult {
  id: string;
  judul: string;
  imageUrl: string | null;
  pdfUrl: string;
  createdAt: string;
}

interface SizeInfo {
  originalSizeMB: number;
  compressedSizeMB: number;
  savedPercent: number;
  wasOptimized: boolean;
}

const MAX_WIDTH = 1600;
const QUALITY = 0.99;
const RESIZE_THRESHOLD = 1_000_000;
const PDF_WARN_MB = 30;

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

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

export default function AdminDokumenPage() {
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const globalCoverInputRef = useRef<HTMLInputElement>(null);

  const [judul, setJudul] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string>('/dokumen-cover.svg');
  const [updatingCover, setUpdatingCover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [sizeWarning, setSizeWarning] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [uploadedList, setUploadedList] = useState<DocumentResult[]>([]);
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);
  const [lastSizeInfo, setLastSizeInfo] = useState<SizeInfo | null>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'drive'>('file');
  const [driveUrl, setDriveUrl] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const savedCover = typeof window !== 'undefined' ? localStorage.getItem('global_doc_cover') : null;
    if (savedCover) setCurrentCoverUrl(savedCover);
    fetchExistingDocuments();
  }, []);

  const fetchExistingDocuments = async () => {
    try {
      const res = await fetch('/api/documents?limit=20');
      if (res.ok) {
        const data = await res.json();
        if (data.documents?.length > 0) {
          setUploadedList(data.documents);
          const customCover = data.documents.find((d: DocumentResult) => d.imageUrl && d.imageUrl !== '/dokumen-cover.svg');
          if (customCover?.imageUrl) {
            setCurrentCoverUrl(customCover.imageUrl);
            localStorage.setItem('global_doc_cover', customCover.imageUrl);
          } else if (data.documents[0]?.imageUrl) {
            setCurrentCoverUrl(data.documents[0].imageUrl);
          }
        }
      }
    } catch (e) { console.error('Gagal mengambil daftar dokumen:', e); }
  };

  const handlePdfSelect = (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('File harus berformat PDF (.pdf)'); return;
    }
    const sizeMB = file.size / (1024 * 1024);
    setSizeWarning(sizeMB > PDF_WARN_MB ? `⚠️ File cukup besar (${sizeMB.toFixed(1)} MB). Upload mungkin membutuhkan waktu lebih lama.` : '');
    setPdfFile(file); setError(''); setLastSizeInfo(null);
  };

  const handleGlobalCoverChange = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('File cover harus berupa gambar'); return; }
    setUpdatingCover(true); setError(''); setSuccessMsg('');
    try {
      let finalCover: File;
      if (file.size > RESIZE_THRESHOLD) {
        const resized = await resizeImage(file);
        finalCover = new File([resized], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
      } else { finalCover = file; }
      const formData = new FormData();
      formData.append('image', finalCover);
      const res = await fetch('/api/documents/cover', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) { setError(data.error ?? 'Gagal memperbarui cover.'); return; }
      const newUrl = data.coverUrl;
      setCurrentCoverUrl(newUrl);
      localStorage.setItem('global_doc_cover', newUrl);
      setSuccessMsg(`✅ Cover berhasil diperbarui untuk ${data.updatedCount || 'semua'} dokumen!`);
      setUploadedList((prev) => prev.map((doc) => ({ ...doc, imageUrl: newUrl })));
      fetchExistingDocuments();
    } catch (err) { setError(`Gagal ganti cover: ${(err as Error).message}`); }
    finally { setUpdatingCover(false); }
  };

  const handleSubmitDocument = async () => {
    if (!judul.trim()) { setError('Judul dokumen wajib diisi.'); return; }
    if (uploadMode === 'file' && !pdfFile) { setError('File PDF wajib diupload.'); return; }
    if (uploadMode === 'drive') {
      const trimmed = driveUrl.trim();
      if (!trimmed) { setError('Link Google Drive wajib diisi.'); return; }
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) { setError('Link harus dimulai dengan http:// atau https://'); return; }
    }
    setUploading(true); setError(''); setSuccessMsg(''); setLastSizeInfo(null);
    try {
      let res: Response;
      if (uploadMode === 'file') {
        const formData = new FormData();
        formData.append('judul', judul.trim());
        formData.append('pdf', pdfFile!);
        if (currentCoverUrl) formData.append('coverUrl', currentCoverUrl);
        res = await fetch('/api/documents/upload', { method: 'POST', body: formData });
      } else {
        res = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ judul: judul.trim(), pdfUrl: driveUrl.trim(), coverUrl: currentCoverUrl }),
        });
      }
      const resText = await res.text();
      let data: { success?: boolean; document?: DocumentResult; error?: string; sizeInfo?: SizeInfo };
      try { data = JSON.parse(resText); } catch { setError(`Server Error (${res.status}): ${resText.slice(0, 150)}`); setUploading(false); return; }
      if (!res.ok || !data.success) { setError(data.error ?? `Server error: ${res.status}`); setUploading(false); return; }
      if (data.document) { setUploadedList((prev) => [data.document!, ...prev]); if (data.document.imageUrl) setCurrentCoverUrl(data.document.imageUrl); }
      if (data.sizeInfo) setLastSizeInfo(data.sizeInfo);
      setSuccessMsg(`✅ Dokumen "${judul.trim()}" berhasil ditambahkan!`);
      setJudul(''); setPdfFile(null); setDriveUrl(''); setSizeWarning('');
    } catch (err) { setError(`Koneksi gagal: ${(err as Error).message}`); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: 'DELETE' });
      if (res.ok) { setUploadedList((prev) => prev.filter((doc) => doc.id !== id)); setSuccessMsg('Dokumen berhasil dihapus.'); }
      else { alert('Gagal menghapus dokumen.'); }
    } catch (e) { console.error(e); alert('Terjadi kesalahan saat menghapus.'); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Kelola Dokumen</h1>
        <p className="text-sm text-gray-500 mt-1">Upload dokumen PDF dengan cover image & tanggal otomatis</p>
      </div>

      {/* Global Messages */}
      {error && <div className="p-3 rounded-xl text-sm font-semibold bg-red-50 text-red-700 border border-red-200">⚠ {error}</div>}
      {sizeWarning && !error && <div className="p-3 rounded-xl text-sm bg-yellow-50 text-yellow-800 border border-yellow-200">{sizeWarning}</div>}
      {successMsg && (
        <div className="p-3 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          {successMsg}
          {lastSizeInfo && lastSizeInfo.wasOptimized && (
            <span className="ml-2 text-xs">({lastSizeInfo.originalSizeMB}MB → {lastSizeInfo.compressedSizeMB}MB, -{lastSizeInfo.savedPercent}%)</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Cover Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-1">🖼️ Cover Dokumen (Global)</h2>
          <p className="text-xs text-gray-500 mb-3">Satu gambar ini berlaku untuk <strong>SEMUA</strong> dokumen di website.</p>
          <div className="w-full aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentCoverUrl} alt="Global Cover" className="w-full h-full object-cover" />
          </div>
          <button
            type="button"
            onClick={() => globalCoverInputRef.current?.click()}
            disabled={updatingCover}
            className="w-full bg-[#F5B016] hover:bg-[#e09f0f] text-[#063A1E] font-bold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
          >
            {updatingCover ? '⏳ Mengunggah...' : '🔄 Ganti Cover'}
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">Otomatis diterapkan ke semua dokumen</p>
          <input
            ref={globalCoverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleGlobalCoverChange(e.target.files[0])}
          />
        </div>

        {/* Form Card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-gray-800">📄 Tambah Dokumen Baru</h2>
            <p className="text-xs text-gray-500">Isi judul & upload file PDF dokumen.</p>
          </div>

          {/* Judul */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Dokumen <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Contoh: Laporan Tahunan Rumah Amal 2025"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0b6330] font-medium"
            />
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
            {(['file', 'drive'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => { setUploadMode(mode); setError(''); setSizeWarning(''); if (mode === 'file') setDriveUrl(''); else setPdfFile(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  uploadMode === mode ? 'bg-white text-[#0b6330] shadow-sm' : 'text-gray-500'
                }`}
              >
                {mode === 'file' ? '📄 Upload File PDF' : '📁 Pakai Link Drive'}
              </button>
            ))}
          </div>

          {/* File Drop Zone */}
          {uploadMode === 'file' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">File Dokumen (PDF) <span className="text-red-500">*</span></label>
              <div
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  isDraggingPdf ? 'border-[#0b6330] bg-emerald-50' : pdfFile ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300 bg-gray-50 hover:border-[#0b6330]'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingPdf(true); }}
                onDragLeave={() => setIsDraggingPdf(false)}
                onDrop={(e) => { e.preventDefault(); setIsDraggingPdf(false); if (e.dataTransfer.files[0]) handlePdfSelect(e.dataTransfer.files[0]); }}
                onClick={() => pdfInputRef.current?.click()}
              >
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handlePdfSelect(e.target.files[0])}
                />
                {pdfFile ? (
                  <div className="flex items-center gap-3 text-left">
                    <span className="text-3xl">📕</span>
                    <div>
                      <p className="font-semibold text-sm text-red-800 break-all">{pdfFile.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(pdfFile.size)} • PDF Document</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-3xl mb-2">📕</div>
                    <p className="font-semibold text-gray-700 text-sm">Klik atau seret file PDF ke sini</p>
                    <p className="text-xs text-gray-400">Warning jika &gt; {PDF_WARN_MB} MB</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Drive URL */}
          {uploadMode === 'drive' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Link Google Drive <span className="text-red-500">*</span></label>
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/.../view"
                value={driveUrl}
                onChange={(e) => { setDriveUrl(e.target.value); setError(''); }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#0b6330] font-medium"
              />
              <p className="text-xs text-blue-600 mt-1.5 bg-blue-50 border border-blue-200 rounded-lg p-2">
                💡 Pastikan akses file di Google Drive sudah <strong>&quot;Anyone with the link&quot;</strong>
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmitDocument}
            disabled={uploading || !judul.trim() || (uploadMode === 'file' ? !pdfFile : !driveUrl.trim())}
            className="w-full bg-[#063A1E] hover:bg-[#0b522c] text-white font-bold text-sm py-3 rounded-xl shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            {uploading ? '⏳ Menyimpan Dokumen...' : uploadMode === 'file' ? '⬆ Upload Dokumen' : '💾 Simpan Link Drive'}
          </button>
        </div>
      </div>

      {/* Documents List */}
      {uploadedList.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4">📋 Daftar Dokumen Tersimpan ({uploadedList.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedList.map((doc) => (
              <div key={doc.id} className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm flex flex-col">
                <div className="relative w-full h-36 bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={doc.imageUrl || currentCoverUrl} alt={doc.judul} className="w-full h-full object-cover" />
                  <span className="absolute top-1.5 right-1.5 bg-red-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">PDF</span>
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="text-xs font-bold text-gray-900 mb-1 line-clamp-2">{doc.judul}</h3>
                  <p className="text-[10px] text-gray-400 mb-3">
                    {new Date(doc.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <div className="flex items-center justify-between mt-auto border-t border-gray-100 pt-2">
                    <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#0b6330] font-bold hover:underline">
                      Buka ↗
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deletingId === doc.id}
                      className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {deletingId === doc.id ? '...' : 'Hapus'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
