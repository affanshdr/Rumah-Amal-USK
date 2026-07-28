export default function LandasanUtamaPage() {
  return (
    <div className="bg-[#f8f9fa] rounded-2xl p-6 sm:p-8 md:p-10 border border-gray-100/90 shadow-2xs space-y-8">
      
      {/* Heading */}
      <h3 className="text-2xl md:text-3xl font-black text-[#0b6330] tracking-widest uppercase text-center">
        LANDASAN UTAMA
      </h3>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
        <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-xs">
          <h4 className="font-bold text-[#0b6330] text-base mb-1.5">Prinsip Syariah</h4>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
            Seluruh penghimpunan dan penyaluran dana sesuai dengan kaidah syariat Islam dan fatwa MUI.
          </p>
        </div>
        <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-xs">
          <h4 className="font-bold text-[#0b6330] text-base mb-1.5">Amanah & Transparan</h4>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
            Laporan keuangan diaudit secara berkala dan dipublikasikan secara terbuka kepada donatur.
          </p>
        </div>
        <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-xs">
          <h4 className="font-bold text-[#0b6330] text-base mb-1.5">Kemaslahatan Umat</h4>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
            Fokus pada dampak jangka panjang penyelesaian kemiskinan dan dukungan pendidikan mahasiswa.
          </p>
        </div>
        <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-xs">
          <h4 className="font-bold text-[#0b6330] text-base mb-1.5">Inovasi Berkelanjutan</h4>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
            Pengembangan sistem digital pembayaran zakat dan pendataan berbasis IT.
          </p>
        </div>
      </div>

    </div>
  );
}
