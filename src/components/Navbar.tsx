"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [programDropdownOpen, setProgramDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Beranda", active: true },
    { href: "#profil", label: "Profil" },
    { href: "#program", label: "Program", hasDropdown: true },
    { href: "#berita", label: "Berita" },
    { href: "#pengumuman", label: "Pengumuman" },
    { href: "#newsletter", label: "Newsletter" },
    { href: "#dokumen", label: "Dokumen" },
    { href: "#galeri", label: "Galeri" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
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
              className="h-11 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5 text-[13.5px] font-semibold">

            {navLinks.map((link) => {
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
                      className="group relative flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-[#0b6330] transition-colors duration-200 cursor-pointer"
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

                    {programDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-xl shadow-2xl border border-gray-100/80 py-1.5 z-50">
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
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`group relative px-3 py-1.5 transition-colors duration-200 ${
                    link.active ? "text-[#0b6330]" : "text-gray-600 hover:text-[#0b6330]"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 h-[2.5px] bg-[#0b6330] transition-all duration-300 ease-out ${
                      link.active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}

          </nav>

          {/* Kalkulator Zakat Button */}
          <div className="hidden lg:flex items-center">
            <Link
              href="#kalkulator"
              className="bg-[#ffc800] hover:bg-[#e8b500] text-[#1a1a1a] font-extrabold text-[13px] px-5 py-2.5 rounded-lg transition-all duration-200"
            >
              Kalkulator Zakat
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-[#0b6330] p-2 rounded-lg"
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
          <div className="lg:hidden py-4 border-t border-gray-100 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2.5 px-2 text-sm font-semibold rounded-lg ${
                  link.active
                    ? "text-[#0b6330] bg-green-50"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#0b6330]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="#program"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-2 text-sm font-semibold rounded-lg text-gray-600 hover:bg-gray-50 hover:text-[#0b6330]"
            >
              Program
            </Link>
            <Link
              href="#kalkulator"
              className="mt-2 bg-[#ffc800] hover:bg-[#e8b500] text-[#1a1a1a] font-extrabold text-sm text-center py-3 rounded-lg transition-all"
            >
              Kalkulator Zakat
            </Link>
          </div>
        )}

      </div>
    </header>
  );
}
