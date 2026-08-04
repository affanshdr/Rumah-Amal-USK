"use client";

interface MediaSocialProps {
  youtubeVideoId?: string;
  youtubeUrl?: string;
  instagramUsername?: string;
  instagramUrl?: string;
}

export default function MediaSocialSection({
  youtubeVideoId = "0ziMD3tq-AM",
  youtubeUrl = "https://youtu.be/0ziMD3tq-AM?si=_5f8gyQVmCC3BPPz",
  instagramUsername = "rumahamal.usk",
  instagramUrl = "https://www.instagram.com/rumahamal.usk/",
}: MediaSocialProps) {
  const embedUrl = `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=0&rel=0`;

  // 6 exact posts matching official @rumahamal.usk Instagram feed
  const instagramPosts = [
    {
      id: "ig-1",
      imageUrl: "/instagram/ig1.png",
      caption: "Selamat & Sukses Amal Prestasi",
      url: instagramUrl,
    },
    {
      id: "ig-2",
      imageUrl: "/instagram/ig2.png",
      caption: "Peserta Webinar & Zoom Meeting",
      url: instagramUrl,
    },
    {
      id: "ig-3",
      imageUrl: "/instagram/ig3.png",
      caption: "Sosialisasi Zakat Rumah Amal USK",
      url: instagramUrl,
    },
    {
      id: "ig-4",
      imageUrl: "/instagram/ig4.png",
      caption: "Keutamaan Duduk di Shaf Pertama",
      url: instagramUrl,
    },
    {
      id: "ig-5",
      imageUrl: "/instagram/ig5.png",
      caption: "Mahir Series #36: Drg. Iin Sundari M.Si",
      url: instagramUrl,
    },
    {
      id: "ig-6",
      imageUrl: "/instagram/ig6.png",
      caption: "Coba di Zoom",
      url: instagramUrl,
    },
  ];

  return (
    <section className="w-full max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        
        {/* Left Column: YouTube Video Embed */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="relative w-full h-full min-h-[300px] sm:min-h-[380px] md:min-h-[440px] bg-black rounded-2xl overflow-hidden shadow-lg border border-gray-200 group">
            <iframe
              src={embedUrl}
              title="YouTube Video Rumah Amal USK"
              className="w-full h-full absolute inset-0 border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>

        {/* Right Column: Instagram Feed Widget */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-4 sm:p-5 flex flex-col justify-between h-full">
            
            {/* Instagram Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 p-0.5 shadow-xs">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/logo/rumah-amal.png"
                      alt="Rumah Amal USK"
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                </div>
                <div>
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-black text-gray-900 text-sm hover:underline block leading-tight"
                  >
                    {instagramUsername}
                  </a>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                    RUMAH AMAL MASJID JAMIK USK
                  </p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                    15.8K followers &bull; 1,851 posts
                  </p>
                </div>
              </div>

              {/* Instagram Icon */}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:text-pink-700 transition-transform hover:scale-110"
                aria-label="Instagram Profile"
              >
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>

            {/* 6 Exact Instagram Post Grid Items */}
            <div className="grid grid-cols-3 gap-2 flex-1">
              {instagramPosts.map((post) => (
                <a
                  key={post.id}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group border border-gray-100 block"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.imageUrl}
                    alt={post.caption}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center p-2">
                    <p className="opacity-0 group-hover:opacity-100 text-white text-[10px] font-bold text-center transition-opacity leading-tight line-clamp-3">
                      {post.caption}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* Follow Instagram Button */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-center">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:opacity-95 text-white font-bold text-xs rounded-xl text-center shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Follow @{instagramUsername} di Instagram</span> ↗
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
