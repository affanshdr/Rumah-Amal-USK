'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';

type RiwayatItem = {
    id: number;
    nama: string;
    jenisZakat?: string;
    jenisInfaq?: string;
    jumlahZakat?: string;
    jumlahInfaq?: string;
    status: string;
    createdAt: string;
};

export default function RiwayatPage() {
    const [nip, setNip] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<{
        dosen: { nama: string } | null;
        riwayatZakat: RiwayatItem[];
        riwayatInfaq: RiwayatItem[];
    } | null>(null);

    async function handleCari(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setData(null);

        const res = await fetch(`/api/riwayat?nip=${encodeURIComponent(nip)}`);
        const json = await res.json();

        if (!res.ok) {
            setError(json.error);
        } else {
            setData(json);
        }
        setLoading(false);
    }

    function formatRupiah(angka: string | number) {
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
        <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <Sidebar />

                <div className="lg:col-span-9 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-[#000] border-b pb-3 mb-4">
                            Cek Riwayat Pembayaran Zakat
                        </h3>

                        <form onSubmit={handleCari} className="flex gap-3">
                            <input
                                type="text"
                                value={nip}
                                onChange={(e) => setNip(e.target.value)}
                                placeholder="Masukkan NIP Anda"
                                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#005621]"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#FFBB0C] hover:bg-[#FFBB0C]-hover text-[#000] font-bold px-6 py-2 rounded-md text-sm shadow-sm transition-smooth disabled:opacity-50"
                            >
                                {loading ? 'Mencari...' : 'Cari'}
                            </button>
                        </form>

                        {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
                    </div>

                    {data && (
                        <>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h4 className="text-sm font-bold text-[#000] mb-3">Riwayat Zakat</h4>
                                {data.riwayatZakat.length ? (
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className="border-b text-xs text-gray-500 uppercase">
                                                <th className="py-2">Tanggal</th>
                                                <th className="py-2">Jenis</th>
                                                <th className="py-2">Jumlah</th>
                                                <th className="py-2">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.riwayatZakat.map((item) => (
                                                <tr key={item.id} className="border-b">
                                                    <td className="py-2">{new Date(item.createdAt).toLocaleDateString('id-ID')}</td>
                                                    <td className="py-2 capitalize">{item.jenisZakat}</td>
                                                    <td className="py-2">{formatRupiah(item.jumlahZakat!)}</td>
                                                    <td className="py-2">
                                                        <span className={statusBadge(item.status)}>{item.status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-xs text-gray-500">Belum ada riwayat pembayaran zakat.</p>
                                )}
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h4 className="text-sm font-bold text-[#000] mb-3">Riwayat Infaq</h4>
                                {data.riwayatInfaq.length ? (
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className="border-b text-xs text-gray-500 uppercase">
                                                <th className="py-2">Tanggal</th>
                                                <th className="py-2">Jenis</th>
                                                <th className="py-2">Jumlah</th>
                                                <th className="py-2">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.riwayatInfaq.map((item) => (
                                                <tr key={item.id} className="border-b">
                                                    <td className="py-2">{new Date(item.createdAt).toLocaleDateString('id-ID')}</td>
                                                    <td className="py-2 capitalize">{item.jenisInfaq}</td>
                                                    <td className="py-2">{formatRupiah(item.jumlahInfaq!)}</td>
                                                    <td className="py-2">
                                                        <span className={statusBadge(item.status)}>{item.status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-xs text-gray-500">Belum ada riwayat pembayaran infaq.</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}