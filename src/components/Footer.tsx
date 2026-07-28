"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Footer() {
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <footer className="bg-[#002B14] text-white">
        {/* Main Footer Grid */}
        <div className="max-w-[1340px] mx-auto px-6 sm:px-8 lg:px-12 py-12 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">

          {/* ===== Column 1: Logo, Address, Jam Operasional ===== */}
          <div className="flex flex-col gap-5">
            {/* Logo Box */}
            <div className="bg-white rounded-xl px-5 py-3 inline-flex items-center self-start shadow-md">
              <Image
                src="/logo/rumah-amal.png"
                alt="Rumah Amal Masjid Jamik USK"
                width={180}
                height={45}
                className="h-10 w-auto object-contain"
              />
            </div>

            {/* Address */}
            <p className="text-[13px] text-gray-300 leading-relaxed">
              Lantai 1 Masjid Jamik USK<br />
              T. Nyak Arief, Kopelma Darussalam, Banda Aceh 21311
            </p>

            {/* Jam Operasional */}
            <div>
              <h3 className="font-bold text-[14px] text-white mb-1">Jam Operasional:</h3>
              <div className="h-[2px] w-full bg-[#ffc800] mb-4 rounded-full" />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[13px] text-gray-300">
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Senin - Jum&apos;at: 08.00 - 17.00</span>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-gray-300">
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Sabtu - Minggu: Tutup</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== Column 2: Hubungi Kami, Sosmed, CTA ===== */}
          <div className="flex flex-col gap-4">
            {/* Hubungi Kami */}
            <div>
              <h3 className="font-bold text-[14px] text-white mb-1">Hubungi Kami:</h3>
              <div className="h-[2px] w-full bg-[#ffc800] mb-4 rounded-full" />
              <div className="flex flex-col gap-2.5 text-[13px] text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-white shrink-0">WA:</span>
                  <a href="https://wa.me/628116888123" className="hover:text-white transition-colors">
                    0811 6888 123
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-white shrink-0">Email:</span>
                  <a href="mailto:rumahamal@usk.ac.id" className="hover:text-white transition-colors">
                    rumahamal@usk.ac.id
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-white shrink-0">Tautan:</span>
                  <a href="https://usk.ac.id" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Universitas Syiah Kuala
                  </a>
                </div>
                <a href="#faq" className="font-bold text-white hover:text-[#ffc800] transition-colors mt-1">
                  FAQ
                </a>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3 mt-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-gray-500 flex items-center justify-center text-gray-300 hover:border-[#ffc800] hover:text-[#ffc800] transition-all duration-200"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-gray-500 flex items-center justify-center text-gray-300 hover:border-[#ffc800] hover:text-[#ffc800] transition-all duration-200"
                aria-label="TikTok"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.77 1.52V6.75a4.85 4.85 0 01-1-.06z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-gray-500 flex items-center justify-center text-gray-300 hover:border-[#ffc800] hover:text-[#ffc800] transition-all duration-200"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>

            {/* CTA Button */}
            <div className="mt-2">
              <Link
                href="#keluhan"
                className="inline-block bg-[#ffc800] hover:bg-[#e8b500] text-[#111] font-extrabold text-sm px-8 py-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Ajukan Keluhan
              </Link>
            </div>
          </div>

          {/* ===== Column 3: Google Maps ===== */}
          <div className="w-full h-[220px] rounded-2xl overflow-hidden shadow-lg border border-white/10">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.9730513155114!2d95.3687263739873!3d5.571002233500729!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x304037d79398cc65%3A0x164fb653d9c4a1f7!2sRumah%20Amal%20Masjid%20Jamik%20USK!5e0!3m2!1sid!2sid!4v1785217075034!5m2!1sid!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi Rumah Amal Masjid Jamik USK"
            />
          </div>
        </div>

        {/* ===== Copyright Bar ===== */}
        <div className="border-t border-white/10 bg-[#fff] py-4 relative z-20">
          <div className="max-w-[1340px] mx-auto px-6 flex items-center justify-center">
            <p className="text-[13px] text-[#002B14] text-center">
              Copyright &copy; 2025{" "}
              <span className="font-bold text-[#002B14]">Rumah Amal USK</span>
              . All Rights Reserved
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Tombol Pilih Bahasa */}
      <div className="fixed bottom-5 left-16 z-40 flex items-center">
        <div className="relative flex items-center">
          <svg className="w-4 h-4 text-gray-300 absolute left-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <select
            aria-label="Pilih Bahasa"
            className="bg-[#002B14]/90 hover:bg-[#002B14] backdrop-blur-md text-white text-xs font-semibold pl-9 pr-8 py-2 rounded-lg border border-white/20 shadow-lg focus:outline-none focus:border-[#ffc800] appearance-none cursor-pointer transition-all"
            defaultValue="id"
          >
            <option value="id" className="bg-[#002B14] text-white">Pilih Bahasa</option>
            <option value="id-val" className="bg-[#002B14] text-white">Bahasa Indonesia</option>
            <option value="en" className="bg-[#002B14] text-white">English</option>
            <option value="ar" className="bg-[#002B14] text-white">العربية</option>
          </select>
          <svg className="w-3.5 h-3.5 text-gray-300 absolute right-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Floating Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-[#ffc800] hover:bg-[#e8b500] text-[#111] flex items-center justify-center shadow-xl transition-all duration-300 cursor-pointer ${showTopBtn
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-75 translate-y-4 pointer-events-none"
          }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </>
  );
}
