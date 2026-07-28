"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [programDropdownOpen, setProgramDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProgramOpen, setMobileProgramOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/profil", label: "Profil" },
    { href: "#program", label: "Program", hasDropdown: true },
    { href: "#berita", label: "Berita" },
    { href: "#pengumuman", label: "Pengumuman" },
    { href: "#newsletter", label: "Newsletter" },
    { href: "#dokumen", label: "Dokumen" },
    { href: "#galeri", label: "Galeri" },
  ];

  return (
    <>
      <header
        className={`border-b sticky top-0 z-50 transition-colors duration-200 ${
          mobileMenuOpen ? "bg-[#383d42] border-transparent" : "bg-white border-gray-200"
        }`}
      >
        <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">

            {/* Brand Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/logo/rumah-amal.png"
                alt="Rumah Amal Masjid Jamik USK"
                width={200}
                height={50}
                priority
                className={`h-10 sm:h-11 w-auto object-contain transition-all ${
                  mobileMenuOpen ? "brightness-0 invert" : ""
                }`}
              />
            </Link>

            {/* Desktop Navigation - Fills middle space & spreads all items evenly */}
            <nav className="hidden lg:flex items-center justify-between flex-1 mx-6 xl:mx-12 text-[13.5px] font-semibold">
              {navLinks.map((link) => {
                const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

                if (link.hasDropdown) {
                  return (
                    <div
                      key={link.label}
                      className="relative"
                      onMouseEnter={() => setProgramDropdownOpen(true)}
                      onMouseLeave={() => setProgramDropdownOpen(false)}
                    >
                      <button
                        onClick={() => setProgramDropdownOpen(!programDropdownOpen)}
                        className="group relative flex items-center gap-1 px-2.5 py-1.5 text-gray-600 hover:text-[#0b6330] transition-colors duration-200 cursor-pointer"
                      >
                        <span>{link.label}</span>
                        <svg
                          className={`w-3.5 h-3.5 mt-0.5 transition-transform duration-200 ${
                            programDropdownOpen ? "rotate-180 text-[#0b6330]" : "text-gray-400"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span className="absolute bottom-0 left-0 h-[2.5px] bg-[#0b6330] w-0 group-hover:w-full transition-all duration-300 ease-out" />
                      </button>

                      <div
                        className={`absolute top-full left-0 mt-1.5 w-44 bg-white rounded-xl shadow-2xl border border-gray-100/80 py-1.5 z-50 transition-all duration-250 ease-out transform ${
                          programDropdownOpen
                            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                            : "opacity-0 translate-y-2.5 scale-95 pointer-events-none"
                        }`}
                      >
                        <Link
                          href="#program"
                          className="block px-4 py-2.5 text-[13px] text-gray-700 font-semibold hover:bg-gray-50 hover:text-[#0b6330] transition-colors"
                        >
                          Program
                        </Link>
                        <Link
                          href="#kampanye"
                          className="block px-4 py-2.5 text-[13px] text-gray-700 font-semibold hover:bg-gray-50 hover:text-[#0b6330] transition-colors"
                        >
                          Kampanye
                        </Link>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`group relative px-2.5 py-1.5 transition-colors duration-200 ${
                      isActive ? "text-[#0b6330] font-bold" : "text-gray-600 hover:text-[#0b6330]"
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-0 left-0 h-[2.5px] bg-[#0b6330] transition-all duration-300 ease-out ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Right Group: Kalkulator Zakat Button (Desktop) & Mobile Toggle */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Kalkulator Zakat Button (Desktop Only) */}
              <Link
                href="#kalkulator"
                className="hidden lg:inline-flex items-center justify-center bg-[#ffc800] hover:bg-[#e8b500] text-[#1a1a1a] font-extrabold text-[13px] px-5 py-2.5 rounded-lg transition-all duration-200"
              >
                Kalkulator Zakat
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
                className={`flex lg:hidden p-2 rounded-lg transition-colors cursor-pointer ${
                  mobileMenuOpen ? "text-white hover:bg-white/10" : "text-gray-700 hover:text-[#0b6330]"
                }`}
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
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[68px] bottom-0 bg-[#383d42]/90 backdrop-blur-xs z-50 overflow-y-auto px-4 py-4 sm:px-6">
            <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-lg mx-auto flex flex-col gap-2 border border-gray-100">
              
              {/* Beranda */}
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-[17px] font-bold text-[#0b6330] transition-colors"
              >
                Beranda
              </Link>

              {/* Profil */}
              <Link
                href="/profil"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-[17px] font-medium text-gray-500 hover:text-[#0b6330] transition-colors"
              >
                Profil
              </Link>

              {/* Program (with Circular Arrow Badge) */}
              <div>
                <div
                  onClick={() => setMobileProgramOpen(!mobileProgramOpen)}
                  className="py-2.5 text-[17px] font-bold text-[#0b6330] flex items-center justify-between cursor-pointer"
                >
                  <span>Program</span>
                  <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        mobileProgramOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {mobileProgramOpen && (
                  <div className="pl-4 py-1 flex flex-col gap-2 border-l-2 border-green-200 my-1">
                    <Link
                      href="#program"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-1.5 text-base font-semibold text-gray-700 hover:text-[#0b6330]"
                    >
                      Program
                    </Link>
                    <Link
                      href="#kampanye"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-1.5 text-base font-semibold text-gray-700 hover:text-[#0b6330]"
                    >
                      Kampanye
                    </Link>
                  </div>
                )}
              </div>

              {/* Berita */}
              <Link
                href="#berita"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-[17px] font-bold text-[#0b6330] transition-colors"
              >
                Berita
              </Link>

              {/* Pengumuman */}
              <Link
                href="#pengumuman"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-[17px] font-bold text-[#0b6330] transition-colors"
              >
                Pengumuman
              </Link>

              {/* Newsletter */}
              <Link
                href="#newsletter"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-[17px] font-bold text-[#0b6330] transition-colors"
              >
                Newsletter
              </Link>

              {/* Dokumen */}
              <Link
                href="#dokumen"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-[17px] font-bold text-[#0b6330] transition-colors"
              >
                Dokumen
              </Link>

              {/* Galeri */}
              <Link
                href="#galeri"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-[17px] font-bold text-[#0b6330] transition-colors mb-1"
              >
                Galeri
              </Link>

              {/* Kalkulator Zakat (Full Width Yellow Button) */}
              <Link
                href="#kalkulator"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-[#ffc800] hover:bg-[#e8b500] text-[#111111] font-bold text-[16px] text-left px-5 py-3.5 rounded-xl shadow-xs transition-all block mt-2"
              >
                Kalkulator Zakat
              </Link>

            </div>
          </div>
        )}
      </header>
    </>
  );
}
