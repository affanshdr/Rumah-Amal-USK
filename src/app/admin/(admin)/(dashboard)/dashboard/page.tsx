import { getDashboardStats } from '@/lib/dashboard-stats';
import { ChartBulanan, ChartJenis } from '@/components/DashboardCharts';
import StatusBadge from '@/components/StatusBadge';

function formatRupiah(angka: number) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}

export default async function AdminDashboardPage() {
    const stats = await getDashboardStats();

    return (
        <div>
            <h1 className="text-xl font-bold text-[#000] mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Total Zakat (Lunas)</p>
                    <p className="text-xl font-bold text-[#1D7E05]">{formatRupiah(stats.totalZakat)}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Total Infaq (Lunas)</p>
                    <p className="text-xl font-bold text-[#1D7E05]">{formatRupiah(stats.totalInfaq)}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Zakat Menunggu Verifikasi</p>
                    <p className="text-xl font-bold text-yellow-600">{stats.pendingZakat}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Infaq Menunggu Verifikasi</p>
                    <p className="text-xl font-bold text-yellow-600">{stats.pendingInfaq}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-[#000] mb-4">Zakat per Bulan (6 Bulan Terakhir)</h3>
                    <ChartBulanan data={stats.grafikBulanan} />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-[#000] mb-4">Distribusi per Jenis Zakat</h3>
                    <ChartJenis data={stats.grafikJenis} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-[#000] mb-4">Pembayaran Zakat Terbaru</h3>
                {stats.riwayatTerbaru.length === 0 ? (
                    <p className="text-xs text-gray-400">Belum ada data pembayaran.</p>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b text-xs text-gray-500 uppercase">
                                <th className="py-2">Nama</th>
                                <th className="py-2">Jenis</th>
                                <th className="py-2">Jumlah</th>
                                <th className="py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.riwayatTerbaru.map((item: any) => (
                                <tr key={item.id} className="border-b">
                                    <td className="py-2">{item.nama}</td>
                                    <td className="py-2 capitalize">{item.jenisZakat}</td>
                                    <td className="py-2">{formatRupiah(Number(item.jumlahZakat))}</td>
                                    <td className="py-2"><StatusBadge status={item.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}