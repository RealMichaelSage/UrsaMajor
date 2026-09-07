"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { NewsCard } from "./NewsCard";
import type { NewsArticle } from "@/shared/types";
import { DEFAULT_NEWS } from "./data";

export interface NewsShowcaseProps {
  initialArticles?: NewsArticle[];
}

export function NewsShowcase({ initialArticles }: NewsShowcaseProps) {
  // Convert seed dates to ISO string representations for client consistency
  const defaultArticles: NewsArticle[] = (initialArticles || DEFAULT_NEWS).slice(0, 3).map((item) => ({
    ...item,
    publishedAt:
      typeof item.publishedAt === "string"
        ? item.publishedAt
        : new Date(item.publishedAt).toISOString(),
    createdAt:
      typeof item.createdAt === "string"
        ? item.createdAt
        : new Date(item.createdAt).toISOString(),
  }));

  const [articles, setArticles] = useState<NewsArticle[]>(defaultArticles);

  useEffect(() => {
    let isMounted = true;
    async function loadLatestNews() {
      try {
        const res = await fetch("/ursa/api/news/?limit=3");
        if (res.ok) {
          const data = await res.json();
          const items = data.news || data.articles;
          if (Array.isArray(items) && items.length > 0 && isMounted) {
            setArticles(items.slice(0, 3));
          }
        }
      } catch {
        // Safe fallback to initial seed
      }
    }
    loadLatestNews();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="news" className="py-20 sm:py-28 bg-[#fbfbf9] border-t border-gray-100 overflow-hidden">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <div className="w-12 h-1 bg-[#f8173f] mb-6" />
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#f8173f] tracking-widest uppercase mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Пульс рынка и новости</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#111111] tracking-tight uppercase mb-4">
              Новости и аналитика
            </h2>
            <p className="text-base sm:text-lg font-light text-gray-600 leading-relaxed">
              Аналитические дайджесты, венчурные сделки членов ассоциации, законодательные инициативы и экспертные комментарии лидеров рынка.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Link
              href="/news"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#f8173f] text-[#111111] hover:bg-[#f8173f] hover:text-white transition-all text-xs sm:text-sm font-semibold tracking-wider uppercase group whitespace-nowrap shadow-sm"
            >
              <span>Все новости →</span>
              <ArrowUpRight className="w-4 h-4 text-[#f8173f] group-hover:text-white transition-colors" />
            </Link>
          </div>
        </div>

        {/* 3-Column Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} featured />
          ))}
        </div>

        {/* Mobile-only bottom navigation */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/news"
            className="inline-flex items-center justify-center w-full py-3 bg-white border border-[#f8173f] text-[#111111] font-semibold text-xs uppercase tracking-wider hover:bg-[#f8173f] hover:text-white transition-colors"
          >
            Все новости →
          </Link>
        </div>
      </div>
    </section>
  );
}
