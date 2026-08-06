"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

type Language = "id" | "en" | "ar";

const NAV_LABELS: Record<Language, Record<string, string>> = {
  id: {
    Beranda: "Beranda",
    Profil: "Profil",
    Program: "Program",
    Kampanye: "Kampanye",
    Berita: "Berita",
    Pengumuman: "Pengumuman",
    Newsletter: "Newsletter",
    Dokumen: "Dokumen",
    Galeri: "Galeri",
    BayarZakat: "Bayar Zakat",
  },
  en: {
    Beranda: "Home",
    Profil: "Profile",
    Program: "Programs",
    Kampanye: "Campaigns",
    Berita: "News",
    Pengumuman: "Announcements",
    Newsletter: "Newsletter",
    Dokumen: "Documents",
    Galeri: "Gallery",
    BayarZakat: "Pay Zakat",
  },
  ar: {
    Beranda: "الرئيسية",
    Profil: "الملف التعريفي",
    Program: "البرامج",
    Kampanye: "الحملات",
    Berita: "الأخبار",
    Pengumuman: "الإعلانات",
    Newsletter: "النشرة الإخبارية",
    Dokumen: "الوثائق",
    Galeri: "المعرض",
    BayarZakat: "دفع الزكاة",
  },
};

export default function Navbar() {
  const pathname = usePathname();
  const [programDropdownOpen, setProgramDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProgramOpen, setMobileProgramOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>("id");

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = (localStorage.getItem("app_lang") ||
      localStorage.getItem("program_lang") ||
      localStorage.getItem("profil_lang") ||
      localStorage.getItem("announcement_lang")) as Language;
    if (saved && ["id", "en", "ar"].includes(saved)) {
      setCurrentLang(saved);
    }
  }, []);

  const changeGlobalLanguage = (newLang: Language) => {
    setCurrentLang(newLang);
    localStorage.setItem("app_lang", newLang);
    localStorage.setItem("program_lang", newLang);
    localStorage.setItem("profil_lang", newLang);
    localStorage.setItem("announcement_lang", newLang);
    window.dispatchEvent(new Event("languageChange"));
    window.location.reload();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProgramDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const t = NAV_LABELS[currentLang] || NAV_LABELS.id;

  const navLinks = [
    { href: "/", label: t.Beranda },
    { href: "/profil", label: t.Profil },
    { href: "#program", label: t.Program, hasDropdown: true },
    { href: "/berita", label: t.Berita },
    { href: "/pengumuman", label: t.Pengumuman },
    { href: "/newsletter", label: t.Newsletter },
    { href: "/dokumen", label: t.Dokumen },
    { href: "/galeri", label: t.Galeri },
  ];

  return (
    <>
      <header
        className={`border-b sticky top-0 z-50 transition-colors duration-200 ${mobileMenuOpen ? "bg-[#383d42] border-transparent" : "bg-white border-gray-200"
          }`}
        dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
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
                className={`h-10 sm:h-11 w-auto object-contain transition-all ${mobileMenuOpen ? "brightness-0 invert" : ""
                  }`}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center justify-between flex-1 mx-6 xl:mx-12 text-[13.5px] font-semibold" dir="ltr">
              {navLinks.map((link) => {
                const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

                if (link.hasDropdown) {
                  return (
                    <div
                      key={link.label}
                      ref={dropdownRef}
                      className="relative"
                      onMouseEnter={() => setProgramDropdownOpen(true)}
                      onMouseLeave={() => setProgramDropdownOpen(false)}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProgramDropdownOpen((prev) => !prev);
                        }}
                        className="group relative flex items-center gap-1 px-2.5 py-1.5 text-gray-600 hover:text-[#0b6330] transition-colors duration-200 cursor-pointer"
                      >
                        <span>{link.label}</span>
                        <svg
                          className={`w-3.5 h-3.5 mt-0.5 transition-transform duration-200 ${programDropdownOpen ? "rotate-180 text-[#0b6330]" : "text-gray-400"
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
                        className={`absolute top-full left-0 w-44 pt-1.5 z-50 transition-all duration-200 ease-out transform before:content-[''] before:absolute before:-top-4 before:inset-x-0 before:h-4 ${programDropdownOpen
                          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                          : "opacity-0 translate-y-2 scale-95 pointer-events-none"
                          }`}
                      >
                        <div className="bg-white rounded-xl shadow-2xl border border-gray-100/80 py-1.5">
                          <Link
                            href="/program"
                            onClick={() => setProgramDropdownOpen(false)}
                            className="block px-4 py-2 text-[13px] text-gray-700 font-semibold hover:bg-gray-50 hover:text-[#0b6330] transition-colors"
                          >
                            {t.Program}
                          </Link>
                          <Link
                            href="/kampanye"
                            onClick={() => setProgramDropdownOpen(false)}
                            className="block px-4 py-2 text-[13px] text-gray-700 font-semibold hover:bg-gray-50 hover:text-[#0b6330] transition-colors"
                          >
                            {t.Kampanye}
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`group relative px-2.5 py-1.5 transition-colors duration-200 ${isActive ? "text-[#0b6330] font-bold" : "text-gray-600 hover:text-[#0b6330]"
                      }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-0 left-0 h-[2.5px] bg-[#0b6330] transition-all duration-300 ease-out ${isActive ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Right Group: Bayar Zakat Button & Language Switcher & Mobile Toggle */}
            <div className="flex items-center gap-3 shrink-0" dir="ltr">
              {/* Global Language Switcher */}
              <div className="hidden lg:inline-flex rounded-xl p-1 bg-gray-100 border border-gray-200 shadow-2xs items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => changeGlobalLanguage("id")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    currentLang === "id"
                      ? "bg-[#0b6330] text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                  }`}
                >
                  <span>🇮🇩</span>
                  <span>ID</span>
                </button>
                <button
                  type="button"
                  onClick={() => changeGlobalLanguage("en")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    currentLang === "en"
                      ? "bg-[#0b6330] text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                  }`}
                >
                  <span>🇬🇧</span>
                  <span>EN</span>
                </button>
                <button
                  type="button"
                  onClick={() => changeGlobalLanguage("ar")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    currentLang === "ar"
                      ? "bg-[#0b6330] text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
                  }`}
                >
                  <span>🇸🇦</span>
                  <span>AR</span>
                </button>
              </div>

              {/* Bayar Zakat Button */}
              <Link
                href="/zakat"
                className="hidden lg:inline-flex items-center justify-center bg-[#ffc800] hover:bg-[#e8b500] text-[#1a1a1a] font-extrabold text-[13px] px-4 py-2 rounded-lg transition-all duration-200 shadow-2xs"
              >
                {t.BayarZakat}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
                className={`flex lg:hidden p-2 rounded-lg transition-colors cursor-pointer ${mobileMenuOpen ? "text-white hover:bg-white/10" : "text-gray-700 hover:text-[#0b6330]"
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

              {/* Mobile Language Switcher */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pilih Bahasa / Language</span>
                <div className="inline-flex rounded-xl p-1 bg-gray-100 border border-gray-200 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => changeGlobalLanguage("id")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      currentLang === "id"
                        ? "bg-[#0b6330] text-white shadow-xs"
                        : "text-gray-600 hover:bg-gray-200/60"
                    }`}
                  >
                    <span>🇮🇩</span>
                    <span>ID</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => changeGlobalLanguage("en")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      currentLang === "en"
                        ? "bg-[#0b6330] text-white shadow-xs"
                        : "text-gray-600 hover:bg-gray-200/60"
                    }`}
                  >
                    <span>🇬🇧</span>
                    <span>EN</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => changeGlobalLanguage("ar")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      currentLang === "ar"
                        ? "bg-[#0b6330] text-white shadow-xs"
                        : "text-gray-600 hover:bg-gray-200/60"
                    }`}
                  >
                    <span>🇸🇦</span>
                    <span>AR</span>
                  </button>
                </div>
              </div>

              {/* Beranda */}
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-[17px] font-bold text-[#0b6330] transition-colors"
              >
                {t.Beranda}
              </Link>

              {/* Profil */}
              <Link
                href="/profil"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-[17px] font-medium text-gray-500 hover:text-[#0b6330] transition-colors"
              >
                {t.Profil}
              </Link>

              {/* Program */}
              <div>
                <div
                  onClick={() => setMobileProgramOpen(!mobileProgramOpen)}
                  className="py-2.5 text-[17px] font-bold text-[#0b6330] flex items-center justify-between cursor-pointer"
                >
                  <span>{t.Program}</span>
                  <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${mobileProgramOpen ? "rotate-180" : ""
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
                      href="/program"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-1.5 text-base font-semibold text-gray-700 hover:text-[#0b6330]"
                    >
                      {t.Program}
                    </Link>
                    <Link
                      href="/kampanye"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-1.5 text-base font-semibold text-gray-700 hover:text-[#0b6330]"
                    >
                      {t.Kampanye}
                    </Link>
                  </div>
                )}
              </div>

              {/* Berita */}
              <Link
                href="/berita"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-[17px] font-bold text-[#0b6330] transition-colors"
              >
                {t.Berita}
              </Link>

              {/* Pengumuman */}
              <Link
                href="/pengumuman"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-[17px] font-bold text-[#0b6330] transition-colors"
              >
                {t.Pengumuman}
              </Link>

              {/* Newsletter */}
              <Link
                href="/newsletter"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-[17px] font-bold text-[#0b6330] transition-colors"
              >
                {t.Newsletter}
              </Link>

              {/* Dokumen */}
              <Link
                href="/dokumen"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-[17px] font-bold text-[#0b6330] transition-colors"
              >
                {t.Dokumen}
              </Link>

              {/* Galeri */}
              <Link
                href="/galeri"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-[17px] font-bold text-[#0b6330] transition-colors mb-1"
              >
                {t.Galeri}
              </Link>

              {/* Pembayaran Zakat */}
              <Link
                href="/zakat"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-[#ffc800] hover:bg-[#e8b500] text-[#111111] font-bold text-[16px] text-left px-5 py-3.5 rounded-xl shadow-xs transition-all block mt-2"
              >
                {t.BayarZakat}
              </Link>

            </div>
          </div>
        )}
      </header>
    </>
  );
}
