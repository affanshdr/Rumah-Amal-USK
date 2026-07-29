'use client';

import { useRef, useState } from 'react';

interface NewsletterResult {
  id: string;
  judul: string;
  imageUrl: string;
  tanggal: string;
}

const MAX_WIDTH = 1600;
const QUALITY = 0.99;
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

export default function NewsletterUploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [judul, setJudul] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploaded, setUploaded] = useState<NewsletterResult[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
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
    if (!imageFile || !judul.trim() || !tanggal) {
      setError('Semua field wajib diisi.');
      return;
    }
    setUploading(true);
    setError('');

    try {
      let finalFile: File;
      if (imageFile.size > RESIZE_THRESHOLD) {
        const resized = await resizeImage(imageFile);
        finalFile = new File([resized], imageFile.name.replace(/\.[^.]+$/, '.webp'), {
          type: 'image/webp',
        });
      } else {
        finalFile = imageFile;
      }

      const formData = new FormData();
      formData.append('image', finalFile);
      formData.append('judul', judul.trim());
      formData.append('tanggal', tanggal);

      const res = await fetch('/api/newsletter/upload', {
        method: 'POST',
        body: formData,
      });

      const resText = await res.text();
      let data: { success?: boolean; newsletter?: NewsletterResult; error?: string };
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

      if (data.newsletter) {
        setUploaded((prev) => [data.newsletter!, ...prev]);
      }

      // Reset form
      setJudul('');
      setTanggal('');
      setImageFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
    } catch (err) {
      setError(`Koneksi gagal: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="icon">📰</div>
        <h1>Upload Newsletter</h1>
        <p>Isi judul, tanggal terbit, dan upload cover newsletter.</p>
      </div>

      {/* Form */}
      <div className="form-card">
        {/* Judul */}
        <div className="field">
          <label htmlFor="judul">Judul Newsletter</label>
          <input
            id="judul"
            type="text"
            placeholder="Contoh: Edisi Oktober 2025"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="input"
          />
          <p className="field-hint">Akan ditampilkan sebagai &quot;NEWSLETTER: {judul || 'Edisi...'}&quot;</p>
        </div>

        {/* Tanggal */}
        <div className="field">
          <label htmlFor="tanggal">Tanggal Terbit</label>
          <input
            id="tanggal"
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="input"
          />
        </div>

        {/* Image Upload */}
        <div className="field">
          <label>Cover Image</label>
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
                <p className="change-hint">Klik untuk ganti gambar</p>
              </div>
            ) : (
              <>
                <div className="drop-icon">📁</div>
                <p className="drop-text">Klik atau seret gambar ke sini</p>
                <p className="drop-hint">JPG, PNG, WEBP</p>
              </>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="error-box">⚠ {error}</div>
        )}

        {/* Submit */}
        <button
          className="btn-submit"
          onClick={handleSubmit}
          disabled={uploading || !judul.trim() || !tanggal || !imageFile}
        >
          {uploading ? '⏳ Mengupload...' : '⬆ Upload Newsletter'}
        </button>
      </div>

      {/* Uploaded Results */}
      {uploaded.length > 0 && (
        <div className="uploaded-section">
          <h2>✅ Berhasil Diupload ({uploaded.length})</h2>
          <div className="uploaded-grid">
            {uploaded.map((u) => (
              <div key={u.id} className="uploaded-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.imageUrl} alt={u.judul} className="uploaded-img" />
                <div className="uploaded-info">
                  <p className="uploaded-judul">NEWSLETTER: {u.judul}</p>
                  <p className="uploaded-tanggal">
                    {new Date(u.tanggal).toLocaleDateString('id-ID', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })}
                  </p>
                  <a href={u.imageUrl} target="_blank" rel="noopener noreferrer">Lihat ↗</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .container { max-width: 680px; margin: 0 auto; padding: 2rem 1rem; font-family: 'Inter', sans-serif; }
        .header { text-align: center; margin-bottom: 1.5rem; }
        .icon { font-size: 2.5rem; }
        h1 { font-size: 1.6rem; font-weight: 700; color: #111827; margin: 0.25rem 0 0.25rem; }
        .header p { color: #6b7280; font-size: 0.9rem; }
        .form-card { background: white; border-radius: 16px; padding: 1.75rem; border: 1px solid #e5e7eb; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .field { margin-bottom: 1.25rem; }
        label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.4rem; }
        .input { width: 100%; padding: 0.6rem 0.85rem; border: 1.5px solid #d1d5db; border-radius: 9px; font-size: 0.925rem; color: #111827; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
        .input:focus { border-color: #6366f1; }
        .field-hint { font-size: 0.78rem; color: #9ca3af; margin: 0.3rem 0 0; }
        .drop-zone { border: 2.5px dashed #d1d5db; border-radius: 12px; padding: 1.75rem 1.5rem; text-align: center; cursor: pointer; background: #f9fafb; transition: all 0.2s; }
        .drop-zone:hover, .drop-zone.dragging { border-color: #6366f1; background: #eef2ff; }
        .drop-zone.has-preview { padding: 0.75rem; }
        .drop-icon { font-size: 1.8rem; margin-bottom: 0.4rem; }
        .drop-text { font-weight: 600; color: #374151; margin: 0 0 0.25rem; font-size: 0.95rem; }
        .drop-hint { font-size: 0.8rem; color: #9ca3af; margin: 0; }
        .preview-container { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
        .preview-img { max-height: 220px; max-width: 100%; object-fit: contain; border-radius: 8px; }
        .preview-name { font-size: 0.78rem; color: #6b7280; margin: 0; }
        .change-hint { font-size: 0.75rem; color: #9ca3af; margin: 0; }
        .error-box { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1rem; color: #b91c1c; font-size: 0.875rem; }
        .btn-submit { width: 100%; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; padding: 0.7rem 1.5rem; border-radius: 10px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-submit:hover:not(:disabled) { opacity: 0.88; }
        .uploaded-section { margin-top: 2rem; }
        .uploaded-section h2 { font-size: 1rem; font-weight: 700; color: #059669; margin-bottom: 0.75rem; }
        .uploaded-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem; }
        .uploaded-card { border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; background: white; box-shadow: 0 1px 6px rgba(0,0,0,0.05); }
        .uploaded-img { width: 100%; height: 150px; object-fit: cover; display: block; }
        .uploaded-info { padding: 0.6rem 0.75rem; }
        .uploaded-judul { font-size: 0.8rem; font-weight: 700; color: #111827; margin: 0 0 0.2rem; }
        .uploaded-tanggal { font-size: 0.75rem; color: #6b7280; margin: 0 0 0.35rem; }
        .uploaded-info a { font-size: 0.75rem; color: #6366f1; text-decoration: none; }
        .uploaded-info a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
