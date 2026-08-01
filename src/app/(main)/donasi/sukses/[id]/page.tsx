import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export default async function DonasiSuksesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-[1340px] mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <Sidebar />

        <div className="lg:col-span-9 bg-white p-8 sm:p-10 rounded-2xl shadow-md border border-gray-100 text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-[#0b6330]">
            <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-black text-[#0b6330]">Jazakallahu Khairan, Pembayaran Donasi Berhasil!</h2>

          <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
            Semoga Allah SWT membalas kebaikan Anda dan melapangkan rezeki. Kode transaksi donasi Anda:
          </p>

          <div className="inline-block bg-gray-100 font-mono font-bold text-base px-6 py-2.5 rounded-xl border border-gray-200 text-gray-800 tracking-wider">
            {id}
          </div>

          <div className="pt-4 flex flex-wrap gap-4 justify-center">
            <Link
              href="/"
              className="bg-[#0b6330] hover:bg-[#062015] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-sm"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/riwayat"
              className="bg-[#ffc800] hover:bg-[#e8b500] text-[#0b6330] font-extrabold px-6 py-3 rounded-xl text-sm transition-all shadow-sm"
            >
              Cek Riwayat Infaq
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
