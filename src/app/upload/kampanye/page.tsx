'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface KampanyeItem {
  id: string;
  judul: string;
  deskripsi: string | null;
  imageUrl: string;
  targetDana: number | null;
  terkumpul: number;
  tanggalSelesai: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function KampanyeUploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [targetDana, setTargetDana] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // UI State
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [uploaded, setUploaded] = useState<KampanyeItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  const fetchKampanyes = useCallback(async () => {
    try {
      const res = await fetch('/api/kampanye');
      if (res.ok) {
        const data = await res.json();
        setUploaded(data.kampanyes || []);
      }
    } catch (err) {
      console.error('Error fetching kampanye list:', err);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchKampanyes();
  }, [fetchKampanyes]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (JPG, PNG, WEBP, AVIF, dll).');
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
    if (!judul.trim()) {
      setError('Judul kampanye wajib diisi.');
      return;
    }
    if (!imageFile) {
      setError('Gambar cover kampanye wajib diupload.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('judul', judul.trim());
      if (deskripsi.trim()) formData.append('deskripsi', deskripsi.trim());
      if (targetDana) formData.append('targetDana', targetDana);
      if (tanggalSelesai) formData.append('tanggalSelesai', tanggalSelesai);
      formData.append('isActive', isActive ? '1' : '0');
      formData.append('image', imageFile);

      const res = await fetch('/api/kampanye/upload', {
        method: 'POST',
        body: formData,
      });

      const resText = await res.text();
      let data: { success?: boolean; error?: string };
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

      setSuccessMsg(`✅ Kampanye "${judul.trim()}" berhasil ditambahkan!`);

      // Reset form
      setJudul('');
      setDeskripsi('');
      setTargetDana('');
      setTanggalSelesai('');
      setIsActive(true);
      setImageFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);

      // Refresh list
      fetchKampanyes();
    } catch (err) {
      setError(`Koneksi gagal: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kampanye ini?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/kampanye/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUploaded((prev) => prev.filter((item) => item.id !== id));
        setSuccessMsg('Kampanye berhasil dihapus.');
      } else {
        alert('Gagal menghapus kampanye.');
      }
    } catch (err) {
      alert(`Terjadi kesalahan: ${(err as Error).message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (item: KampanyeItem) => {
    setTogglingId(item.id);
    try {
      const res = await fetch(`/api/kampanye/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (res.ok) {
        setUploaded((prev) =>
          prev.map((k) => (k.id === item.id ? { ...k, isActive: !k.isActive } : k))
        );
      } else {
        alert('Gagal memperbarui status kampanye.');
      }
    } catch (err) {
      alert(`Terjadi kesalahan: ${(err as Error).message}`);
    } finally {
      setTogglingId(null);
    }
  };

  const formatRupiah = (val: number | null) => {
    if (val === null || val === undefined) return '0';
    return new Intl.NumberFormat('id-ID').format(val);
  };

  return (
    <div className="container">
      <div className="top-nav">
        <Link href="/upload" className="back-link">← Halaman Tools Upload</Link>
      </div>

      <div className="header">
        <div className="icon">📢</div>
        <h1>Upload & Kelola Kampanye</h1>
        <p>Tambahkan program donasi / kampanye baru beserta target dana, durasi, dan cover image.</p>
      </div>

      {/* Form Card */}
      <div className="form-card">
        {/* Judul Kampanye */}
        <div className="field">
          <label htmlFor="judul">Judul Kampanye <span className="req">*</span></label>
          <input
            id="judul"
            type="text"
            placeholder="Contoh: Donasi Untuk Beasiswa Anak Yatim"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="input"
          />
        </div>

        {/* Deskripsi Kampanye */}
        <div className="field">
          <label htmlFor="deskripsi">Deskripsi Singkat</label>
          <textarea
            id="deskripsi"
            rows={3}
            placeholder="Jelaskan secara singkat mengenai program ini..."
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            className="input textarea"
          />
        </div>

        {/* Grid Target Dana & Tanggal Selesai */}
        <div className="grid-2">
          <div className="field">
            <label htmlFor="targetDana">Target Dana (Rp)</label>
            <input
              id="targetDana"
              type="number"
              placeholder="Contoh: 100000000"
              value={targetDana}
              onChange={(e) => setTargetDana(e.target.value)}
              className="input"
            />
          </div>

          <div className="field">
            <label htmlFor="tanggalSelesai">Tanggal Selesai (Deadline)</label>
            <input
              id="tanggalSelesai"
              type="date"
              value={tanggalSelesai}
              onChange={(e) => setTanggalSelesai(e.target.value)}
              className="input"
            />
          </div>
        </div>

        {/* Image Upload Dropzone */}
        <div className="field">
          <label>Gambar Cover Kampanye <span className="req">*</span></label>
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
                <p className="change-hint">Klik untuk mengganti gambar</p>
              </div>
            ) : (
              <>
                <div className="drop-icon">🖼️</div>
                <p className="drop-text">Klik atau seret gambar kampanye ke sini</p>
                <p className="drop-hint">PNG, JPG, WEBP, AVIF (Gambar rasio 16:9 / horizontal direkomendasikan)</p>
              </>
            )}
          </div>
        </div>

        {/* Status Toggle Checkbox */}
        <div className="checkbox-field">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="checkbox-input"
            />
            <span>Publikasikan & Aktifkan Kampanye</span>
          </label>
        </div>

        {/* Error / Success Messages */}
        {error && <div className="error-box">⚠ {error}</div>}
        {successMsg && <div className="success-box">{successMsg}</div>}

        {/* Submit Button */}
        <button
          className="btn-submit"
          onClick={handleSubmit}
          disabled={uploading || !judul.trim() || !imageFile}
        >
          {uploading ? '⏳ Mengupload Kampanye...' : '⬆ Upload Kampanye'}
        </button>
      </div>

      {/* Uploaded Results / List */}
      <div className="uploaded-section">
        <h2>📋 Daftar Kampanye Terdaftar ({uploaded.length})</h2>

        {loadingList ? (
          <div className="loading-state">Memuat data kampanye...</div>
        ) : uploaded.length === 0 ? (
          <div className="empty-state">Belum ada kampanye yang diupload.</div>
        ) : (
          <div className="uploaded-grid">
            {uploaded.map((item) => (
              <div key={item.id} className="uploaded-card">
                <div className="img-wrapper">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={item.judul} className="uploaded-img" />
                  <span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}>
                    {item.isActive ? '● Aktif' : '○ Nonaktif'}
                  </span>
                </div>
                <div className="uploaded-info">
                  <h3 className="uploaded-nama">{item.judul}</h3>
                  <div className="stats-row">
                    <span>Target: <strong>Rp. {formatRupiah(item.targetDana)}</strong></span>
                  </div>
                  <div className="stats-row">
                    <span>Terkumpul: <strong>Rp. {formatRupiah(item.terkumpul)}</strong></span>
                  </div>
                  <p className="uploaded-tanggal">
                    Deadline: {item.tanggalSelesai ? new Date(item.tanggalSelesai).toLocaleDateString('id-ID', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    }) : '-'}
                  </p>
                  <div className="card-actions">
                    <button
                      onClick={() => handleToggleStatus(item)}
                      disabled={togglingId === item.id}
                      className="btn-toggle"
                    >
                      {togglingId === item.id ? '...' : item.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="btn-delete"
                    >
                      {deletingId === item.id ? '...' : 'Hapus'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .container { max-width: 840px; margin: 0 auto; padding: 2rem 1rem; font-family: 'Inter', sans-serif; }
        .top-nav { margin-bottom: 1rem; }
        .back-link { font-size: 0.85rem; color: #0b6330; font-weight: 600; text-decoration: none; }
        .back-link:hover { text-decoration: underline; }
        .header { text-align: center; margin-bottom: 1.75rem; }
        .icon { font-size: 2.5rem; }
        h1 { font-size: 1.6rem; font-weight: 800; color: #111827; margin: 0.25rem 0 0.25rem; }
        .header p { color: #6b7280; font-size: 0.9rem; }
        .form-card { background: white; border-radius: 16px; padding: 1.75rem; border: 1px solid #e5e7eb; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .field { margin-bottom: 1.25rem; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 640px) { .grid-2 { grid-template-columns: 1fr; } }
        label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.4rem; }
        .req { color: #dc2626; }
        .input { width: 100%; padding: 0.65rem 0.85rem; border: 1.5px solid #d1d5db; border-radius: 10px; font-size: 0.925rem; color: #111827; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
        .input:focus { border-color: #0b6330; }
        .textarea { resize: vertical; min-height: 80px; }
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
        .checkbox-field { margin-bottom: 1.25rem; }
        .checkbox-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 600; color: #374151; cursor: pointer; }
        .checkbox-input { width: 18px; height: 18px; accent-color: #0b6330; cursor: pointer; }
        .error-box { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1rem; color: #b91c1c; font-size: 0.875rem; }
        .success-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1rem; color: #166534; font-size: 0.875rem; font-weight: 600; }
        .btn-submit { width: 100%; background: #0b6330; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: background-color 0.2s; }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-submit:hover:not(:disabled) { background: #084823; }
        .uploaded-section { margin-top: 2.5rem; }
        .uploaded-section h2 { font-size: 1.1rem; font-weight: 800; color: #111827; margin-bottom: 1rem; }
        .loading-state, .empty-state { text-align: center; padding: 2rem; background: #f9fafb; border-radius: 12px; color: #6b7280; font-size: 0.9rem; border: 1px dashed #e5e7eb; }
        .uploaded-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem; }
        .uploaded-card { border-radius: 14px; overflow: hidden; border: 1px solid #e5e7eb; background: white; shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; flex-direction: column; }
        .img-wrapper { height: 135px; width: 100%; background: #f8fafc; position: relative; border-bottom: 1px solid #f1f5f9; }
        .uploaded-img { width: 100%; height: 100%; object-fit: cover; }
        .status-badge { position: absolute; top: 8px; right: 8px; padding: 3px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
        .status-badge.active { background: #dcfce7; color: #15803d; }
        .status-badge.inactive { background: #fee2e2; color: #b91c1c; }
        .uploaded-info { padding: 0.85rem; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
        .uploaded-nama { font-size: 0.9rem; font-weight: 800; color: #111827; margin: 0 0 0.35rem; line-height: 1.3; }
        .stats-row { font-size: 0.78rem; color: #4b5563; margin-bottom: 2px; }
        .uploaded-tanggal { font-size: 0.75rem; color: #9ca3af; margin: 0.4rem 0 0.75rem; }
        .card-actions { display: flex; align-items: center; justify-content: space-between; gap: 8px; border-top: 1px solid #f3f4f6; padding-top: 8px; margin-top: 4px; }
        .btn-toggle { font-size: 0.75rem; color: #0b6330; background: transparent; border: none; font-weight: 700; cursor: pointer; padding: 0; }
        .btn-toggle:hover { text-decoration: underline; }
        .btn-delete { font-size: 0.75rem; color: #dc2626; background: transparent; border: none; font-weight: 700; cursor: pointer; padding: 0; }
        .btn-delete:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
