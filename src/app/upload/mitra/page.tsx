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

export default function MitraUploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [nama, setNama] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
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
    } catch (err) {
      console.error('Error fetching mitras:', err);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchMitras();
  }, [fetchMitras]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (JPG, PNG, WEBP, SVG).');
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = async () => {
    if (!nama.trim()) {
      setError('Nama mitra wajib diisi.');
      return;
    }
    if (!imageFile) {
      setError('Logo / Gambar mitra wajib diupload.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      let finalFile: File;
      if (imageFile.size > RESIZE_THRESHOLD && !imageFile.type.includes('svg')) {
        const resized = await resizeImage(imageFile);
        finalFile = new File([resized], imageFile.name.replace(/\.[^.]+$/, '.webp'), {
          type: 'image/webp',
        });
      } else {
        finalFile = imageFile;
      }

      const formData = new FormData();
      formData.append('image', finalFile);
      formData.append('nama', nama.trim());

      const res = await fetch('/api/mitra/upload', {
        method: 'POST',
        body: formData,
      });

      const resText = await res.text();
      let data: { success?: boolean; mitra?: MitraResult; error?: string };
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

      if (data.mitra) {
        setUploaded((prev) => [data.mitra!, ...prev]);
      }

      // Reset form
      setNama('');
      setImageFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
    } catch (err) {
      setError(`Koneksi gagal: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus mitra ini?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/mitra/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUploaded((prev) => prev.filter((m) => m.id !== id));
      } else {
        alert('Gagal menghapus mitra.');
      }
    } catch (err) {
      alert(`Terjadi kesalahan: ${(err as Error).message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="icon">🤝</div>
        <h1>Upload Mitra & Kerjasama</h1>
        <p>Tambahkan logo/gambar dan nama mitra resmi Rumah Amal.</p>
      </div>

      {/* Form Card */}
      <div className="form-card">
        {/* Nama Mitra */}
        <div className="field">
          <label htmlFor="nama">Nama Mitra</label>
          <input
            id="nama"
            type="text"
            placeholder="Contoh: Bank Syariah Indonesia (BSI)"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="input"
          />
          <p className="field-hint">Masukkan nama lengkap lembaga / mitra kerjasama</p>
        </div>

        {/* Image Upload Dropzone */}
        <div className="field">
          <label>Logo / Gambar Mitra</label>
          <div
            className={`drop-zone ${isDragging ? 'dragging' : ''} ${preview ? 'has-preview' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            {preview ? (
              <div className="preview-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview" className="preview-img" />
                <p className="preview-name">{imageFile?.name}</p>
                <p className="change-hint">Klik untuk mengganti logo</p>
              </div>
            ) : (
              <>
                <div className="drop-icon">🏢</div>
                <p className="drop-text">Klik atau seret logo mitra ke sini</p>
                <p className="drop-hint">PNG, JPG, WEBP, SVG (Rekomendasi latar transparan / putih)</p>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-box">⚠ {error}</div>
        )}

        {/* Submit Button */}
        <button
          className="btn-submit"
          onClick={handleSubmit}
          disabled={uploading || !nama.trim() || !imageFile}
        >
          {uploading ? '⏳ Mengupload...' : '⬆ Upload Mitra'}
        </button>
      </div>

      {/* Uploaded Results / List */}
      <div className="uploaded-section">
        <h2>📋 Daftar Mitra Terdaftar ({uploaded.length})</h2>
        
        {loadingList ? (
          <div className="loading-state">Memuat data mitra...</div>
        ) : uploaded.length === 0 ? (
          <div className="empty-state">Belum ada mitra yang diupload.</div>
        ) : (
          <div className="uploaded-grid">
            {uploaded.map((u) => (
              <div key={u.id} className="uploaded-card">
                <div className="img-wrapper">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u.imageUrl} alt={u.nama} className="uploaded-img" />
                </div>
                <div className="uploaded-info">
                  <p className="uploaded-nama">{u.nama}</p>
                  <p className="uploaded-tanggal">
                    {new Date(u.createdAt).toLocaleDateString('id-ID', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </p>
                  <div className="card-actions">
                    <a href={u.imageUrl} target="_blank" rel="noopener noreferrer" className="btn-link">Lihat Logo ↗</a>
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={deletingId === u.id}
                      className="btn-delete"
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

      <style jsx>{`
        .container { max-width: 720px; margin: 0 auto; padding: 2rem 1rem; font-family: 'Inter', sans-serif; }
        .header { text-align: center; margin-bottom: 1.75rem; }
        .icon { font-size: 2.5rem; }
        h1 { font-size: 1.6rem; font-weight: 800; color: #111827; margin: 0.25rem 0 0.25rem; }
        .header p { color: #6b7280; font-size: 0.9rem; }
        .form-card { background: white; border-radius: 16px; padding: 1.75rem; border: 1px solid #e5e7eb; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .field { margin-bottom: 1.25rem; }
        label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.4rem; }
        .input { width: 100%; padding: 0.65rem 0.85rem; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 0.925rem; color: #111827; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
        .input:focus { border-color: #0b6330; }
        .field-hint { font-size: 0.78rem; color: #9ca3af; margin: 0.3rem 0 0; }
        .drop-zone { border: 2.5px dashed #d1d5db; border-radius: 12px; padding: 1.75rem 1.5rem; text-align: center; cursor: pointer; background: #f9fafb; transition: all 0.2s; }
        .drop-zone:hover, .drop-zone.dragging { border-color: #0b6330; background: #f0fdf4; }
        .drop-zone.has-preview { padding: 1rem; }
        .drop-icon { font-size: 2rem; margin-bottom: 0.4rem; }
        .drop-text { font-weight: 600; color: #374151; margin: 0 0 0.25rem; font-size: 0.95rem; }
        .drop-hint { font-size: 0.8rem; color: #9ca3af; margin: 0; }
        .preview-container { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
        .preview-img { max-height: 180px; max-width: 100%; object-fit: contain; border-radius: 8px; background: #fff; padding: 6px; border: 1px solid #e5e7eb; }
        .preview-name { font-size: 0.78rem; color: #6b7280; margin: 0; }
        .change-hint { font-size: 0.75rem; color: #9ca3af; margin: 0; }
        .error-box { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1rem; color: #b91c1c; font-size: 0.875rem; }
        .btn-submit { width: 100%; background: #0b6330; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: background-color 0.2s; }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-submit:hover:not(:disabled) { background: #084823; }
        .uploaded-section { margin-top: 2.5rem; }
        .uploaded-section h2 { font-size: 1.1rem; font-weight: 800; color: #111827; margin-bottom: 1rem; }
        .loading-state, .empty-state { text-align: center; padding: 2rem; background: #f9fafb; border-radius: 12px; color: #6b7280; font-size: 0.9rem; border: 1px dashed #e5e7eb; }
        .uploaded-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
        .uploaded-card { border-radius: 14px; overflow: hidden; border: 1px solid #e5e7eb; background: white; shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; flex-direction: column; }
        .img-wrapper { height: 120px; width: 100%; background: #f8fafc; display: flex; align-items: center; justify-content: center; padding: 12px; border-bottom: 1px solid #f1f5f9; }
        .uploaded-img { max-height: 100%; max-width: 100%; object-fit: contain; }
        .uploaded-info { padding: 0.75rem; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
        .uploaded-nama { font-size: 0.875rem; font-weight: 700; color: #111827; margin: 0 0 0.25rem; line-height: 1.3; }
        .uploaded-tanggal { font-size: 0.75rem; color: #9ca3af; margin: 0 0 0.75rem; }
        .card-actions { display: flex; items-center; justify-between: space-between; gap: 8px; border-top: 1px solid #f3f4f6; pt: 8px; margin-top: 4px; }
        .btn-link { font-size: 0.75rem; color: #0b6330; font-weight: 600; text-decoration: none; }
        .btn-link:hover { text-decoration: underline; }
        .btn-delete { font-size: 0.75rem; color: #dc2626; background: transparent; border: none; font-weight: 600; cursor: pointer; padding: 0; }
        .btn-delete:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
