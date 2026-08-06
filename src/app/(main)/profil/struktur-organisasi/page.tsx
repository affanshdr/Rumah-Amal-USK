"use client";

import Image from "next/image";
import { useProfilLang } from "../layout";

export default function StrukturOrganisasiPage() {
  const { dict, lang } = useProfilLang();
  const so = dict.strukturOrganisasi;

  return (
    <div className="flex flex-col items-center gap-6">
      
      {/* Title */}
      <div className="flex flex-col items-center mb-4">
        <h3 className={`text-2xl md:text-3xl font-black text-gray-800 tracking-wide uppercase text-center leading-tight ${lang === 'ar' ? 'font-serif' : ''}`}>
          {so.title}
        </h3>
        <div className="mt-2.5 w-14 h-[3.5px] bg-[#ffc800] rounded-full" />
      </div>

      {/* Structure Image */}
      <div className="w-full relative rounded-2xl overflow-hidden shadow-xs border border-gray-100/80 bg-white p-2">
        <Image
          src="/profil/struktur-organisasi.png"
          alt="Struktur Organisasi Rumah Amal USK"
          width={1200}
          height={800}
          priority
          sizes="(max-width: 1024px) 100vw, 800px"
          className="w-full h-auto object-contain"
        />
      </div>

    </div>
  );
}
