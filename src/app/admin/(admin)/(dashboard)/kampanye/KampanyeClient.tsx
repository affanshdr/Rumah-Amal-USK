"use client";

import { useState } from "react";
import { addKampanye, updateKampanye, deleteKampanye, toggleKampanyeStatus } from "@/actions/kampanye";
import { Kampanye } from "@prisma/client";
import Image from "next/image";

export default function KampanyeClient({ initialData }: { initialData: Kampanye[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKampanye, setEditingKampanye] = useState<Kampanye | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState<string>("Pilih File...");

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const calculateSisaHari = (tanggalSelesai: Date | null) => {
    if (!tanggalSelesai) return null;
    const now = new Date();
    const end = new Date(tanggalSelesai);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const openAddModal = () => {
    setEditingKampanye(null);
    setFileName("Pilih File...");
    setIsModalOpen(true);
  };

  const openEditModal = (kampanye: Kampanye) => {
    setEditingKampanye(kampanye);
    setFileName("Biarkan kosong jika tidak ganti gambar");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingKampanye(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      if (editingKampanye) {
        formData.append('id', editingKampanye.id);
        await updateKampanye(formData);
      } else {
        await addKampanye(formData);
      }
      closeModal();
    } catch (error: any) {
      alert(error.message || "Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    await toggleKampanyeStatus(id, currentStatus);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kampanye ini? Data tidak dapat dikembalikan.")) {
      await deleteKampanye(id);
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800">Daftar Kampanye</h2>
          <button 
            onClick={openAddModal}
            className="bg-[#005621] hover:bg-[#004219] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
          >
            + Tambah Kampanye
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-gray-800 border-b border-gray-100">
              <tr>
                <th className="p-4 font-bold rounded-tl-xl w-24">Banner</th>
                <th className="p-4 font-bold">Detail Kampanye</th>
                <th className="p-4 font-bold">Progress Dana</th>
                <th className="p-4 font-bold">Durasi</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold rounded-tr-xl text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {initialData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Belum ada kampanye. Silakan tambahkan kampanye baru.
                  </td>
                </tr>
              ) : (
                initialData.map((kampanye) => {
                  const sisaHari = calculateSisaHari(kampanye.tanggalSelesai);
                  const progressPersen = kampanye.targetDana 
                    ? Math.min(Math.round((kampanye.terkumpul / kampanye.targetDana) * 100), 100) 
                    : 0;

                  return (
                    <tr key={kampanye.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="w-20 h-14 relative rounded-lg overflow-hidden bg-gray-100 shadow-xs border border-gray-200">
                          <Image src={kampanye.imageUrl} alt={kampanye.judul} fill className="object-cover" />
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-gray-800 max-w-[200px]">
                        <p className="truncate">{kampanye.judul}</p>
                        {kampanye.deskripsi && (
                          <p className="text-xs text-gray-500 mt-1 font-normal truncate">{kampanye.deskripsi}</p>
                        )}
                      </td>
                      <td className="p-4 min-w-[150px]">
                        <p className="text-xs font-bold text-[#005621] mb-1">
                          {formatRupiah(kampanye.terkumpul)}
                        </p>
                        {kampanye.targetDana ? (
                          <>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1 overflow-hidden">
                              <div className="bg-[#FFBB0C] h-1.5 rounded-full" style={{ width: `${progressPersen}%` }}></div>
                            </div>
                            <p className="text-[10px] text-gray-500 text-right">Target: {formatRupiah(kampanye.targetDana)}</p>
                          </>
                        ) : (
                          <p className="text-[10px] text-gray-400 italic">Tanpa target</p>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {sisaHari !== null ? (
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${sisaHari === 0 ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                            {sisaHari === 0 ? 'Berakhir' : `${sisaHari} Hari Lagi`}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-xs">Selamanya</span>
                        )}
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => handleToggle(kampanye.id, kampanye.isActive)}
                          className={`px-3 py-1 text-xs font-bold rounded-full transition-colors cursor-pointer ${kampanye.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {kampanye.isActive ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button onClick={() => openEditModal(kampanye)} className="text-blue-600 hover:text-blue-800 font-semibold text-sm cursor-pointer">Edit</button>
                        <button onClick={() => handleDelete(kampanye.id)} className="text-red-500 hover:text-red-700 font-semibold text-sm cursor-pointer">Hapus</button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <h3 className="font-bold text-gray-800">{editingKampanye ? 'Edit Kampanye' : 'Tambah Kampanye Baru'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl font-black cursor-pointer">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              {/* Gambar Banner */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Gambar Banner (16:9 disarankan) <span className="text-red-500">*</span></label>
                <div className="flex items-center justify-between border border-gray-300 rounded-xl p-2 bg-gray-50/80">
                  <input
                    type="file"
                    id="kampanye-image"
                    name="image"
                    accept="image/*"
                    className="hidden"
                    required={!editingKampanye} // Required only if new
                    onChange={(e) => setFileName(e.target.files?.[0]?.name || (editingKampanye ? "Biarkan kosong jika tidak diganti" : "Pilih File..."))}
                  />
                  <span className="text-xs text-gray-500 truncate px-2">{fileName}</span>
                  <button
                    type="button"
                    onClick={() => document.getElementById("kampanye-image")?.click()}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Browse...
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Judul Kampanye <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="judul" 
                  required 
                  defaultValue={editingKampanye?.judul}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#005621]" 
                  placeholder="Contoh: Donasi Untuk Dek Rian"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Deskripsi Singkat</label>
                <textarea 
                  name="deskripsi" 
                  rows={2} 
                  defaultValue={editingKampanye?.deskripsi || ''}
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#005621]" 
                  placeholder="Opsional: Bantu Muhammad Rian Al Fadhil..."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Target Dana (Rp)</label>
                  <input 
                    type="number" 
                    name="targetDana" 
                    defaultValue={editingKampanye?.targetDana || ''}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#005621]" 
                    placeholder="Contoh: 100000000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Tanggal Selesai (Deadline)</label>
                  <input 
                    type="date" 
                    name="tanggalSelesai" 
                    defaultValue={editingKampanye?.tanggalSelesai ? new Date(editingKampanye.tanggalSelesai).toISOString().split('T')[0] : ''}
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#005621]" 
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  name="isActive" 
                  value="1" 
                  defaultChecked={editingKampanye ? editingKampanye.isActive : true}
                  className="w-4 h-4 text-[#005621] rounded focus:ring-[#005621] cursor-pointer"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700 font-semibold cursor-pointer">
                  Tampilkan kampanye ini di form donasi (Aktif)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-bold text-[#000] bg-[#FFBB0C] hover:bg-[#e8b500] rounded-xl shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Kampanye'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
