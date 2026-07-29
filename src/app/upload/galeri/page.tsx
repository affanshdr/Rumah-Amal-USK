'use client';

import { useRef, useState, useCallback } from 'react';

interface UploadedImage {
  imageUrl: string;
  name: string;
  preview: string;
}

interface UploadResult {
  uploaded: { imageUrl: string }[];
  errors: string[];
}

const MAX_WIDTH = 1600;
const QUALITY = 0.99;
const RESIZE_THRESHOLD = 1_000_000; // hanya resize jika > 1 MB

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
          else reject(new Error(`Gagal konversi ${file.name} ke WebP`));
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

export default function GalleryUploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<UploadedImage[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const newPreviews = arr.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, []);

  const removePreview = (idx: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleUpload = async () => {
    if (previews.length === 0) return;
    setUploading(true);
    setErrors([]);

    const resizeErrors: string[] = [];
    const validPreviews: typeof previews = [];
    const formData = new FormData();

    for (const p of previews) {
      try {
        if (p.file.size > RESIZE_THRESHOLD) {
          const resized = await resizeImage(p.file);
          const webpFile = new File([resized], p.file.name.replace(/\.[^.]+$/, '.webp'), {
            type: 'image/webp',
          });
          formData.append('files', webpFile);
        } else {
          formData.append('files', p.file);
        }
        validPreviews.push(p);
      } catch (e) {
        resizeErrors.push(`Resize gagal - ${(e as Error).message}`);
      }
    }

    if (validPreviews.length === 0) {
      setErrors(resizeErrors);
      setUploading(false);
      return;
    }

    try {
      const res = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: formData,
      });

      const resText = await res.text();
      let data: UploadResult & { error?: string };
      try {
        data = JSON.parse(resText);
      } catch {
        setErrors([...resizeErrors, `Server Error (${res.status}): ${resText.slice(0, 150)}`]);
        setUploading(false);
        return;
      }

      if (!res.ok) {
        setErrors([...resizeErrors, data.error ?? `Server error: ${res.status}`]);
        setUploading(false);
        return;
      }

      const newUploaded = data.uploaded.map((u, i) => ({
        imageUrl: u.imageUrl,
        name: validPreviews[i]?.file.name ?? '',
        preview: validPreviews[i]?.preview ?? u.imageUrl,
      }));

      setUploaded((prev) => [...newUploaded, ...prev]);
      setErrors([...resizeErrors, ...(data.errors ?? [])]);
      setPreviews([]);
    } catch (err) {
      setErrors([...resizeErrors, `Koneksi gagal: ${(err as Error).message}`]);
      console.error('[upload error]', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="icon">🖼️</div>
        <h1>Upload Galeri</h1>
        <p>File &gt; 1MB otomatis di-resize &amp; dikonversi WebP.</p>
      </div>

      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <div className="drop-icon">📁</div>
        <p className="drop-text">Klik atau seret foto ke sini</p>
        <p className="drop-hint">JPG, PNG, WEBP • Bisa pilih banyak sekaligus</p>
      </div>

      {previews.length > 0 && (
        <div className="preview-section">
          <div className="preview-header">
            <span>{previews.length} foto dipilih</span>
            <button className="btn-upload" onClick={handleUpload} disabled={uploading}>
              {uploading ? '⏳ Mengupload...' : `⬆ Upload ${previews.length} Foto`}
            </button>
          </div>
          <div className="preview-grid">
            {previews.map((p, i) => (
              <div key={i} className="preview-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.preview} alt={p.file.name} className="preview-img" />
                <button
                  className="remove-btn"
                  onClick={() => removePreview(i)}
                  title="Hapus"
                >✕</button>
                <p className="preview-name">{p.file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="error-box">
          <strong>⚠ Gagal:</strong>
          <ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}

      {uploaded.length > 0 && (
        <div className="uploaded-section">
          <h2>✅ Berhasil ({uploaded.length})</h2>
          <div className="uploaded-grid">
            {uploaded.map((u, i) => (
              <div key={i} className="uploaded-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.imageUrl} alt={u.name} className="uploaded-img" />
                <a href={u.imageUrl} target="_blank" rel="noopener noreferrer">Lihat ↗</a>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .container { max-width: 860px; margin: 0 auto; padding: 2rem 1rem; font-family: 'Inter', sans-serif; }
        .header { text-align: center; margin-bottom: 2rem; }
        .icon { font-size: 2.5rem; }
        h1 { font-size: 1.6rem; font-weight: 700; color: #111827; margin: 0.25rem 0 0.25rem; }
        .header p { color: #6b7280; font-size: 0.9rem; }
        .drop-zone { border: 2.5px dashed #d1d5db; border-radius: 14px; padding: 2.5rem 2rem; text-align: center; cursor: pointer; background: #f9fafb; transition: all 0.2s; margin-bottom: 1.5rem; }
        .drop-zone:hover, .drop-zone.dragging { border-color: #6366f1; background: #eef2ff; }
        .drop-icon { font-size: 2rem; margin-bottom: 0.5rem; }
        .drop-text { font-weight: 600; color: #374151; margin: 0 0 0.3rem; }
        .drop-hint { font-size: 0.82rem; color: #9ca3af; margin: 0; }
        .preview-section { margin-bottom: 1.5rem; }
        .preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; font-weight: 600; color: #374151; }
        .btn-upload { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; padding: 0.5rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
        .btn-upload:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-upload:hover:not(:disabled) { opacity: 0.88; }
        .preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 0.6rem; }
        .preview-card { position: relative; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; background: #f3f4f6; }
        .preview-img { width: 100%; height: 110px; object-fit: cover; display: block; }
        .remove-btn { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.5); color: white; border: none; width: 22px; height: 22px; border-radius: 50%; font-size: 0.65rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .remove-btn:hover { background: rgba(220,38,38,0.85); }
        .preview-name { font-size: 0.68rem; color: #6b7280; padding: 0.2rem 0.4rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; }
        .error-box { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 10px; padding: 0.9rem 1.1rem; margin-bottom: 1.5rem; color: #b91c1c; font-size: 0.88rem; }
        .error-box ul { margin: 0.4rem 0 0; padding-left: 1.2rem; }
        .uploaded-section { margin-top: 1rem; }
        .uploaded-section h2 { font-size: 1rem; font-weight: 700; color: #059669; margin-bottom: 0.75rem; }
        .uploaded-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.75rem; }
        .uploaded-card { border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb; background: #f9fafb; }
        .uploaded-img { width: 100%; height: 120px; object-fit: cover; display: block; }
        .uploaded-card a { display: block; padding: 0.35rem 0.5rem; font-size: 0.75rem; color: #6366f1; text-decoration: none; }
        .uploaded-card a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
