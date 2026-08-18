"use client";

import { useState } from "react";

interface MediaSocialProps {
  youtubeVideoId?: string;
  youtubeUrl?: string;
  instagramUsername?: string;
  instagramUrl?: string;
  instagramPostUrl?: string;
}

function extractShortcode(input?: string): string | null {
  if (!input) return null;
  const match = input.match(/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  if (match && match[1]) return match[1];
  return null;
}

const IG_ICON = (
  <svg className="w-full h-full fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

export default function MediaSocialSection({
  youtubeVideoId = "0ziMD3tq-AM",
  instagramUsername = "rumahamal.usk",
  instagramUrl = "https://www.instagram.com/rumahamal.usk/",
  instagramPostUrl = "",
}: MediaSocialProps) {
  const embedYoutubeUrl = `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=0&rel=0`;
  const shortcode = extractShortcode(instagramPostUrl);

  const [activeTab, setActiveTab] = useState<"post" | "grid">("post");

  const placeholderTiles = [
    "Selamat & Sukses Amal Prestasi",
    "Peserta Webinar & Zoom Meeting",
    "Sosialisasi Zakat Rumah Amal USK",
    "Keutamaan Duduk di Shaf Pertama",
    "Mahir Series #36",
    "Update Terbaru Rumah Amal",
  ];

  return (
    <section className="w-full max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <div className="relative w-full h-full min-h-[320px] sm:min-h-[400px] md:min-h-[460px] bg-black rounded-2xl overflow-hidden shadow-lg border border-gray-200">
            <iframe
              src={embedYoutubeUrl}
              title="YouTube Video Rumah Amal USK"
              className="w-full h-full absolute inset-0 border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-4 sm:p-5 flex flex-col gap-3 h-full min-h-[440px]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-amber-400 p-0.5 shadow-xs flex-shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo/rumah-amal.png" alt="Logo Rumah Amal USK" className="w-full h-full object-contain p-1" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                      className="font-black text-gray-900 text-sm hover:underline leading-tight">
                      @{instagramUsername}
                    </a>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-pink-100 text-pink-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
                      Instagram
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">
                    Rumah Amal Masjid Jamik USK
                  </p>
                </div>
              </div>

              {shortcode && (
                <div className="flex items-center bg-gray-100 p-1 rounded-xl gap-1">
                  {(["post", "grid"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer capitalize ${
                        activeTab === tab
                          ? "bg-white text-gray-900 shadow-xs"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      {tab === "post" ? "Post" : "Grid"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              {shortcode && activeTab === "post" ? (
                <div className="flex-1 min-h-[340px] sm:min-h-[380px] bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-xs">
                  <iframe
                    src={`https://www.instagram.com/p/${shortcode}/embed`}
                    title="Instagram Post Rumah Amal USK"
                    className="w-full h-full min-h-[360px] border-0 bg-white"
                    allowTransparency
                    scrolling="no"
                  />
                </div>
              ) : shortcode && activeTab === "grid" ? (
                <div className="grid grid-cols-3 gap-2 flex-1 items-start content-start">
                  {placeholderTiles.map((caption, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTab("post")}
                      title={caption}
                      className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 group border border-pink-100 hover:border-pink-300 transition-all cursor-pointer flex flex-col items-center justify-center p-2 gap-1"
                    >
                      <span className="w-6 h-6 text-pink-400">{IG_ICON}</span>
                      <p className="text-[8px] text-pink-500 font-bold text-center leading-tight line-clamp-2">{caption}</p>
                      <div className="absolute inset-0 bg-pink-500/0 group-hover:bg-pink-500/10 transition-colors rounded-xl" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-xl border border-pink-100 p-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg p-4 text-white">
                    {IG_ICON}
                  </div>
                  <div className="text-center">
                    <p className="text-base font-black text-gray-800">@{instagramUsername}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-snug">
                      Ikuti kami di Instagram untuk update kegiatan terbaru Rumah Amal USK
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-center">
                    <div>
                      <p className="text-sm font-black text-gray-800">15.8K</p>
                      <p className="text-[10px] text-gray-400 font-semibold">Followers</p>
                    </div>
                    <div className="w-px h-6 bg-gray-200" />
                    <div>
                      <p className="text-sm font-black text-gray-800">1,851</p>
                      <p className="text-[10px] text-gray-400 font-semibold">Posts</p>
                    </div>
                    <div className="w-px h-6 bg-gray-200" />
                    <div>
                      <p className="text-sm font-black text-gray-800">Sejak 2018</p>
                      <p className="text-[10px] text-gray-400 font-semibold">Bergabung</p>
                    </div>
                  </div>
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Buka Profil Instagram ↗
                  </a>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:opacity-95 text-white font-bold text-xs rounded-xl text-center shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Lihat Profil @{instagramUsername} di Instagram</span> ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
