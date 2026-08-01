'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';

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
  optimizationError?: string;
}

const MAX_WIDTH = 1600;
const QUALITY = 0.99;
const RESIZE_THRESHOLD = 1_000_000;

// Batas ukuran file PDF
const PDF_WARN_MB = 30; // Tampilkan warning jika lebih dari ini

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
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas tidak didukung')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Gagal konversi ke WebP'));
        },
        'image/webp',
        QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Gagal memuat gambar: ${file.name}`));
    };
    img.src = url;
  });
}

export default function DokumenUploadPage() {
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const globalCoverInputRef = useRef<HTMLInputElement>(null);

  // Form Dokumen
  const [judul, setJudul] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Global Cover State
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string>('/dokumen-cover.svg');
  const [updatingCover, setUpdatingCover] = useState(false);

  // Common State
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [sizeWarning, setSizeWarning] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [uploadedList, setUploadedList] = useState<DocumentResult[]>([]);
  const [isDraggingPdf, setIsDraggingPdf] = useState(false);
  const [lastSizeInfo, setLastSizeInfo] = useState<SizeInfo | null>(null);

  // Mode upload: 'file' = upload langsung, 'drive' = paste link Google Drive
  const [uploadMode, setUploadMode] = useState<'file' | 'drive'>('file');
  const [driveUrl, setDriveUrl] = useState('');

  useEffect(() => {
    fetchExistingDocuments();
  }, []);

  const fetchExistingDocuments = async () => {
    try {
      const res = await fetch('/api/documents?limit=20');
      if (res.ok) {
        const data = await res.json();
        if (data.documents && data.documents.length > 0) {
          setUploadedList(data.documents);
          const firstWithCover = data.documents.find((d: DocumentResult) => d.imageUrl);
          if (firstWithCover?.imageUrl) {
            setCurrentCoverUrl(firstWithCover.imageUrl);
          }
        }
      }
    } catch (e) {
      console.error('Gagal mengambil daftar dokumen:', e);
    }
  };

  const handlePdfSelect = (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('File dokumen harus berformat PDF (.pdf)');
      return;
    }

    const sizeMB = file.size / (1024 * 1024);

    // Warning soft limit
    if (sizeMB > PDF_WARN_MB) {
      setSizeWarning(`⚠️ File cukup besar (${sizeMB.toFixed(1)} MB). Upload mungkin membutuhkan waktu lebih lama.`);
    } else {
      setSizeWarning('');
    }

    setPdfFile(file);
    setError('');
    setLastSizeInfo(null);
  };

  const handleGlobalCoverChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('File cover harus berupa gambar (JPG, PNG, WEBP)');
      return;
    }

    setUpdatingCover(true);
    setError('');
    setSuccessMsg('');

    try {
      let finalCover: File;
      if (file.size > RESIZE_THRESHOLD) {
        const resized = await resizeImage(file);
        finalCover = new File([resized], file.name.replace(/\.[^.]+$/, '.webp'), {
          type: 'image/webp',
        });
      } else {
        finalCover = file;
      }

      const formData = new FormData();
      formData.append('image', finalCover);

      const res = await fetch('/api/documents/cover', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? 'Gagal memperbarui global cover.');
        setUpdatingCover(false);
        return;
      }

      setCurrentCoverUrl(data.coverUrl);
      setSuccessMsg(`✅ Cover berhasil diperbarui untuk ${data.updatedCount || 'semua'} dokumen!`);

      fetchExistingDocuments();
    } catch (err) {
      setError(`Gagal ganti cover: ${(err as Error).message}`);
    } finally {
      setUpdatingCover(false);
    }
  };

  const handleSubmitDocument = async () => {
    if (!judul.trim()) {
      setError('Judul dokumen wajib diisi.');
      return;
    }

    if (uploadMode === 'file' && !pdfFile) {
      setError('File PDF wajib diupload.');
      return;
    }

    if (uploadMode === 'drive') {
      const trimmed = driveUrl.trim();
      if (!trimmed) {
        setError('Link Google Drive wajib diisi.');
        return;
      }
      // Validasi format URL dasar
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        setError('Link harus dimulai dengan http:// atau https://');
        return;
      }
    }

    setUploading(true);
    setError('');
    setSuccessMsg('');
    setLastSizeInfo(null);

    try {
      let res: Response;

      if (uploadMode === 'file') {
        // Mode file: upload via multipart form
        const formData = new FormData();
        formData.append('judul', judul.trim());
        formData.append('pdf', pdfFile!);
        res = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Mode drive: kirim JSON dengan pdfUrl langsung
        res = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            judul: judul.trim(),
            pdfUrl: driveUrl.trim(),
          }),
        });
      }

      const resText = await res.text();
      let data: { success?: boolean; document?: DocumentResult; error?: string; sizeInfo?: SizeInfo };
      try {
        data = JSON.parse(resText);
      } catch {
        setError(`Server Error (${res.status}): ${resText.slice(0, 150)}`);
        setUploading(false);
        return;
      }

      if (!res.ok || !data.success) {
        setError(data.error ?? `Server error: ${res.status}`);
        setUploading(false);
        return;
      }

      if (data.document) {
        setUploadedList((prev) => [data.document!, ...prev]);
        if (data.document.imageUrl) {
          setCurrentCoverUrl(data.document.imageUrl);
        }
      }

      if (data.sizeInfo) {
        setLastSizeInfo(data.sizeInfo);
      }

      setSuccessMsg(`✅ Dokumen "${judul.trim()}" berhasil ditambahkan!`);
      setJudul('');
      setPdfFile(null);
      setDriveUrl('');
      setSizeWarning('');
    } catch (err) {
      setError(`Koneksi gagal: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) return;
    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUploadedList((prev) => prev.filter((doc) => doc.id !== id));
        setSuccessMsg('Dokumen berhasil dihapus.');
      } else {
        alert('Gagal menghapus dokumen.');
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan saat menghapus.');
    }
  };

  return (
    <div className="container">
      <div className="top-nav">
        <Link href="/upload" className="back-link">← Halaman Tools Upload</Link>
      </div>

      <div className="header">
        <div className="icon">📄</div>
        <h1>Upload & Kelola Dokumen</h1>
        <p>Hanya butuh Judul & File PDF. Tanggal otomatis & Cover berbagi 1 gambar global.</p>
      </div>

      {/* Grid Setup: Global Cover Settings + New Document Form */}
      <div className="main-grid">

        {/* Global Cover Card */}
        <div className="card cover-card">
          <div className="card-header">
            <h2>🖼️ Cover Dokumen (Global)</h2>
            <p className="card-desc">Satu gambar ini berlaku untuk <strong>SEMUA</strong> dokumen di website.</p>
          </div>

          <div className="global-cover-preview-box">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentCoverUrl} alt="Global Document Cover" className="global-cover-img" />
          </div>

          <button
            type="button"
            className="btn-change-cover"
            onClick={() => globalCoverInputRef.current?.click()}
            disabled={updatingCover}
          >
            {updatingCover ? '⏳ Mengunggah Cover Baru...' : '🔄 Ganti Cover Semua Dokumen'}
          </button>
          <input
            ref={globalCoverInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && handleGlobalCoverChange(e.target.files[0])}
          />
        </div>

        {/* Upload New Document Form Card */}
        <div className="card form-card">
          <div className="card-header">
            <h2>📄 Tambah Dokumen Baru</h2>
            <p className="card-desc">Isi judul & upload file PDF dokumen.</p>
          </div>

          {/* Judul Dokumen */}
          <div className="field">
            <label htmlFor="judul">Judul Dokumen <span className="req">*</span></label>
            <input
              id="judul"
              type="text"
              placeholder="Contoh: Laporan Tahunan Rumah Amal 2025"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="input"
            />
          </div>

          {/* Toggle Mode Upload */}
          <div className="mode-toggle-group">
            <button
              type="button"
              className={`mode-btn ${uploadMode === 'file' ? 'mode-btn--active' : ''}`}
              onClick={() => {
                setUploadMode('file');
                setError('');
                setSizeWarning('');
                setDriveUrl('');
              }}
            >
              📄 Upload File PDF
            </button>
            <button
              type="button"
              className={`mode-btn ${uploadMode === 'drive' ? 'mode-btn--active mode-btn--drive' : ''}`}
              onClick={() => {
                setUploadMode('drive');
                setError('');
                setSizeWarning('');
                setPdfFile(null);
              }}
            >
              📁 Pakai Link Drive
            </button>
          </div>

          {/* File PDF Upload — hanya tampil jika mode 'file' */}
          {uploadMode === 'file' && (
            <div className="field">
              <label>File Dokumen (PDF) <span className="req">*</span></label>
              <div
                className={`drop-zone pdf-zone ${isDraggingPdf ? 'dragging' : ''} ${pdfFile ? 'has-pdf' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingPdf(true); }}
                onDragLeave={() => setIsDraggingPdf(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingPdf(false);
                  if (e.dataTransfer.files[0]) handlePdfSelect(e.dataTransfer.files[0]);
                }}
                onClick={() => pdfInputRef.current?.click()}
              >
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files?.[0] && handlePdfSelect(e.target.files[0])}
                />
                {pdfFile ? (
                  <div className="pdf-selected-info">
                    <div className="pdf-badge-icon">📕</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="pdf-filename">{pdfFile.name}</p>
                      <p className="pdf-filesize">
                        <span
                          className={`size-badge ${
                            pdfFile.size / (1024 * 1024) > PDF_WARN_MB
                              ? 'size-badge--warn'
                              : 'size-badge--ok'
                          }`}
                        >
                          {formatFileSize(pdfFile.size)}
                        </span>
                        {' '}• PDF Document
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="drop-icon">📕</div>
                    <p className="drop-text">Klik atau seret file PDF ke sini</p>
                    <p className="drop-hint">Warning jika &gt; {PDF_WARN_MB} MB • Tidak ada batas ukuran</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Link Google Drive — hanya tampil jika mode 'drive' */}
          {uploadMode === 'drive' && (
            <div className="field">
              <label htmlFor="driveUrl">
                Link Google Drive <span className="req">*</span>
              </label>
              <input
                id="driveUrl"
                type="url"
                placeholder="https://drive.google.com/file/d/.../view"
                value={driveUrl}
                onChange={(e) => {
                  setDriveUrl(e.target.value);
                  setError('');
                }}
                className="input"
              />
              <p className="drive-hint">
                💡 Pastikan pengaturan akses file di Google Drive sudah <strong>"Anyone with the link"</strong> agar bisa dibuka publik.
              </p>
            </div>
          )}

          {/* Messages */}
          {error && <div className="error-box">⚠ {error}</div>}
          {sizeWarning && !error && <div className="warning-box">{sizeWarning}</div>}
          {successMsg && (
            <div className="success-box">
              {successMsg}
              {lastSizeInfo && (
                <div className="size-info-row">
                  <span className="size-info-label">Ukuran file:</span>
                  {lastSizeInfo.wasOptimized ? (
                    <>
                      <span className="size-info-original">{lastSizeInfo.originalSizeMB} MB</span>
                      <span className="size-info-arrow">→</span>
                      <span className="size-info-compressed">{lastSizeInfo.compressedSizeMB} MB</span>
                      <span className="size-info-saved">(-{lastSizeInfo.savedPercent}%)</span>
                    </>
                  ) : (
                    <span className="size-info-compressed">{lastSizeInfo.originalSizeMB} MB</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            className="btn-submit"
            onClick={handleSubmitDocument}
            disabled={
              uploading ||
              !judul.trim() ||
              (uploadMode === 'file' ? !pdfFile : !driveUrl.trim())
            }
          >
            {uploading
              ? '⏳ Menyimpan Dokumen...'
              : uploadMode === 'file'
              ? '⬆ Upload Dokumen'
              : '💾 Simpan Link Drive'
            }
          </button>
        </div>

      </div>

      {/* Uploaded Documents List */}
      {uploadedList.length > 0 && (
        <div className="uploaded-section">
          <h2>Daftar Dokumen Tersimpan ({uploadedList.length})</h2>
          <div className="uploaded-grid">
            {uploadedList.map((doc) => (
              <div key={doc.id} className="uploaded-card">
                <div className="card-cover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={doc.imageUrl || currentCoverUrl}
                    alt={doc.judul}
                    className="uploaded-img"
                  />
                  <span className="pdf-tag">PDF</span>
                </div>
                <div className="uploaded-info">
                  <h3 className="uploaded-judul">{doc.judul}</h3>
                  <p className="uploaded-tanggal">
                    {new Date(doc.createdAt).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <div className="card-actions">
                    <a href={doc.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn-view-pdf">
                      Buka PDF ↗
                    </a>
                    <button onClick={() => handleDelete(doc.id)} className="btn-delete">
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 960px;
          margin: 0 auto;
          padding: 2rem 1rem;
          font-family: 'Inter', sans-serif;
        }
        .top-nav {
          margin-bottom: 1rem;
        }
        .back-link {
          font-size: 0.85rem;
          color: #0b6330;
          font-weight: 600;
          text-decoration: none;
        }
        .back-link:hover {
          text-decoration: underline;
        }
        .header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .icon {
          font-size: 2.5rem;
          margin-bottom: 0.2rem;
        }
        h1 {
          font-size: 1.75rem;
          font-weight: 800;
          color: #111827;
          margin: 0.25rem 0 0.4rem;
        }
        .header p {
          color: #6b7280;
          font-size: 0.925rem;
          margin: 0;
        }
        .mode-toggle-group {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.2rem;
          background: #f3f4f6;
          border-radius: 10px;
          padding: 4px;
        }
        .mode-btn {
          flex: 1;
          padding: 0.5rem 0.75rem;
          border: none;
          border-radius: 7px;
          font-size: 0.825rem;
          font-weight: 600;
          cursor: pointer;
          background: transparent;
          color: #6b7280;
          transition: all 0.18s;
        }
        .mode-btn--active {
          background: white;
          color: #0b6330;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }
        .mode-btn--drive.mode-btn--active {
          color: #1a73e8;
        }
        .drive-hint {
          font-size: 0.775rem;
          color: #6b7280;
          margin-top: 0.5rem;
          line-height: 1.5;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
        }
        .main-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        @media (max-width: 768px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
        }
        .card {
          background: white;
          border-radius: 18px;
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }
        .card-header h2 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 0.25rem;
        }
        .card-desc {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0 0 1rem;
          line-height: 1.4;
        }
        .global-cover-preview-box {
          width: 100%;
          aspect-ratio: 3/4;
          background: #f3f4f6;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          margin-bottom: 1rem;
        }
        .global-cover-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .btn-change-cover {
          width: 100%;
          background: #ffc800;
          color: #1a1a1a;
          border: none;
          padding: 0.65rem 1rem;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-change-cover:hover:not(:disabled) {
          background: #e6b400;
        }
        .btn-change-cover:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .field {
          margin-bottom: 1.2rem;
        }
        label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.4rem;
        }
        .req {
          color: #dc2626;
        }
        .input {
          width: 100%;
          padding: 0.65rem 0.9rem;
          border: 1.5px solid #d1d5db;
          border-radius: 10px;
          font-size: 0.925rem;
          color: #111827;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .input:focus {
          border-color: #0b6330;
        }
        .drop-zone {
          border: 2.5px dashed #d1d5db;
          border-radius: 12px;
          padding: 1.5rem 1.25rem;
          text-align: center;
          cursor: pointer;
          background: #f9fafb;
          transition: all 0.2s;
        }
        .drop-zone:hover,
        .drop-zone.dragging {
          border-color: #0b6330;
          background: #f0fdf4;
        }
        .pdf-zone.has-pdf {
          padding: 1rem 1.25rem;
          background: #f0fdf4;
          border-color: #86efac;
        }
        .drop-icon {
          font-size: 1.8rem;
          margin-bottom: 0.35rem;
        }
        .drop-text {
          font-weight: 600;
          color: #374151;
          margin: 0 0 0.2rem;
          font-size: 0.925rem;
        }
        .drop-hint {
          font-size: 0.78rem;
          color: #9ca3af;
          margin: 0;
        }
        .pdf-selected-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-align: left;
        }
        .pdf-badge-icon {
          font-size: 2rem;
        }
        .pdf-filename {
          font-weight: 600;
          font-size: 0.9rem;
          color: #991b1b;
          margin: 0 0 0.15rem;
          word-break: break-all;
        }
        .pdf-filesize {
          font-size: 0.75rem;
          color: #7f1d1d;
          margin: 0;
        }
        .error-box {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          margin-bottom: 1rem;
          color: #b91c1c;
          font-size: 0.875rem;
        }
        .warning-box {
          background: #fffbeb;
          border: 1px solid #fcd34d;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          margin-bottom: 1rem;
          color: #92400e;
          font-size: 0.875rem;
        }
        .success-box {
          background: #f0fdf4;
          border: 1px solid #86efac;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          margin-bottom: 1rem;
          color: #166534;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .size-badge {
          display: inline-block;
          padding: 1px 8px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.3px;
        }
        .size-badge--ok {
          background: #dcfce7;
          color: #15803d;
        }
        .size-badge--warn {
          background: #fef9c3;
          color: #a16207;
        }
        .size-info-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 0.5rem;
          font-size: 0.8rem;
          font-weight: 400;
          flex-wrap: wrap;
        }
        .size-info-label {
          color: #4b7a5a;
          font-weight: 600;
        }
        .size-info-original {
          color: #6b7280;
          text-decoration: line-through;
        }
        .size-info-arrow {
          color: #16a34a;
          font-weight: 700;
        }
        .size-info-compressed {
          color: #15803d;
          font-weight: 700;
        }
        .size-info-saved {
          background: #dcfce7;
          color: #15803d;
          padding: 1px 6px;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
        }
        .btn-submit {
          width: 100%;
          background: #0b6330;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-submit:hover:not(:disabled) {
          background: #084823;
        }
        .uploaded-section {
          margin-top: 2.5rem;
        }
        .uploaded-section h2 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0b6330;
          margin-bottom: 1rem;
        }
        .uploaded-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
        }
        .uploaded-card {
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
        }
        .card-cover {
          position: relative;
          width: 100%;
          height: 150px;
          background: #f3f4f6;
        }
        .uploaded-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .pdf-tag {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #dc2626;
          color: white;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }
        .uploaded-info {
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .uploaded-judul {
          font-size: 0.9rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 0.3rem;
          line-height: 1.35;
        }
        .uploaded-tanggal {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0 0 0.85rem;
        }
        .card-actions {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .btn-view-pdf {
          font-size: 0.78rem;
          color: #0b6330;
          font-weight: 700;
          text-decoration: none;
        }
        .btn-view-pdf:hover {
          text-decoration: underline;
        }
        .btn-delete {
          background: none;
          border: none;
          color: #ef4444;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-delete:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
