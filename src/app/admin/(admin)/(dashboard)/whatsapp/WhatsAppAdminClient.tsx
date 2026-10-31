'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import {
  faCheckCircle,
  faCircleNotch,
  faPaperPlane,
  faInfoCircle,
  faRotateRight,
  faExclamationTriangle,
  faCloud,
  faKey,
  faCoins,
  faCalendarCheck,
  faComments,
  faBoxArchive,
  faArrowUpRightFromSquare,
  faSignal,
  faCircleXmark,
} from '@fortawesome/free-solid-svg-icons';

type FonnteStatus = {
  status: 'connected' | 'disconnected' | 'not_configured' | 'offline' | 'error' | 'loading';
  isWhatsAppActive?: boolean;
  deviceStatus?: 'connect' | 'disconnect';
  device?: string | null;
  name?: string | null;
  quota?: string | number | null;
  package?: string | null;
  expired?: string | null;
  messages?: number | null;
  error?: string | null;
  checkedAt?: string | null;
};

export default function WhatsAppAdminClient() {
  const [data, setData] = useState<FonnteStatus>({ status: 'loading' });
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState(
    "Assalamu'alaikum Wr. Wb.\nIni adalah uji coba pesan WhatsApp OTP dari sistem Rumah Amal USK via Fonnte."
  );
  const [sendingTest, setSendingTest] = useState(false);
  const [testSuccessMsg, setTestSuccessMsg] = useState('');
  const [testErrorMsg, setTestErrorMsg] = useState('');

  async function fetchStatus(showLoading = false) {
    if (showLoading) setLoadingStatus(true);
    try {
      const res = await fetch('/api/admin/whatsapp/status', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setData({ status: 'offline', error: 'Service status tidak merespon.' });
      }
    } catch {
      setData({ status: 'offline', error: 'Gagal menghubungi server aplikasi.' });
    } finally {
      if (showLoading) setLoadingStatus(false);
    }
  }

  useEffect(() => {
    fetchStatus();

    // Polling otomatis setiap 10 detik terutama jika sedang disconnected/belum login
    const interval = setInterval(() => {
      fetchStatus(false);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  async function handleTestSend(e: React.FormEvent) {
    e.preventDefault();
    if (!testPhone.trim() || !testMessage.trim()) return;

    setSendingTest(true);
    setTestSuccessMsg('');
    setTestErrorMsg('');

    try {
      const res = await fetch('/api/admin/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhone.trim(),
          message: testMessage.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setTestSuccessMsg(json.message || `Pesan berhasil terkirim ke +${testPhone}!`);
        // Refresh status & kuota setelah kirim
        fetchStatus(false);
        setTimeout(() => setTestSuccessMsg(''), 6000);
      } else {
        setTestErrorMsg(json.error || 'Gagal mengirim pesan uji coba.');
      }
    } catch (err: any) {
      setTestErrorMsg(err.message || 'Terjadi kesalahan sistem saat kirim pesan.');
    } finally {
      setSendingTest(false);
    }
  }

  const isConnected = data.status === 'connected';
  const isDisconnected = data.status === 'disconnected';
  const isNotConfigured = data.status === 'not_configured';
  const isErrorOrOffline = data.status === 'error' || data.status === 'offline';
  const isLoading = data.status === 'loading';

  // Format jam terakhir cek
  const formattedCheckedTime = data.checkedAt
    ? new Date(data.checkedAt).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center text-2xl shrink-0">
            <FontAwesomeIcon icon={faWhatsapp} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                WhatsApp OTP Gateway (Fonnte)
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <FontAwesomeIcon icon={faCloud} className="text-[9px]" /> Cloud API
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Pantau status login nomor WhatsApp resmi Rumah Amal USK di Fonnte untuk pengiriman kode OTP.
            </p>
          </div>
        </div>

        {/* Status Pill & Refresh Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchStatus(true)}
            disabled={loadingStatus}
            className="p-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 text-xs font-bold"
            title="Muat Ulang Status"
          >
            <FontAwesomeIcon icon={faRotateRight} className={loadingStatus ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Periksa Status</span>
          </button>

          {isConnected ? (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              🟢 WA AKTIF (TERHUBUNG)
            </span>
          ) : isDisconnected ? (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-red-100 text-red-800 border border-red-300">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              🔴 WA BELUM LOGIN DI FONNTE
            </span>
          ) : isNotConfigured ? (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
              <FontAwesomeIcon icon={faKey} className="w-3 h-3 text-amber-600" />
              TOKEN BELUM DIISI
            </span>
          ) : isLoading ? (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
              <FontAwesomeIcon icon={faCircleNotch} className="animate-spin w-3 h-3 text-gray-500" />
              Memeriksa...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-red-100 text-red-800 border border-red-300">
              <FontAwesomeIcon icon={faExclamationTriangle} className="w-3 h-3 text-red-600" />
              TOKEN ERROR
            </span>
          )}
        </div>
      </div>

      {/* Main Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Kartu Status Login WhatsApp di Fonnte */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faSignal} className="text-[#0b6330]" />
                Status Perangkat WhatsApp di Fonnte
              </h2>
              {formattedCheckedTime && (
                <span className="text-[11px] text-gray-400 font-medium">
                  Cek terakhir: {formattedCheckedTime} WIB
                </span>
              )}
            </div>

            {/* KONDISI 1: WA AKTIF & LOGIN (CONNECTED) */}
            {isConnected && (
              <div className="space-y-4">
                {/* Banner Status Aktif */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-2xl shrink-0 shadow-xs">
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                        Status WhatsApp di Fonnte
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/80 text-emerald-900">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        Online & Ready
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-emerald-950 mt-0.5">
                      WhatsApp Sudah Login & Aktif
                    </h3>
                    <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                      Nomor resmi Rumah Amal USK <strong className="font-mono text-emerald-950 font-black">+{data.device || 'Terhubung'}</strong> siap mengirimkan kode OTP secara otomatis.
                    </p>
                  </div>
                </div>

                {/* Grid Detail Akun & Kuota Fonnte */}
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCoins} className="text-amber-500" /> Sisa Kuota OTP
                    </span>
                    <span className="text-base font-black text-gray-800 font-mono">
                      {data.quota !== null && data.quota !== undefined ? `${data.quota} pesan` : 'Tak Terbatas'}
                    </span>
                  </div>

                  <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faBoxArchive} className="text-blue-500" /> Paket Fonnte
                    </span>
                    <span className="text-sm font-black text-gray-800">
                      {data.package || 'Reguler'}
                    </span>
                  </div>

                  <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCalendarCheck} className="text-emerald-500" /> Masa Aktif
                    </span>
                    <span className="text-xs font-bold text-gray-800">
                      {data.expired || 'Aktif'}
                    </span>
                  </div>

                  <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faComments} className="text-purple-500" /> Pesan Terkirim
                    </span>
                    <span className="text-sm font-black text-gray-800 font-mono">
                      {data.messages !== null && data.messages !== undefined ? data.messages : '-'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-600 text-[11px] flex items-center justify-between">
                  <span>Nama Device: <strong>{data.name || 'Fonnte Device'}</strong></span>
                  <a
                    href="https://fonnte.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0b6330] hover:text-[#074722] font-bold hover:underline inline-flex items-center gap-1"
                  >
                    Buka Fonnte <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px]" />
                  </a>
                </div>
              </div>
            )}

            {/* KONDISI 2: TOKEN ADA, TAPI WA BELUM LOGIN / TERPUTUS DI FONNTE */}
            {isDisconnected && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center text-xl shrink-0">
                      <FontAwesomeIcon icon={faCircleXmark} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-red-900">
                        WhatsApp Belum Login / Terputus di Fonnte
                      </h3>
                      <p className="text-xs text-red-700 mt-1 leading-relaxed">
                        API Token Fonnte terhubung, tetapi nomor WhatsApp <strong>belum login (status: Disconnect)</strong>. Kode OTP tidak akan bisa terkirim ke donatur sebelum nomor WhatsApp ditautkan.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/80 p-3.5 rounded-xl border border-red-200 text-xs text-gray-800 space-y-2">
                    <p className="font-bold text-gray-900">👉 Cara Mengaktifkan / Menghubungkan:</p>
                    <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-gray-700 leading-relaxed">
                      <li>Buka website <strong><a href="https://fonnte.com" target="_blank" rel="noopener noreferrer" className="underline font-bold text-[#0b6330]">fonnte.com</a></strong> dan login.</li>
                      <li>Masuk ke menu <strong>Device</strong> di dashboard Fonnte.</li>
                      <li>Buka WhatsApp di HP resmi Rumah Amal ➔ <strong>Perangkat Tertaut</strong> ➔ <strong>Scan QR Code</strong> yang tampil di Fonnte.</li>
                      <li>Setelah status di Fonnte berubah menjadi <strong>Connect</strong>, halaman ini akan otomatis berubah menjadi <span className="text-emerald-700 font-bold">Aktif & Terhubung</span>.</li>
                    </ol>
                  </div>

                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <a
                      href="https://fonnte.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0b6330] hover:bg-[#074722] text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <span>Buka Dashboard Fonnte untuk Scan QR</span>
                      <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[10px]" />
                    </a>
                    <button
                      type="button"
                      onClick={() => fetchStatus(true)}
                      disabled={loadingStatus}
                      className="px-3 py-2 rounded-xl bg-white border border-red-200 text-red-800 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <FontAwesomeIcon icon={faRotateRight} className={loadingStatus ? 'animate-spin' : ''} />
                      Cek Lagi
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* KONDISI 3: TOKEN BELUM DIISI */}
            {isNotConfigured && (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0">
                    <FontAwesomeIcon icon={faKey} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-amber-950">
                      Token API Fonnte Belum Diatur di Server
                    </h3>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      Sistem belum dapat memeriksa status WhatsApp karena variabel <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">FONNTE_API_TOKEN</code> belum diisi di file <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">.env</code>.
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
                  <p className="font-bold text-gray-900">Langkah Pengaturan Token:</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-gray-700">
                    <li>Salin Token Device dari menu Device di <a href="https://fonnte.com" target="_blank" rel="noopener noreferrer" className="underline font-bold text-[#0b6330]">fonnte.com</a>.</li>
                    <li>Buka file <strong>.env</strong> di proyek web Rumah Amal ini.</li>
                    <li>Tambahkan baris berikut:</li>
                  </ol>
                  <div className="bg-gray-900 text-emerald-400 p-2.5 rounded-lg font-mono text-[11px] select-all">
                    FONNTE_API_TOKEN=&quot;token_anda_disini&quot;
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => fetchStatus(true)}
                    className="px-4 py-2 rounded-xl bg-[#0b6330] hover:bg-[#074722] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <FontAwesomeIcon icon={faRotateRight} className={loadingStatus ? 'animate-spin' : ''} />
                    Sudah Diisi? Cek Sekarang
                  </button>
                </div>
              </div>
            )}

            {/* KONDISI 4: TOKEN SALAH ATAU SERVER FONNTE OFFLINE */}
            {isErrorOrOffline && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-2">
                <p className="font-bold flex items-center gap-2 text-red-800 text-sm">
                  <FontAwesomeIcon icon={faExclamationTriangle} /> Terjadi Masalah Saat Memeriksa Fonnte
                </p>
                <p className="text-[11px] text-red-700 leading-relaxed">
                  {data.error || 'Token API Fonnte tidak valid atau server Fonnte tidak merespon.'}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => fetchStatus(true)}
                    className="px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white text-[11px] font-bold cursor-pointer"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 mt-6 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>Status diperbarui otomatis setiap 10 detik</span>
            <span className="font-mono">API: api.fonnte.com/device</span>
          </div>
        </div>

        {/* Kolom Kanan: Uji Coba Pengiriman Pesan (OTP Simulation) */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2 mb-1">
              <FontAwesomeIcon icon={faPaperPlane} className="text-[#0b6330]" />
              Uji Coba Pengiriman OTP
            </h2>
            <p className="text-xs text-gray-500 mb-5">
              Kirim pesan uji coba untuk memastikan bahwa pesan WhatsApp berhasil sampai ke nomor penerima.
            </p>

            {isDisconnected && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 font-medium">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-600 shrink-0" />
                <span>Peringatan: WhatsApp saat ini belum login di Fonnte. Pesan uji coba akan gagal sampai nomor WhatsApp dihubungkan.</span>
              </div>
            )}

            <form onSubmit={handleTestSend} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nomor WhatsApp Penerima <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="Contoh: 081234567890 atau 6281234567890"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#0b6330] bg-gray-50/50 focus:bg-white transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Isi Pesan Teks <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:outline-none focus:border-[#0b6330] bg-gray-50/50 focus:bg-white transition-all font-medium leading-relaxed"
                />
              </div>

              {testSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>{testSuccessMsg}</span>
                </div>
              )}

              {testErrorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <span>{testErrorMsg}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={sendingTest || !testPhone.trim()}
                  className="bg-[#0b6330] hover:bg-[#074722] text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {sendingTest ? (
                    <>
                      <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" />
                      Mengirim via Fonnte...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} />
                      Kirim Pesan Uji Coba
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100 text-gray-400 text-[11px] flex items-center justify-between">
            <span>Provider: Fonnte WhatsApp Cloud API</span>
            <span>Endpoint: api.fonnte.com/send</span>
          </div>
        </div>
      </div>
    </div>
  );
}
