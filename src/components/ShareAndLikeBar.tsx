'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';

interface ShareAndLikeBarProps {
  contentType: 'news' | 'announcements' | 'program' | 'newsletter' | 'kampanye' | 'gallery' | string;
  contentId: string;
  title: string;
  initialLikesCount?: number;
  lang?: 'id' | 'en' | 'ar';
  className?: string;
  compact?: boolean;
}

export default function ShareAndLikeBar({
  contentType,
  contentId,
  title,
  initialLikesCount = 0,
  lang = 'id',
  className = '',
  compact = false,
}: ShareAndLikeBarProps) {
  const [likesCount, setLikesCount] = useState<number>(initialLikesCount ?? 0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [copiedInstagram, setCopiedInstagram] = useState<boolean>(false);

  // Fetch latest total likes count from DB on mount / contentId change
  useEffect(() => {
    if (!contentId) return;
    let isMounted = true;

    async function fetchLatestLikes() {
      try {
        const res = await fetch(`/api/likes?type=${encodeURIComponent(contentType)}&id=${encodeURIComponent(contentId)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && typeof data.likesCount === 'number') {
            setLikesCount(data.likesCount);
          }
        }
      } catch (err) {
        console.error('Error fetching likes:', err);
      }
    }

    fetchLatestLikes();

    return () => {
      isMounted = false;
    };
  }, [contentType, contentId]);

  const handleToggleLike = async () => {
    if (isLiking || !contentId) return;

    const nextLikedState = !isLiked;
    const nextCount = nextLikedState ? likesCount + 1 : Math.max(0, likesCount - 1);

    // Optimistic state update
    setIsLiked(nextLikedState);
    setLikesCount(nextCount);
    setIsLiking(true);

    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: contentType,
          id: contentId,
          action: nextLikedState ? 'like' : 'unlike',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (typeof data.likesCount === 'number') {
          setLikesCount(data.likesCount);
        }
      } else {
        const errorText = await res.text();
        console.error('API likes error:', res.status, errorText);
      }
    } catch (err) {
      console.error('Error updating like:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const getCurrentUrl = () => {
    if (typeof window !== 'undefined') {
      const current = window.location.href;
      try {
        const urlObj = new URL(current);
        if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
          return `https://rumahamal.usk.ac.id${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
        }
      } catch {
        // Fallback
      }
      return current;
    }
    return 'https://rumahamal.usk.ac.id';
  };

  const handleCopyLink = () => {
    const url = getCurrentUrl();
    if (url && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setShowTooltip(true);
      setTimeout(() => {
        setShowTooltip(false);
      }, 2500);
    }
  };

  const handleInstagramShare = () => {
    const url = getCurrentUrl();
    if (url && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedInstagram(true);
      setTimeout(() => setCopiedInstagram(false), 2500);
    }
    window.open('https://www.instagram.com', '_blank');
  };

  const handleWhatsAppShare = () => {
    const url = getCurrentUrl();
    const shareText = `${title}\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleFacebookShare = () => {
    const url = getCurrentUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const getLabelBagikan = () => {
    if (lang === 'ar') return 'مشاركة:';
    if (lang === 'en') return 'Share:';
    return 'Bagikan:';
  };

  const getTooltipText = () => {
    if (lang === 'ar') return ['تم نسخ', 'الرابط!'];
    if (lang === 'en') return ['Link has been', 'copied!'];
    return ['Tautan telah', 'disalin!'];
  };

  const [tooltipLine1, tooltipLine2] = getTooltipText();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Bar: Like Button & Count */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          {/* Tombol Like */}
          <button
            type="button"
            onClick={handleToggleLike}
            disabled={isLiking}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all duration-200 cursor-pointer shadow-2xs ${
              isLiked
                ? 'bg-rose-50 border-rose-200 text-rose-600 font-extrabold hover:bg-rose-100'
                : 'bg-white border-gray-200 text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 hover:text-rose-600'
            }`}
            title={isLiked ? 'Batal Suka' : 'Sukai Konten Ini'}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${
                isLiked ? 'scale-110 fill-rose-500 stroke-rose-500' : 'fill-none stroke-current'
              }`}
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.684a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm font-extrabold">{likesCount}</span>
            <span className="text-xs text-gray-500 font-medium">
              {lang === 'ar' ? 'إعجاب' : lang === 'en' ? 'Likes' : 'Suka'}
            </span>
          </button>
        </div>
      </div>

      {/* Share Section */}
      <div className="pt-2">
        <p className="font-bold text-gray-900 text-base mb-3 tracking-tight">
          {getLabelBagikan()}
        </p>

        {/* 4 Social Share Buttons Grid */}
        <div className="flex items-center gap-3.5 flex-wrap">
          {/* Instagram Button */}
          <button
            type="button"
            onClick={handleInstagramShare}
            className="relative group w-12 h-12 rounded-2xl bg-[#ea4c89] hover:bg-[#e1306c] text-white flex items-center justify-center shadow-md hover:scale-105 transition-all duration-200 cursor-pointer"
            title="Bagikan ke Instagram"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            {copiedInstagram && (
              <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#006400] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap z-20 animate-bounce">
                Tautan disalin!
              </span>
            )}
          </button>

          {/* WhatsApp Button */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="w-12 h-12 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-md hover:scale-105 transition-all duration-200 cursor-pointer"
            title="Bagikan ke WhatsApp"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
            </svg>
          </button>

          {/* Facebook Button */}
          <button
            type="button"
            onClick={handleFacebookShare}
            className="w-12 h-12 rounded-2xl bg-[#1877F2] hover:bg-[#1565d8] text-white flex items-center justify-center shadow-md hover:scale-105 transition-all duration-200 cursor-pointer"
            title="Bagikan ke Facebook"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>

          {/* Copy Link Button with Speech-Bubble Tooltip */}
          <div className="relative inline-block">
            {/* Tooltip Speech Bubble (Matching User Image 2) */}
            {showTooltip && (
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center animate-fade-in">
                <div className="bg-[#006400] text-white font-extrabold text-xs py-2 px-3.5 rounded-xl shadow-xl text-center leading-tight whitespace-nowrap min-w-[120px]">
                  <div>{tooltipLine1}</div>
                  <div>{tooltipLine2}</div>
                </div>
                {/* Downward Pointer Triangle */}
                <div className="w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-[#006400] -mt-0.5" />
              </div>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className="w-12 h-12 rounded-2xl bg-[#e5e7eb] hover:bg-gray-300 text-gray-700 flex items-center justify-center shadow-xs hover:scale-105 transition-all duration-200 cursor-pointer"
              title="Salin Tautan"
            >
              <FontAwesomeIcon icon={faLink} className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
