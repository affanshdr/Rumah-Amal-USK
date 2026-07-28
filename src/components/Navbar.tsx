"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [programDropdownOpen, setProgramDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-xs">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src="/logo/rumah-amal.png"
              alt="Rumah Amal Masjid Jamik USK"
              width={220}
              height={55}
              priority
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-gray-700">
            {/* Beranda (Active) */}
            <Link
              href="/"
              className="relative text-[#0f6d38] font-bold py-2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-[#0f6d38] after:rounded-full"
            >
              Beranda
            </Link>

            <Link href="#profil" className="hover:text-[#0f6d38] transition-colors py-2">
              Profil
            </Link>

            {/* Program Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setProgramDropdownOpen(true)}
              onMouseLeave={() => setProgramDropdownOpen(false)}
            >
              <button
                onClick={() => setProgramDropdownOpen(!programDropdownOpen)}
                className="flex items-center gap-1 hover:text-[#0f6d38] transition-colors py-2 cursor-pointer"
              >
                <span>Program</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    programDropdownOpen ? "rotate-180 text-[#0f6d38]" : "text-gray-500"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {programDropdownOpen && (
                <div className="absolute left-0 mt-0 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link
                    href="#program"
                    className="block px-4 py-2.5 text-xs text-gray-700 font-semibold hover:bg-gray-50 hover:text-[#0f6d38] transition-colors"
                  >
                    Program
                  </Link>
                  <Link
                    href="#kampanye"
                    className="block px-4 py-2.5 text-xs text-gray-700 font-semibold hover:bg-gray-50 hover:text-[#0f6d38] transition-colors"
                  >
                    Kampanye
                  </Link>
                </div>
              )}
            </div>

            <Link href="#berita" className="hover:text-[#0f6d38] transition-colors py-2">
              Berita
            </Link>

            <Link href="#pengumuman" className="hover:text-[#0f6d38] transition-colors py-2">
              Pengumuman
            </Link>

            <Link href="#newsletter" className="hover:text-[#0f6d38] transition-colors py-2">
              Newsletter
            </Link>

            <Link href="#dokumen" className="hover:text-[#0f6d38] transition-colors py-2">
              Dokumen
            </Link>

            <Link href="#galeri" className="hover:text-[#0f6d38] transition-colors py-2">
              Galeri
            </Link>
          </nav>

          {/* Action Button */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="#kalkulator"
              className="bg-[#f5b800] hover:bg-[#e5aa00] text-[#0f6d38] font-bold text-xs px-5 py-3 rounded-lg shadow-sm hover:shadow transition-all duration-200"
            >
              Kalkulator Zakat
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-[#0f6d38] p-2 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 flex flex-col gap-3 font-semibold text-sm">
            <Link href="/" className="text-[#0f6d38] font-bold py-1">Beranda</Link>
            <Link href="#profil" className="text-gray-700 py-1">Profil</Link>
            <Link href="#program" className="text-gray-700 py-1">Program</Link>
            <Link href="#kampanye" className="text-gray-700 pl-4 py-1 text-xs">└ Kampanye</Link>
            <Link href="#berita" className="text-gray-700 py-1">Berita</Link>
            <Link href="#pengumuman" className="text-gray-700 py-1">Pengumuman</Link>
            <Link href="#newsletter" className="text-gray-700 py-1">Newsletter</Link>
            <Link href="#dokumen" className="text-gray-700 py-1">Dokumen</Link>
            <Link href="#galeri" className="text-gray-700 py-1">Galeri</Link>
            <Link
              href="#kalkulator"
              className="bg-[#f5b800] text-[#0f6d38] font-bold text-xs text-center py-3 rounded-lg mt-2"
            >
              Kalkulator Zakat
            </Link>
          </div>
        )}

      </div>
    </header>
  );
}
