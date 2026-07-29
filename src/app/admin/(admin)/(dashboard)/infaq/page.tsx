'use client';

import { useEffect, useState } from 'react';

type InfaqItem = {
    id: number;
    nama: string;
    nip: string | null;
    tipePembayar: string;
    jenisInfaq: string;
    jumlahInfaq: string;
    buktiPembayaran: string | null;
    tanggal: string;
    pesan: string;
    status: string;
};

export default function AdminInfaqPage() {
    const [data, setData] = useState<InfaqItem[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadData() {
        setLoading(true);
        const res = await fetch('/api/admin/infaq');
        const json = await res.json();
        setData(json);
        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    async function handleAction(id: number, action: 'approve' | 'reject') {
        await fetch(`/api/admin/infaq/${id}/${action}`, { method: 'PATCH' });
        loadData();
    }

    function formatRupiah(angka: string) {
        return 'Rp ' + Number(angka).toLocaleString('id-ID');
    }

    function statusBadge(status: string) {
        const map: Record<string, string> = {
            lunas: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            ditolak: 'bg-red-100 text-red-700',
        };
        return `px-2 py-1 rounded-full text-[10px] font-bold ${map[status] || ''}`;
    }

    return (
        <div>
            <h1 className="text-xl font-bold text-[#000] mb-6">Data Pembayaran Infaq</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="border-b text-xs text-gray-500 uppercase bg-gray-50">
                            <th className="py-3 px-4">Nama</th>
                            <th className="py-3 px-4">Jenis</th>
                            <th className="py-3 px-4">Jumlah</th>
                            <th className="py-3 px-4">Bukti</th>
                            <th className="py-3 px-4">Tanggal</th>
                            <th className="py-3 px-4">Pesan</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={9} className="text-center py-6 text-gray-400 text-xs">
                                    Memuat data...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="text-center py-10 text-gray-400 text-xs">
                                    Belum ada data pembayaran infaq.
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={item.id} className="border-b">
                                    <td className="py-3 px-4">
                                        {item.nama}
                                        {item.nip && <><br /><span className="text-xs text-gray-400">NIP: {item.nip}</span></>}
                                    </td>
                                    <td className="py-3 px-4 capitalize">{item.jenisInfaq}</td>
                                    <td className="py-3 px-4">{formatRupiah(item.jumlahInfaq)}</td>
                                    <td className="py-3 px-4">
                                        {item.buktiPembayaran ? (
                                            <a href={item.buktiPembayaran} target="_blank" className="text-[#000] underline text-xs">Lihat</a>
                                        ) : <span className="text-xs text-gray-400">-</span>}
                                    </td>
                                    <td className="py-3 px-4">{item.tanggal}</td>
                                    <td className="py-3 px-4">{item.pesan}</td>
                                    <td className="py-3 px-4"><span className={statusBadge(item.status)}>{item.status}</span></td>
                                    <td className="py-3 px-4 space-x-2">
                                        {item.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleAction(item.id, 'approve')} className="text-xs text-green-700 font-bold hover:underline">Approve</button>
                                                <button onClick={() => handleAction(item.id, 'reject')} className="text-xs text-red-700 font-bold hover:underline">Reject</button>
                                            </>
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