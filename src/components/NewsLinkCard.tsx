'use client';

interface NewsLinkCardProps {
  url: string;
  title: string;
  image: string | null;
  description: string | null;
  source: string | null;
}

export default function NewsLinkCard({
  url,
  title,
  image,
  description,
  source,
}: NewsLinkCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Gambar */}
      <div className="relative aspect-video w-full bg-gray-100 overflow-hidden flex-shrink-0">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 gap-2">
            <svg
              className="w-8 h-8 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            <span className="text-xs text-gray-400 font-medium">Berita</span>
          </div>
        )}

        {/* Source badge di atas gambar */}
        {source && (
          <span className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg tracking-wide">
            {source}
          </span>
        )}

        {/* External link icon */}
        <span className="absolute top-2 right-2 w-6 h-6 bg-black/50 backdrop-blur-sm rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 gap-2">
        <h3 className="text-sm sm:text-[15px] font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-[#0b6330] transition-colors">
          {title}
        </h3>

        {description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed flex-1">
            {description}
          </p>
        )}

        <div className="flex items-center gap-1.5 mt-auto pt-1">
          <svg className="w-3 h-3 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span className="text-[11px] text-gray-400 font-medium truncate">
            {source || new URL(url).hostname.replace('www.', '')}
          </span>
        </div>
      </div>
    </a>
  );
}
