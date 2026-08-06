"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faSpinner, faSave } from "@fortawesome/free-solid-svg-icons";
import { addGalleryImage, deleteGalleryImage, uploadGalleryImages } from "@/actions/gallery";

type GalleryRow = {
  id: string;
  imageUrl: string;
  title: string | null;
  createdAt: Date;
};

interface GaleriClientProps {
  initialData: GalleryRow[];
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
}

function formatTanggal(date: Date | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function GaleriClient({
  initialData,
  currentPage = 1,
  totalPages = 1,
  totalCount = initialData.length,
}: GaleriClientProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewingItem, setPreviewingItem] = useState<GalleryRow | null>(null);

  const [uploading, setUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [uploadedPreview, setUploadedPreview] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "Galeri");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) { const err = await res.json(); alert(`Upload gagal: ${err.error}`); return; }
      const result = await res.json();
      setUploadedPreview(result.url);
      setImageUrlInput(result.url);
    } catch (err) { alert(`Kesalahan: ${(err as Error).message}`); }
    finally { setUploading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) {
      alert("Pilih file gambar atau masukkan URL gambar.");
      return;
    }
    setUploading(true);
    try {
      await addGalleryImage(imageUrlInput.trim());
      setIsAddModalOpen(false);
      setImageUrlInput("");
      setTitleInput("");
      setUploadedPreview("");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan foto");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, url: string) => {
    if (!confirm("Hapus foto galeri ini? Data tidak dapat dikembalikan.")) return;
    setData((prev) => prev.filter((item) => item.id !== id));
    await deleteGalleryImage(id, url);
    router.refresh();
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-800">Daftar Foto Dokumentasi Galeri</h2>
            <p className="text-xs text-gray-400">Total {totalCount} foto tersimpan</p>
          </div>
          <button
            onClick={() => { setIsAddModalOpen(true); setUploadedPreview(""); setImageUrlInput(""); setTitleInput(""); }}
            className="flex items-center gap-2 bg-[#005621] hover:bg-[#004219] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Tambah Foto Galeri
          </button>
        </div>

        {/* Grid/Table View */}
        <div className="p-5">
          {data.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <div className="flex flex-col items-center gap-2">
                <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-semibold">Belum ada foto galeri</p>
                <p className="text-xs text-gray-300">Klik &quot;Tambah Foto Galeri&quot; untuk mengunggah dokumentasi baru.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.map((item) => (
                <div key={item.id} className="group relative rounded-xl overflow-hidden border border-gray-200 bg-white shadow-2xs flex flex-col transition-all hover:shadow-md">
                  <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.title || "Galeri"} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPreviewingItem(item)}
                        className="w-9 h-9 rounded-full bg-white text-gray-800 flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        title="Preview"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.imageUrl)}
                        className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors cursor-pointer"
                        title="Hapus"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col justify-between flex-1">
                    <p className="text-xs font-semibold text-gray-800 line-clamp-1">{item.title || "Dokumentasi Kegiatan"}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{formatTanggal(item.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer stat & Pagination */}
        {totalCount > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500 font-medium">
              Menampilkan <span className="font-bold text-gray-700">{data.length}</span> dari <span className="font-bold text-gray-700">{totalCount}</span> foto
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                {currentPage > 1 ? (
                  <Link
                    href={`/admin/galeri?page=${currentPage - 1}`}
                    className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg transition-colors shadow-2xs"
                  >
                    « Prev
                  </Link>
                ) : (
                  <span className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-300 text-xs font-bold rounded-lg cursor-not-allowed">
                    « Prev
                  </span>
                )}

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    const isActive = p === currentPage;
                    const showPage =
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - currentPage) <= 1;

                    if (!showPage) {
                      if (p === 2 && currentPage > 3) {
                        return <span key="ellipsis-start" className="text-xs text-gray-400 px-1">...</span>;
                      }
                      if (p === totalPages - 1 && currentPage < totalPages - 2) {
                        return <span key="ellipsis-end" className="text-xs text-gray-400 px-1">...</span>;
                      }
                      return null;
                    }

                    return (
                      <Link
                        key={p}
                        href={`/admin/galeri?page=${p}`}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${isActive
                          ? "bg-[#005621] text-white shadow-xs"
                          : "bg-white border border-gray-200 hover:bg-gray-100 text-gray-700"
                          }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                </div>

                {currentPage < totalPages ? (
                  <Link
                    href={`/admin/galeri?page=${currentPage + 1}`}
                    className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg transition-colors shadow-2xs"
                  >
                    Next »
                  </Link>
                ) : (
                  <span className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-300 text-xs font-bold rounded-lg cursor-not-allowed">
                    Next »
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL UPLOAD FOTO */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-base">Tambah Foto Galeri</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-lg cursor-pointer">×</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">File Foto / Gambar <span className="text-red-500">*</span></label>
                {(uploadedPreview || imageUrlInput) && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-gray-200 max-h-[200px] flex justify-center bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={uploadedPreview || imageUrlInput} alt="Preview" className="max-h-[200px] object-contain p-2" />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="px-4 py-2 bg-[#005621] text-white hover:bg-[#004219] rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
                    {uploading ? (
                      <><FontAwesomeIcon icon={faSpinner} className="animate-spin" /> Mengupload…</>
                    ) : (
                      <><FontAwesomeIcon icon={faUpload} /> Upload File Foto</>
                    )}
                  </button>
                  <span className="text-xs text-gray-400">atau</span>
                  <input
                    type="url"
                    placeholder="Tempel URL Gambar"
                    value={imageUrlInput}
                    onChange={(e) => { setImageUrlInput(e.target.value); setUploadedPreview(e.target.value); }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#005621]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Judul / Keterangan Foto <span className="text-gray-400 font-normal">(opsional)</span></label>
                <input
                  type="text"
                  placeholder="Contoh: Penyaluran Beasiswa USK 2026"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#005621]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer">
                  Batal
                </button>
                <button type="submit" disabled={uploading || !imageUrlInput.trim()} className="px-6 py-2 text-xs font-bold text-white bg-[#005621] hover:bg-[#004219] rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
                  {uploading ? "Simpan…" : <><FontAwesomeIcon icon={faSave} /> Simpan Foto</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW FULL MODAL */}
      {previewingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewingItem(null)}>
          <div className="bg-white max-w-3xl rounded-2xl overflow-hidden shadow-2xl border border-gray-200 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end pb-2">
              <button onClick={() => setPreviewingItem(null)} className="text-gray-500 font-bold text-lg hover:text-black">×</button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewingItem.imageUrl} alt={previewingItem.title || "Foto"} className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain mx-auto" />
            <p className="text-center font-bold text-sm text-gray-800 mt-3">{previewingItem.title || "Dokumentasi Kegiatan"}</p>
          </div>
        </div>
      )}
    </>
  );
}
