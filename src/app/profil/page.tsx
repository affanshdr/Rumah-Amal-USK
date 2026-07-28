"use client";

import Link from "next/link";
import { useState } from "react";

export default function ProfilPage() {
  const [activeTab, setActiveTab] = useState("profil-singkat");

  const menuItems = [
    { id: "profil-singkat", label: "Profil Singkat" },
    { id: "visi-misi", label: "Visi dan Misi" },
    { id: "landasan-utama", label: "Landasan Utama" },
    { id: "fokus-program", label: "Fokus Program" },
    { id: "struktur-organisasi", label: "Struktur Organisasi Rumah Amal USK" },
  ];

  return (
    <main className="min-h-screen bg-white pb-24">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Page Header */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-[0.18em] uppercase">
            PROFIL
          </h1>
          <div className="mt-2.5 w-14 h-[3.5px] bg-[#ffc800] rounded-full" />
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm font-semibold mb-10 text-gray-600">
          <Link href="/" className="hover:text-[#005621] transition-colors">
            Beranda
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-[#005621] font-bold">Profil</span>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Left Column: Main Content (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Mosque Header Image */}
            <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/profil/mesjid-jamik.png"
                alt="Masjid Jamik Universitas Syiah Kuala"
                className="w-full h-auto object-cover max-h-[440px]"
              />
            </div>

            {/* Sub-heading Title */}
            <h2 className="text-xl md:text-2xl font-black text-[#005621] tracking-wide uppercase mt-2">
              RUMAH AMAL MASJID JAMIK USK
            </h2>

            {/* Dynamic Content Based on Selected Sidebar Tab */}
            <div className="text-gray-700 text-sm md:text-[15px] leading-relaxed space-y-4 pt-1">

              {activeTab === "profil-singkat" && (
                <>
                  <p className="leading-relaxed">
                    Kami menyediakan sistem dan layanan yang memudahkan para muzakki atau donatur dalam menunaikan zakat, infaq, shadaqah, maupun wakaf dengan sebaik-baiknya. Menjadikan masjid sebagai pusat pemberdayaan ekonomi umat, Mendayagunakan dana zakat, infaq shadaqah maupun wakaf melalui program-program yang terasa manfaatnya, Mengangkat martabat mustahik, dan membahagiakan muzakki dan donatur.
                  </p>
                  <p className="leading-relaxed">
                    Rumah Amal Masjid Jamik USK berdiri sebagai wujud kepedulian civitas akademika Universitas Syiah Kuala Banda Aceh terhadap pengelolaan zakat yang profesional, transparan, dan akuntabel di lingkungan kampus dan masyarakat sekitar.
                  </p>
                  <p className="leading-relaxed">
                    Melalui berbagai program unggulan di bidang pendidikan, ekonomi, kesehatan, dan dakwah, Rumah Amal senantiasa berkomitmen untuk menjadi penghubung kebaikan antara muzakki dan mustahik secara berkelanjutan.
                  </p>
                </>
              )}

              {activeTab === "visi-misi" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#005621] mb-2">Visi</h3>
                    <p className="bg-green-50/60 border-l-4 border-[#005621] p-4 rounded-r-lg text-gray-800 font-medium">
                      Menjadi Lembaga Amil Zakat, Infaq, Shadaqah, dan Wakaf Perguruan Tinggi yang Profesional, Amanah, dan Unggul dalam Memberdayakan Umat.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#005621] mb-3">Misi</h3>
                    <ul className="space-y-2.5">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#005621] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                        <span>Menyelenggarakan tata kelola ZISWAF yang profesional, transparan, dan akuntabel berbasis teknologi informasi.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#005621] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                        <span>Mengoptimalkan penghimpunan dan pendayagunaan dana ZISWAF untuk kesejahteraan civitas akademika dan masyarakat luas.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#005621] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                        <span>Mengembangkan program-program inovatif pemberdayaan ekonomi, beasiswa pendidikan, dan kemanusiaan.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "landasan-utama" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#005621] mb-2">Landasan Utama Operasional</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/60">
                      <h4 className="font-bold text-[#005621] mb-1">Prinsip Syariah</h4>
                      <p className="text-xs text-gray-600">Seluruh penghimpunan dan penyaluran dana sesuai dengan kaidah syariat Islam dan fatwa MUI.</p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/60">
                      <h4 className="font-bold text-[#005621] mb-1">Amanah & Transparan</h4>
                      <p className="text-xs text-gray-600">Laporan keuangan diaudit secara berkala dan dipublikasikan secara terbuka kepada donatur.</p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/60">
                      <h4 className="font-bold text-[#005621] mb-1">Kemaslahatan Umat</h4>
                      <p className="text-xs text-gray-600">Fokus pada dampak jangka panjang penyelesaian kemiskinan dan dukungan pendidikan mahasiswa.</p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/60">
                      <h4 className="font-bold text-[#005621] mb-1">Inovasi Berkelanjutan</h4>
                      <p className="text-xs text-gray-600">Pengembangan sistem digital pembayaran zakat dan pendataan berbasis IT.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "fokus-program" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#005621] mb-2">Fokus Program Utama</h3>
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl border-l-4 border-[#ffc800] bg-yellow-50/40">
                      <h4 className="font-bold text-gray-800 mb-1">1. Program Beasiswa & Pendidikan</h4>
                      <p className="text-xs text-gray-600">Bantuan UKT/SPP dan beasiswa insentif bagi mahasiswa berprestasi dan kurang mampu di lingkungan USK.</p>
                    </div>
                    <div className="p-4 rounded-xl border-l-4 border-[#005621] bg-green-50/40">
                      <h4 className="font-bold text-gray-800 mb-1">2. Pemberdayaan Ekonomi Mustahik</h4>
                      <p className="text-xs text-gray-600">Bantuan modal usaha produktif dan pendampingan kewirausahaan bagi masyarakat dhuafa.</p>
                    </div>
                    <div className="p-4 rounded-xl border-l-4 border-blue-500 bg-blue-50/40">
                      <h4 className="font-bold text-gray-800 mb-1">3. Kebencanaan & Tanggap Sosial</h4>
                      <p className="text-xs text-gray-600">Penyaluran bantuan darurat bencana alam, kesehatan, dan kebutuhan sembako bagi fakir miskin.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "struktur-organisasi" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#005621] mb-2">Struktur Organisasi</h3>
                  <p className="text-sm text-gray-600">
                    Pengelolaan Rumah Amal Masjid Jamik Universitas Syiah Kuala berada di bawah naungan BKM Masjid Jamik USK dan Rektorat USK dengan struktur pengurus profesional pelaksana harian.
                  </p>
                  <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/80 space-y-3">
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="font-bold text-gray-700">Pembina:</span>
                      <span className="text-gray-900 font-semibold">Rektor Universitas Syiah Kuala</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="font-bold text-gray-700">Pengawas:</span>
                      <span className="text-gray-900 font-semibold">Ketua BKM Masjid Jamik USK</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="font-bold text-gray-700">Direktur Eksekutif:</span>
                      <span className="text-gray-900 font-semibold">Manajemen Pelaksana Harian</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="font-bold text-gray-700">Divisi Operasional:</span>
                      <span className="text-gray-900 font-semibold">Penghimpunan, Pendayagunaan & Keuangan</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Right Column: Sidebar Navigation Card (4 cols) */}
          <div className="lg:col-span-4">
            <div className="bg-[#f4f6f8] rounded-xl overflow-hidden shadow-2xs border border-gray-200/80">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-5 py-3.5 text-sm transition-all duration-200 border-b border-gray-200/70 last:border-b-0 cursor-pointer ${isActive
                      ? "border-l-[4px] border-[#005621] bg-gray-200/80 text-[#005621] font-bold"
                      : "text-gray-700 font-medium hover:bg-gray-100/80 hover:text-[#005621]"
                      }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
