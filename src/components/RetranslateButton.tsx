'use client';

import { useState } from 'react';

interface RetranslateResult {
  total: number;
  updated: number;
  skipped: number;
  errors: number;
}

interface RetranslateResponse {
  success: boolean;
  dryRun: boolean;
  message: string;
  results: {
    announcements?: RetranslateResult;
    news?: RetranslateResult;
    programs?: RetranslateResult;
  };
}

export default function RetranslateButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RetranslateResponse | null>(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const handleRetranslate = async (forceAll: boolean) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/admin/retranslate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          models: ['announcements', 'news', 'programs'],
          forceAll,
          dryRun: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal melakukan retranslate');
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900">🌐 Perbaiki Terjemahan Konten</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Re-generate konten EN/AR lama agar tombol &amp; banner tetap tampil dengan benar
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="text-xs text-[#0b6330] font-semibold underline cursor-pointer"
        >
          {open ? 'Tutup' : 'Lihat opsi'}
        </button>
      </div>

      {open && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleRetranslate(false)}
              className="flex-1 px-4 py-2 bg-[#0b6330] hover:bg-[#074722] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              {loading ? '⏳ Memproses…' : '🔧 Perbaiki yang Bermasalah'}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                if (confirm('Ini akan re-translate SEMUA konten (termasuk yang tidak bermasalah). Lanjutkan?')) {
                  handleRetranslate(true);
                }
              }}
              className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              {loading ? '⏳ Memproses…' : '♻️ Re-translate Semua Konten'}
            </button>
          </div>

          <p className="text-[11px] text-gray-400">
            <strong>Perbaiki yang Bermasalah</strong>: Hanya memproses artikel yang berisi tombol/banner kustom.<br />
            <strong>Re-translate Semua</strong>: Memproses ulang semua artikel (lebih lambat, gunakan jika diperlukan).
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-semibold">
              ❌ {error}
            </div>
          )}

          {result && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
              <p className="font-bold mb-2">✅ {result.message}</p>
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="text-emerald-700 font-semibold">
                    <th className="pb-1">Model</th>
                    <th className="pb-1">Total</th>
                    <th className="pb-1">Diperbarui</th>
                    <th className="pb-1">Dilewati</th>
                    <th className="pb-1">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.results).map(([key, val]) => (
                    <tr key={key} className="border-t border-emerald-200">
                      <td className="py-0.5 font-semibold capitalize">{key}</td>
                      <td className="py-0.5">{val.total}</td>
                      <td className="py-0.5 text-emerald-700 font-bold">{val.updated}</td>
                      <td className="py-0.5 text-gray-500">{val.skipped}</td>
                      <td className="py-0.5 text-red-500">{val.errors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
