'use client';

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const WARNA_JENIS = ['#F5B016', '#063A1E', '#0b522c', '#e09f0f', '#94a3b8'];

function formatRupiahSingkat(angka: number) {
    if (angka >= 1_000_000) return `${(angka / 1_000_000).toFixed(1)}jt`;
    if (angka >= 1_000) return `${(angka / 1_000).toFixed(0)}rb`;
    return String(angka);
}

function formatRupiahTooltip(value: number | string | Array<number | string> | undefined): string {
    if (value === undefined) return '-';
    const angka = Array.isArray(value) ? Number(value[0]) : Number(value);
    return `Rp ${angka.toLocaleString('id-ID')}`;
}

export function ChartBulanan({ data }: { data: { bulan: string; total: number }[] }) {
    if (data.length === 0) {
        return <p className="text-xs text-gray-400 text-center py-12">Belum ada data zakat lunas dalam 6 bulan terakhir.</p>;
    }

    return (
        <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={formatRupiahSingkat} />
                <Tooltip formatter={(value: any) => formatRupiahTooltip(value)} />
                <Line type="monotone" dataKey="total" stroke="#F5B016" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
        </ResponsiveContainer>
    );
}

export function ChartJenis({ data }: { data: { jenis: string; total: number }[] }) {
    if (data.length === 0) {
        return <p className="text-xs text-gray-400 text-center py-12">Belum ada data zakat lunas untuk ditampilkan.</p>;
    }

    return (
        <ResponsiveContainer width="100%" height={260}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="total"
                    nameKey="jenis"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(props) => {
                        const payload = (props as { payload?: { jenis?: string } }).payload;
                        return payload?.jenis ?? '';
                    }}
                >
                    {data.map((_, index) => (
                        <Cell key={index} fill={WARNA_JENIS[index % WARNA_JENIS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatRupiahTooltip(value)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
        </ResponsiveContainer>
    );
}