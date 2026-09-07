import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowUpRight, Building2, Tag } from "lucide-react";
import type { NewsArticle } from "@/shared/types";
import { getAssetUrl } from "@/shared/lib/assets";

export interface NewsCardProps {
  article: NewsArticle;
  featured?: boolean;
  className?: string;
}

export function formatRussianDate(dateStr: string | Date | undefined): string {
  if (!dateStr) return "";
  try {
    const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function calculateReadingTime(text: string | undefined): number {
  if (!text) return 3;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 150));
}

export function NewsCard({ article, featured = false, className = "" }: NewsCardProps) {
  const readTime = calculateReadingTime(article.content || article.summary);
  const formattedDate = formatRussianDate(article.publishedAt);
  const primaryTag = article.tags && article.tags.length > 0 ? article.tags[0] : "Аналитика";
  const imageSrc = getAssetUrl(article.imageUrl || "/assets/news/default-news.jpg");

  return (
    <article
      className={`card group relative flex flex-col bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden h-full ${className}`}
    >
      <Link
        href={`/news/${article.id}`}
        className="flex flex-col flex-1"
        aria-label={article.title}
      >
        {/* 16:9 Thumbnail Image Container */}
        <div className="relative w-full aspect-video bg-[#1a2e35] overflow-hidden">
          <Image
            src={imageSrc}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* Category Tag Pill Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-white/95 text-[#1a2e35] backdrop-blur-sm border border-gray-100 shadow-sm">
              {primaryTag}
            </span>
          </div>

          {/* Reading Time Badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-[#1a2e35]/85 text-white backdrop-blur-sm shadow-sm">
              <Clock className="w-3 h-3 text-[#f8173f]" />
              <span>{readTime} мин чтения</span>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 flex flex-col flex-1">
          {/* Metadata Row: Source Attribution & Publishing Date */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 mb-3">
            <div className="inline-flex items-center gap-1.5 font-semibold text-[#f8173f] uppercase tracking-wider truncate max-w-[220px]">
              <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{article.authorOrSource}</span>
            </div>
            {formattedDate && (
              <time
                dateTime={String(article.publishedAt)}
                className="text-gray-400 font-light"
              >
                {formattedDate}
              </time>
            )}
          </div>

          {/* Article Title */}
          <h3
            className={`font-bold text-[#111111] group-hover:text-[#f8173f] transition-colors leading-snug tracking-tight mb-3 line-clamp-2 ${
              featured ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
            }`}
          >
            {article.title}
          </h3>

          {/* Article Excerpt / Summary */}
          <p className="text-sm font-light text-gray-600 leading-relaxed line-clamp-3 mb-5 flex-1">
            {article.summary}
          </p>

          {/* Footer Metadata: Tag Pills & Action Link */}
          <div className="pt-4 border-t border-gray-100 mt-auto flex flex-col gap-3">
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {article.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-gray-600 bg-gray-50 border border-gray-200/60"
                  >
                    <Tag className="w-2.5 h-2.5 text-gray-400" />
                    <span>#{tag}</span>
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-gray-400 font-normal">
                {readTime} мин. чтения
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#f8173f] group-hover:translate-x-1 transition-transform">
                <span>Читать далее</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
