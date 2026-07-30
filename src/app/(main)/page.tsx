"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import MitraSection from "@/components/MitraSection";

interface NewsletterItem {
  id: string;
  judul: string;
  imageUrl: string;
  tanggal: string;
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [newsletters, setNewsletters] = useState<NewsletterItem[]>([]);
  const [loadingNewsletters, setLoadingNewsletters] = useState(true);

  useEffect(() => {
    async function loadNewsletters() {
      try {
        const res = await fetch('/api/newsletter?limit=3');
        if (res.ok) {
          const data = await res.json();
          setNewsletters(data.items || []);
        }
      } catch (err) {
        console.error('Error fetching home newsletters:', err);
      } finally {
        setLoadingNewsletters(false);
      }
    }
    loadNewsletters();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const slides = [
    {
      badge: "PENGUMUMAN",
      title: "HASIL SELEKSI ADMISTRASI BPRA–UKT SEMESTER GANJIL 2026/2027",
      image: "/student.png",
    },
    {
      badge: "KAMPANYE DONASI",
      title: "PROGRAM BEASISWA BAITUL MAL MASJID JAMIK USK 2026",
      image: "/student.png",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <main className="min-h-screen bg-gray-50/50 pb-24 relative overflow-x-hidden">
      
      {/* Hero Section Container */}
      <section className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Main Green Banner */}
        <div className="relative bg-[#0b6330] rounded-[24px] md:rounded-[32px] overflow-hidden min-h-[440px] md:min-h-[480px] flex items-center shadow-md">
          
          {/* Left Arrow Button */}
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-3 md:left-6 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/35 hover:bg-black/55 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-3 md:right-6 z-20 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/35 hover:bg-black/55 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Banner Inner Content Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-12 items-center px-6 md:px-14 py-8 md:py-0 gap-6">
            
            {/* Student Image Column */}
            <div className="md:col-span-5 flex justify-center md:justify-start relative h-[280px] md:h-[460px] w-full items-end">
              <Image
                src={slides[currentSlide].image}
                alt="Student USK"
                fill
                priority
                className="object-contain object-bottom drop-shadow-2xl scale-105"
              />
            </div>

            {/* Banner Text Content Column */}
            <div className="md:col-span-7 flex flex-col justify-center items-start text-left z-10 pl-0 md:pl-4">
              
              {/* Yellow Announcement Badge */}
              <div className="mb-4 md:mb-6">
                <span className="bg-[#ffc800] text-[#111111] font-extrabold text-sm md:text-lg px-7 py-2.5 rounded-full inline-block tracking-wider shadow-xs">
                  {slides[currentSlide].badge}
                </span>
              </div>

              {/* Big Bold Headline */}
              <h1 className="text-white font-black text-2xl sm:text-3xl md:text-4xl lg:text-[40px] leading-tight md:leading-[1.18] tracking-tight max-w-2xl">
                {slides[currentSlide].title}
              </h1>

            </div>

          </div>

        </div>

        {/* Yellow Background Bar & Overlapping 3 Action Cards */}
        <div className="relative z-20 px-2 sm:px-4 -mt-16 md:-mt-20">
          
          {/* Full-width Bright Yellow Bar */}
          <div className="bg-[#ffc800] h-20 md:h-24 w-full shadow-xs mb-[-48px] md:mb-[-56px] relative z-0" />

          {/* 3 Action Cards Container */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7 max-w-[1240px] mx-auto pt-4">
            
            {/* CARD 1: INFAK */}
            <div className="bg-[#f6f8fa] rounded-[22px] md:rounded-[26px] p-6 md:p-8 shadow-xl border border-gray-100/90 text-center flex flex-col items-center justify-between min-h-[220px] transition-transform duration-200 hover:-translate-y-1 group">
              <div>
                <h3 className="text-xl md:text-[22px] font-black text-[#2d2d2d] mb-3 tracking-wider">
                  INFAK
                </h3>
                <p className="text-xs md:text-[13px] text-[#555555] leading-relaxed max-w-[280px] mx-auto font-medium">
                  Bersyukur atas rizki, berbagi kebahagian dengan sesama muslim.
                </p>
              </div>

              <div className="mt-6 w-full flex justify-center">
                <Link
                  href="/infaq"
                  className="w-36 md:w-40 py-2.5 px-4 rounded-full border border-[#197814] text-[#197814] font-bold text-sm bg-transparent hover:bg-[#197814] hover:text-white transition-all duration-200 shadow-2xs inline-block text-center cursor-pointer"
                >
                  Infak
                </Link>
              </div>
            </div>

            {/* CARD 2: ZAKAT */}
            <div className="bg-[#f6f8fa] rounded-[22px] md:rounded-[26px] p-6 md:p-8 shadow-xl border border-gray-100/90 text-center flex flex-col items-center justify-between min-h-[220px] transition-transform duration-200 hover:-translate-y-1 group">
              <div>
                <h3 className="text-xl md:text-[22px] font-black text-[#2d2d2d] mb-3 tracking-wider">
                  ZAKAT
                </h3>
                <p className="text-xs md:text-[13px] text-[#555555] leading-relaxed max-w-[280px] mx-auto font-medium">
                  Menyempurnakan rukun islam, mensucikan harta dan mententramkan jiwa.
                </p>
              </div>

              <div className="mt-6 w-full flex justify-center">
                <Link
                  href="/zakat"
                  className="w-36 md:w-40 py-2.5 px-4 rounded-full border border-[#197814] text-[#197814] font-bold text-sm bg-transparent hover:bg-[#197814] hover:text-white transition-all duration-200 shadow-2xs inline-block text-center cursor-pointer"
                >
                  Zakat
                </Link>
              </div>
            </div>

            {/* CARD 3: PROGRAM */}
            <div className="bg-[#f6f8fa] rounded-[22px] md:rounded-[26px] p-6 md:p-8 shadow-xl border border-gray-100/90 text-center flex flex-col items-center justify-between min-h-[220px] transition-transform duration-200 hover:-translate-y-1 group">
              <div>
                <h3 className="text-xl md:text-[22px] font-black text-[#2d2d2d] mb-3 tracking-wider">
                  PROGRAM
                </h3>
                <p className="text-xs md:text-[13px] text-[#555555] leading-relaxed max-w-[280px] mx-auto font-medium">
                  Rumah amal masjid jamik USK menyediakan beberapa program donasi.
                </p>
              </div>

              <div className="mt-6 w-full flex justify-center">
                <Link
                  href="#program"
                  className="w-36 md:w-40 py-2.5 px-4 rounded-full border border-[#197814] text-[#197814] font-bold text-sm bg-transparent hover:bg-[#197814] hover:text-white transition-all duration-200 shadow-2xs inline-block text-center cursor-pointer"
                >
                  Program
                </Link>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ===== PROFIL SECTION ===== */}
      <section id="profil" className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">

        {/* Section Heading */}
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-[22px] md:text-[26px] font-black text-gray-800 tracking-[0.18em] uppercase">
            Profil
          </h2>
          <div className="mt-2.5 w-14 h-[3.5px] bg-[#ffc800] rounded-full" />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch">

          {/* Left: Mosque Image */}
          <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100/80 group min-h-[320px] md:min-h-full relative flex w-full">
            <Image
              src="/profil/mesjid-jamik.png"
              alt="Masjid Jamik Universitas Syiah Kuala"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Right: Text Content */}
          <div className="flex flex-col justify-between gap-6 py-1">

            {/* Upper Content: Title, Paragraph & Link */}
            <div>
              <h3 className="text-[17px] md:text-[19px] font-black text-[#0b6330] tracking-wide uppercase mb-3 leading-snug">
                Rumah Amal Masjid Jamik USK
              </h3>

              <p className="text-[13.5px] md:text-[14px] text-gray-600 leading-relaxed mb-4">
                Kami menyediakan sistem dan layanan yang memudahkan para muzakki atau donatur dalam
                menunaikan zakat, infaq, shadaqah, maupun wakaf dengan sebaik-baiknya. Menjadikan masjid
                sebagai pusat pemberdayaan ekonomi umat, Mendayagunakan dana zakat, infaq shadaqah
                maupun wakaf melalui program-program yang terasa manfaatnya, Mengangkat martabat
                mustahik, dan membahagiakan muzakki dan donatur.
              </p>

              <Link
                href="/profil"
                className="text-[#c49a00] hover:text-[#a07d00] font-semibold text-[13.5px] underline underline-offset-2 transition-colors inline-block"
              >
                Selengkapnya
              </Link>
            </div>

            {/* BSI Bank Info Card */}
            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-md border border-gray-100 flex items-center gap-5 md:gap-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer group">
              <div className="shrink-0 w-24 md:w-28 relative h-12 md:h-14 flex justify-center items-center">
                <Image
                  src="/profil/BSI.png"
                  alt="Bank Syariah Indonesia"
                  fill
                  sizes="120px"
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-col gap-1 text-[13.5px] md:text-[14px] text-gray-800">
                <span className="font-bold">
                  Bank Syariah Indonesia (<span className="text-[#0b6330]">BSI</span>)
                </span>
                <span className="font-bold">
                  No. Rekening: <span className="text-[#0b6330]">7099400409</span>
                </span>
                <span className="font-bold">
                  A.N. <span className="text-[#0b6330]">Rumah Amal Masjid Jamik USK</span>
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER SECTION ===== */}
      <section id="newsletter" className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        
        {/* Section Heading */}
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-[22px] md:text-[26px] font-black text-gray-800 tracking-[0.18em] uppercase">
            Newsletter
          </h2>
          <div className="mt-2.5 w-14 h-[3.5px] bg-[#ffc800] rounded-full" />
        </div>

        {/* Content */}
        {loadingNewsletters ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs">
                <div className="bg-gray-200 rounded-xl aspect-[3/4] w-full mb-4" />
                <div className="bg-gray-200 h-5 w-3/4 rounded-sm mb-3" />
                <div className="bg-gray-200 h-4 w-1/2 rounded-sm" />
              </div>
            ))}
          </div>
        ) : newsletters.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200 mb-8">
            <p className="text-base font-semibold">Belum ada newsletter yang tersedia</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsletters.map((item) => (
              <Link
                key={item.id}
                href={`/newsletter/${item.id}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-2xs hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer flex flex-col p-4 block"
              >
                <div className="relative aspect-[3/4] w-full bg-gray-50 rounded-xl overflow-hidden mb-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={`Newsletter ${item.judul}`}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-xs transition-opacity duration-300">
                      📖 Baca Newsletter
                    </span>
                  </div>
                </div>

                <div className="mt-auto px-1">
                  <h3 className="font-extrabold text-[#111827] text-base tracking-tight mb-2 uppercase leading-snug">
                    NEWSLETTER: {item.judul}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {formatDate(item.tanggal)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Button Selengkapnya */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/newsletter"
            className="bg-[#0b6330] hover:bg-[#084823] text-white font-extrabold text-sm px-10 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 inline-flex items-center justify-center cursor-pointer tracking-wide"
          >
            Selengkapnya
          </Link>
        </div>

      </section>

      {/* ===== MITRA SECTION ===== */}
      <MitraSection />

    </main>
  );
}
