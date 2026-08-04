"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteDocumentAction } from "@/actions/dokumen";

type DocumentRow = {
  id: string;
  judul: string;
  imageUrl: string | null;
  pdfUrl: string;
  createdAt: Date;
};

interface DokumenClientProps {
  initialData: DocumentRow[];
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

export default function DokumenClient({
  initialData,
  currentPage = 1,
  totalPages = 1,
  totalCount = initialData.length,
}: DokumenClientProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const [currentCoverUrl, setCurrentCoverUrl] = useState<string>("/dokumen-cover.svg");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

  const [judul, setJudul] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"file" | "drive">("file");
  const [driveUrl, setDriveUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [updatingCover, setUpdatingCover] = useState(false);
  const [search, setSearch] = useState("");

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedCover = typeof window !== "undefined" ? localStorage.getItem("global_doc_cover") : null;
    if (savedCover) setCurrentCoverUrl(savedCover);
  }, []);

  const filtered = data.filter((item) =>
    item.judul.toLowerCase().includes(search.toLowerCase())
  );

  const handleGlobalCoverChange = async (file: File) => {
    if (!file.type.startsWith("image/")) { alert("File cover harus berupa gambar"); return; }
    setUpdatingCover(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/documents/cover", { method: "POST", body: formData });
      const resData = await res.json();
      if (!res.ok || !resData.success) { alert(resData.error ?? "Gagal memperbarui cover."); return; }
      const newUrl = resData.coverUrl;
      setCurrentCoverUrl(newUrl);
      localStorage.setItem("global_doc_cover", newUrl);
      setIsCoverModalOpen(false);
      router.refresh();
    } catch (err) { alert(`Gagal ganti cover: ${(err as Error).message}`); }
    finally { setUpdatingCover(false); }
  };

  const handleSubmitDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim()) { alert("Judul dokumen wajib diisi."); return; }
    if (uploadMode === "file" && !pdfFile) { alert("File PDF wajib diupload."); return; }
    if (uploadMode === "drive" && !driveUrl.trim()) { alert("Link Google Drive wajib diisi."); return; }

    setUploading(true);
    try {
      let res: Response;
      if (uploadMode === "file") {
        const formData = new FormData();
        formData.append("judul", judul.trim());
        formData.append("pdf", pdfFile!);
        if (currentCoverUrl) formData.append("coverUrl", currentCoverUrl);
        res = await fetch("/api/documents/upload", { method: "POST", body: formData });
      } else {
        res = await fetch("/api/documents/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ judul: judul.trim(), pdfUrl: driveUrl.trim(), coverUrl: currentCoverUrl }),
        });
      }
      const data = await res.json();
      if (!res.ok || !data.success) { alert(data.error ?? "Gagal mengunggah dokumen"); setUploading(false); return; }
      
      setIsAddModalOpen(false);
      setJudul(""); setPdfFile(null); setDriveUrl("");
      router.refresh();
    } catch (err) { alert(`Koneksi gagal: ${(err as Error).message}`); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) return;
    setData((prev) => prev.filter((doc) => doc.id !== id));
    await deleteDocumentAction(id);
    router.refresh();
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 border-b border-gray-100">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text" placeholder="Cari dokumen…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#005621] bg-gray-50/60 placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCoverModalOpen(true)}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              🖼️ Kelola Cover Global
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-[#005621] hover:bg-[#004219] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              Tambah Dokumen
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50/80 text-gray-700 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 font-bold">Judul Dokumen</th>
                <th className="px-5 py-3 font-bold">Format</th>
                <th className="px-5 py-3 font-bold">Tanggal Unggah</th>
                <th className="px-5 py-3 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm font-semibold">{search ? "Tidak ada yang cocok" : "Belum ada dokumen"}</p>
                      {!search && <p className="text-xs text-gray-300">Klik &quot;Tambah Dokumen&quot; untuk mengunggah file PDF baru.</p>}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-black text-red-600">PDF</span>
                        </div>
                        <p className="font-semibold text-gray-800 text-xs leading-snug">{item.judul}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-block px-2.5 py-1 bg-red-50 text-red-700 text-[11px] font-bold rounded-full border border-red-100">
                        DOCUMENT (PDF)
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-500">{formatTanggal(item.createdAt)}</td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={item.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                        >
                          Buka ↗
                        </a>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Hapus"
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalCount > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500 font-medium">
              Menampilkan <span className="font-bold text-gray-700">{filtered.length}</span> dari <span className="font-bold text-gray-700">{totalCount}</span> dokumen
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                {currentPage > 1 ? (
                  <Link
                    href={`/admin/dokumen?page=${currentPage - 1}`}
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
                        href={`/admin/dokumen?page=${p}`}
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
                    href={`/admin/dokumen?page=${currentPage + 1}`}
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

      {/* MODAL TAMBAH DOKUMEN */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-base">Tambah Dokumen Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-lg cursor-pointer">×</button>
            </div>

            <form onSubmit={handleSubmitDocument} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Judul Dokumen <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Laporan Tahunan Rumah Amal 2025"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#005621]"
                />
              </div>

              <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setUploadMode("file")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${uploadMode === "file" ? "bg-white text-[#005621] shadow-2xs" : "text-gray-500"}`}
                >
                  📄 Upload File PDF
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("drive")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${uploadMode === "drive" ? "bg-white text-[#005621] shadow-2xs" : "text-gray-500"}`}
                >
                  📁 Link Google Drive
                </button>
              </div>

              {uploadMode === "file" ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">File PDF <span className="text-red-500">*</span></label>
                  <div
                    onClick={() => pdfInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-[#005621] bg-gray-50 transition-colors"
                  >
                    <input
                      ref={pdfInputRef}
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && setPdfFile(e.target.files[0])}
                    />
                    {pdfFile ? (
                      <p className="text-xs font-bold text-emerald-700">📕 {pdfFile.name}</p>
                    ) : (
                      <>
                        <span className="text-2xl block mb-1">📕</span>
                        <p className="text-xs font-bold text-gray-700">Klik untuk memilih file PDF</p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Link Google Drive <span className="text-red-500">*</span></label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/..."
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#005621]"
                  />
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer">
                  Batal
                </button>
                <button type="submit" disabled={uploading} className="px-6 py-2 text-xs font-bold text-white bg-[#005621] hover:bg-[#004219] rounded-xl transition-colors cursor-pointer disabled:opacity-50">
                  {uploading ? "Menyimpan…" : "💾 Simpan Dokumen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GLOBAL COVER */}
      {isCoverModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-base">Cover Dokumen (Global)</h3>
              <button onClick={() => setIsCoverModalOpen(false)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-lg cursor-pointer">×</button>
            </div>
            <div className="p-6 space-y-4 text-center">
              <div className="w-40 aspect-[3/4] mx-auto rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={currentCoverUrl} alt="Cover Dokumen" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs text-gray-500">Gambar ini otomatis menjadi cover default untuk seluruh file PDF dokumen publik.</p>
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleGlobalCoverChange(e.target.files[0])} />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={updatingCover}
                className="w-full py-2.5 bg-[#005621] text-white hover:bg-[#004219] font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {updatingCover ? "⏳ Uploading..." : "🔄 Ganti Cover Global"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
