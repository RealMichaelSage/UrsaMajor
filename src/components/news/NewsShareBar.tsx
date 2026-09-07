"use client";

import React, { useState } from "react";
import { Send, Copy, Check, Share2 } from "lucide-react";

export interface NewsShareBarProps {
  title: string;
  url?: string;
}

export function NewsShareBar({ title, url }: NewsShareBarProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "https://ursa-major.ru/news";
  };

  const handleCopy = async () => {
    const shareUrl = getShareUrl();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    const shareUrl = getShareUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  const shareUrl = getShareUrl();
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-3 py-4 border-y border-gray-100 my-8">
      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mr-2">
        <Share2 className="w-3.5 h-3.5 text-[#f8173f]" />
        <span>Поделиться материалом:</span>
      </span>

      {/* Telegram Share */}
      <a
        href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#229ED9]/10 text-[#229ED9] hover:bg-[#229ED9] hover:text-white transition-colors"
        title="Поделиться в Telegram"
      >
        <Send className="w-3 h-3" />
        <span>Telegram</span>
      </a>

      {/* VK Share */}
      <a
        href={`https://vk.com/share.php?url=${encodedUrl}&title=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#0077FF]/10 text-[#0077FF] hover:bg-[#0077FF] hover:text-white transition-colors"
        title="Поделиться во ВКонтакте"
      >
        <span>ВКонтакте</span>
      </a>

      {/* Copy Link Button */}
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
        title="Копировать ссылку на статью"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-emerald-600" />
            <span className="text-emerald-700">Ссылка скопирована!</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3 text-gray-500" />
            <span>Копировать ссылку</span>
          </>
        )}
      </button>

      {/* Native Web Share fallback */}
      <button
        type="button"
        onClick={handleNativeShare}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer sm:hidden"
      >
        <Share2 className="w-3 h-3" />
        <span>Поделиться</span>
      </button>
    </div>
  );
}
