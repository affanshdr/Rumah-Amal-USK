"use client";

import { useState } from "react";
import { Donasi } from "@prisma/client";
import { approveDonasi, rejectDonasi } from "@/actions/donasi";

export default function DonasiTableClient({ initialData }: { initialData: Donasi[] }) {
  const [data, setData] = useState<Donasi[]>(initialData);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    try {
      await approveDonasi(id);
      setData(data.map(d => d.id === id ? { ...d, status: 'lunas' } : d));
    } catch (error) {
      alert("Gagal menyetujui donasi");
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Yakin ingin menolak donasi ini?")) return;
    
    setLoadingId(id);
    try {
      await rejectDonasi(id);
      setData(data.map(d => d.id === id ? { ...d, status: 'ditolak' } : d));
    } catch (error) {
      alert("Gagal menolak donasi");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/50 text-gray-800 border-b border-gray-100">
            <tr>
              <th className="p-4 font-bold">Tanggal</th>
              <th className="p-4 font-bold">Donatur</th>
              <th className="p-4 font-bold">Program Donasi</th>
              <th className="p-4 font-bold">Jumlah</th>
              <th className="p-4 font-bold">Bukti</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  Belum ada data donasi yang masuk.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-800">{item.nama}</p>
                    <p className="text-xs text-gray-500 uppercase">{item.tipePembayar}</p>
                    {item.noHp && <p className="text-xs text-gray-500 mt-0.5">{item.noHp}</p>}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.jenisDonasi}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-800">
                    {formatRupiah(item.jumlahDonasi)}
                  </td>
                  <td className="p-4">
                    {item.buktiPembayaran ? (
                      <a href={item.buktiPembayaran} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-semibold text-xs">
                        Lihat Bukti
                      </a>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Tidak ada</span>
                    )}
                  </td>
                  <td className="p-4">
                    {item.status === 'pending' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Menunggu</span>
                    )}
                    {item.status === 'lunas' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">Lunas</span>
                    )}
                    {item.status === 'ditolak' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">Ditolak</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {item.status === 'pending' ? (
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleApprove(item.id)}
                          disabled={loadingId === item.id}
                          className="bg-green-100 hover:bg-green-200 text-green-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(item.id)}
                          disabled={loadingId === item.id}
                          className="bg-red-100 hover:bg-red-200 text-red-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-50"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Selesai</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
